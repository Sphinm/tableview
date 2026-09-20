/**
 * Telemetry Tracker & Batch Dispatcher
 *
 * Captures user clicks, errors, route navigation, and active dwell time.
 * Batches events, compresses, encrypts, and sends non-blockingly via idle callbacks.
 */

import { SuiteType, resolveSuiteForPath } from '../domainRoutes';
import { gzipCompress, encryptLogPayload } from './crypto';

export interface CompactEvent {
  t: number;               // 相对会话开始的毫秒偏移量
  y: 'c' | 'r' | 'e' | 'a';// c: click, r: route, e: error, a: custom action
  n: string;               // 动作名称 / 语义描述
  d?: Record<string, any>; // 附加元数据
}

export interface TelemetryConfig {
  app?: SuiteType;
  endpoint?: string;
  batchSize?: number;
  flushIntervalMs?: number;
  maxBufferSize?: number;
  customSecret?: string;
  enabled?: boolean;
}

export class TelemetrySDK {
  private sessionId = 's_' + Math.random().toString(36).slice(2, 10);
  private startTime = Date.now();
  private activeTime = 0;
  private lastVisibleTime = Date.now();
  private buffer: CompactEvent[] = [];
  private actionCount = 0;
  private errorCount = 0;
  private isFlushing = false;
  private timer: any = null;

  public readonly app: SuiteType;
  public readonly endpoint: string;
  public readonly batchSize: number;
  public readonly flushIntervalMs: number;
  public readonly maxBufferSize: number;
  public readonly customSecret?: string;
  public readonly enabled: boolean;

  constructor(config: TelemetryConfig = {}) {
    this.app = config.app || (typeof window !== 'undefined' ? resolveSuiteForPath(window.location.pathname) : 'finance');
    this.endpoint = config.endpoint || 'https://track.tableview.dev/api/track';
    this.batchSize = config.batchSize ?? 15;
    this.flushIntervalMs = config.flushIntervalMs ?? 10000;
    this.maxBufferSize = config.maxBufferSize ?? 100;
    this.customSecret = config.customSecret;
    this.enabled = config.enabled ?? true;

    if (typeof window !== 'undefined' && this.enabled) {
      this.initListeners();
      this.startHeartbeat();
    }
  }

  /**
   * 手动记录业务事件
   */
  public track(type: CompactEvent['y'], name: string, details?: Record<string, any>) {
    if (!this.enabled) return;

    const event: CompactEvent = {
      t: Date.now() - this.startTime,
      y: type,
      n: name.slice(0, 80),
      d: details,
    };

    this.buffer.push(event);

    // 内存队列超限保护
    if (this.buffer.length > this.maxBufferSize) {
      this.buffer.shift();
    }

    // 达到阈值触发空闲排空
    if (this.buffer.length >= this.batchSize) {
      this.scheduleFlush();
    }
  }

  private initListeners() {
    // 1. 无感点击采集（使用 passive + capture，不阻塞交互与动画）
    document.addEventListener(
      'click',
      (e) => {
        const target = (e.target as HTMLElement | null)?.closest?.(
          'button, a, input[type="button"], input[type="submit"], [data-track], [role="button"]'
        ) as HTMLElement | null;

        if (!target) return;

        // 隐私脱敏：遇到密码或显式敏感标记不提取文字
        const isPrivate =
          target.closest('[data-private], [data-mask], .mask, .private') ||
          (target as HTMLInputElement).type === 'password';

        this.actionCount++;
        let label = 'unknown';
        if (isPrivate) {
          label = '***';
        } else {
          label =
            target.getAttribute('data-track') ||
            target.getAttribute('aria-label') ||
            target.textContent?.trim().slice(0, 30) ||
            target.tagName.toLowerCase();
        }

        this.track('c', `Click: ${label}`, {
          tag: target.tagName.toLowerCase(),
          id: target.id || undefined,
        });
      },
      { passive: true, capture: true }
    );

    // 2. 全局未捕获错误监控
    window.addEventListener('error', (event) => {
      this.errorCount++;
      const filename = event.filename ? event.filename.split('/').pop() : undefined;
      this.track('e', event.message || 'Script Error', {
        file: filename,
        line: event.lineno,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.errorCount++;
      const reasonStr = String(event.reason?.message || event.reason || 'Unhandled Promise');
      this.track('e', `Reject: ${reasonStr.slice(0, 80)}`);
    });

    // 3. 停留时长与页面可见性追踪
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.activeTime += Date.now() - this.lastVisibleTime;
        // 用户切后台时触发一次紧急上报，防进程被杀丢失
        this.flush(true);
      } else {
        this.lastVisibleTime = Date.now();
      }
    });

