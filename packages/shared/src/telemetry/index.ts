/**
 * Telemetry SDK Public API
 */

import { TelemetrySDK, TelemetryConfig } from './tracker';

export * from './crypto';
export * from './tracker';

let globalTelemetry: TelemetrySDK | null = null;

/**
 * 初始化全局行为上报 SDK
 */
export function initTelemetry(config: TelemetryConfig = {}): TelemetrySDK {
  if (!globalTelemetry) {
    globalTelemetry = new TelemetrySDK(config);
  }
  return globalTelemetry;
}

/**
 * 获取当前全局上报实例
 */
export function getTelemetry(): TelemetrySDK | null {
  return globalTelemetry;
}

/**
 * 手动上报关键自定义业务事件（如 "parquet_uploaded", "sql_executed" 等）
 */
export function trackEvent(name: string, details?: Record<string, any>): void {
  globalTelemetry?.track('a', name, details);
}

/**
 * 路由切换手动打点（用于 SPA 路由流转分析）
 */
export function trackRoute(path: string): void {
  globalTelemetry?.track('r', `Nav: ${path}`);
}