    // 4. 页面关闭/卸载保证上报
    window.addEventListener('pagehide', () => {
      this.flush(true);
    });
  }

  private startHeartbeat() {
    this.timer = setInterval(() => {
      if (this.buffer.length > 0) {
        this.scheduleFlush();
      }
    }, this.flushIntervalMs);
  }

  /**
   * 利用 requestIdleCallback 在浏览器主线程空闲时打包压缩并发送
   */
  private scheduleFlush() {
    if (this.isFlushing || this.buffer.length === 0) return;

    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => this.flush(false), { timeout: 2000 });
    } else {
      setTimeout(() => this.flush(false), 0);
    }
  }

  /**
   * 核心打包、压缩、加密并上报
   */
  public async flush(isEmergency = false): Promise<void> {
    if (!this.enabled || (this.buffer.length === 0 && !isEmergency)) {
      return;
    }

    this.isFlushing = true;

    // 更新活跃时长
    if (typeof document !== 'undefined' && !document.hidden) {
      this.activeTime += Date.now() - this.lastVisibleTime;
      this.lastVisibleTime = Date.now();
    }

    const eventsToSend = [...this.buffer];
    this.buffer = []; // 清空当前批次

    const payload = {
      sid: this.sessionId,
      app: this.app,
      p: typeof window !== 'undefined' ? window.location.pathname : '/',
      dur: Math.round((Date.now() - this.startTime) / 1000),
      act: Math.round(this.activeTime / 1000),
      actions: this.actionCount,
      errors: this.errorCount,
      events: eventsToSend,
    };

    try {
      // 1. JSON 序列化
      const jsonStr = JSON.stringify(payload);

      // 2. 原生 Gzip 压缩 (减少 80% 体积)
      const compressed = await gzipCompress(jsonStr);

      // 3. 原生 AES-GCM 加密 (使用内置混淆 Key 动态还原)
      const encrypted = await encryptLogPayload(compressed, this.customSecret);

      // Deliberately untyped. The body is opaque encrypted bytes, and a
      // non-safelisted Content-Type would force a CORS preflight. The beacon
      // path below runs on every pagehide/visibilitychange, and a beacon cannot
      // perform a preflight, so the browser would silently drop exactly the
      // session-end events that carry dwell time. Leaving the type empty keeps
      // the request "simple" for both fetch and sendBeacon.
      const blob = new Blob([encrypted as any]);

      if (isEmergency && typeof navigator !== 'undefined' && navigator.sendBeacon) {
        // Best-effort during unload. A false return means the browser queue
        // refused it, so fall through to the restore path below.
        if (!navigator.sendBeacon(this.endpoint, blob)) {
          throw new Error('sendBeacon refused the telemetry batch');
        }
      } else {
        const response = await fetch(this.endpoint, {
          method: 'POST',
          body: blob,
          keepalive: true,
        });

        // A 4xx means the payload itself is unacceptable — malformed, or over
        // the size/event cap on the server. Retrying identical bytes could never
        // succeed, so the batch is dropped on purpose instead of restored:
        // otherwise one bad batch would wedge the buffer and evict every new
        // event behind it.
        if (!response.ok && response.status >= 400 && response.status < 500) {
          return;
        }

        // 5xx and anything else is transient, so let the catch below restore the
        // batch for a later retry. Previously a non-ok response was treated as
        // success and the whole batch was discarded silently.
        if (!response.ok) {
          throw new Error(`Telemetry endpoint returned ${response.status}`);
        }
      }
    } catch {
      // 失败还原未发送成功的事件
      this.buffer.unshift(...eventsToSend);
      if (this.buffer.length > this.maxBufferSize) {
        this.buffer = this.buffer.slice(0, this.maxBufferSize);
      }
    } finally {
      this.isFlushing = false;
    }
  }

  public destroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
