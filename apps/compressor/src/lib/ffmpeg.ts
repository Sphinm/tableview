import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;
let isLoaded = false;
let isLoading = false;

export interface VideoMetadata {
  name: string;
  size: number;
  duration: number; // in seconds
  width: number;
  height: number;
  aspectRatio: string;
  hasAudio: boolean;
}

export interface CompressOptions {
  mode: 'preset' | 'target_size' | 'advanced';
  presetPercentage?: number; // 90, 70, 50, 30 (% smaller)
  targetSizeBytes?: number;
  resolution?: 'original' | '1080p' | '720p' | '480p';
  crf?: number; // 18 - 36
  speedPreset?: 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'medium';
  muteAudio?: boolean;
  codec?: 'libx264';
}

export interface CompressResult {
  blob: Blob;
  url: string;
  size: number;
  duration: number;
  savedPercentage: number;
}

/**
 * Extract video metadata using browser native HTML5 video element
 */
export async function getVideoMetadata(file: File | Blob, fileName: string = 'video.mp4'): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    const url = URL.createObjectURL(file);
    video.src = url;

    video.onloadedmetadata = () => {
      const width = video.videoWidth || 1920;
      const height = video.videoHeight || 1080;
      const duration = video.duration || 0;
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const divisor = gcd(width, height);
      const aspectRatio = `${width / divisor}:${height / divisor}`;
      
      // Determine if video likely has audio
      const hasAudio =
        (video as any).mozHasAudio ||
        Boolean((video as any).webkitAudioDecodedByteCount) ||
        Boolean((video as any).audioTracks?.length) ||
        true;

      URL.revokeObjectURL(url);
      resolve({
        name: fileName,
        size: file.size,
        duration,
        width,
        height,
        aspectRatio,
        hasAudio,
      });
    };

    video.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video metadata: ' + e));
    };
  });
}

/**
 * Singleton loader for FFmpeg WebAssembly core
 */
export async function getFFmpeg(onLog?: (msg: string) => void): Promise<FFmpeg> {
  if (ffmpegInstance && isLoaded) {
    return ffmpegInstance;
  }

  if (isLoading) {
    // Wait for in-progress load
    while (isLoading) {
      await new Promise((r) => setTimeout(r, 100));
    }
    if (ffmpegInstance && isLoaded) return ffmpegInstance;
  }

  isLoading = true;
  const ffmpeg = new FFmpeg();

  if (onLog) {
    ffmpeg.on('log', ({ message }) => onLog(message));
  }

  try {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
    const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');

    await ffmpeg.load({
      coreURL,
      wasmURL,
    });

    ffmpegInstance = ffmpeg;
    isLoaded = true;
    return ffmpeg;
  } catch (err) {
    console.error('Failed to load FFmpeg.wasm from unpkg, trying cdnjs/jsdelivr fallback...', err);
    try {
      const fallbackURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm';
      const coreURL = await toBlobURL(`${fallbackURL}/ffmpeg-core.js`, 'text/javascript');
      const wasmURL = await toBlobURL(`${fallbackURL}/ffmpeg-core.wasm`, 'application/wasm');

      await ffmpeg.load({
        coreURL,
        wasmURL,
      });

      ffmpegInstance = ffmpeg;
      isLoaded = true;
      return ffmpeg;
    } catch (fallbackErr) {
      throw new Error(`Failed to load video compression engine: ${fallbackErr}`);
    }
  } finally {
    isLoading = false;
  }
}

/**
 * Calculate expected file size in bytes based on options
 */
export function estimateOutputSize(originalBytes: number, options: CompressOptions, _durationSeconds?: number): number {
  if (options.mode === 'target_size' && options.targetSizeBytes) {
    return Math.min(options.targetSizeBytes, originalBytes * 0.98);
  }

  if (options.mode === 'preset') {
    const pct = options.presetPercentage || 70;
    // e.g. 70% smaller means output is 30% of original
    const ratio = (100 - pct) / 100;
    return Math.max(Math.round(originalBytes * ratio), 50 * 1024); // at least 50KB
  }

  // Advanced mode calculation
  let factor = 0.5; // default 50%
  if (options.crf) {
    // CRF 18 ~ 1.0, CRF 28 ~ 0.35, CRF 35 ~ 0.15
    factor = Math.max(0.1, 1 - (options.crf - 18) * 0.05);
  }
  if (options.resolution === '720p') factor *= 0.65;
  if (options.resolution === '480p') factor *= 0.4;
  if (options.muteAudio) factor *= 0.88;

  return Math.max(Math.round(originalBytes * factor), 50 * 1024);
}

/**
 * Format bytes into human-readable string (MB, KB)
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Run video compression via FFmpeg.wasm in browser
 */
export async function compressVideo(
  file: File | Blob,
  meta: VideoMetadata,
  options: CompressOptions,
  onProgress?: (progressPercent: number) => void
): Promise<CompressResult> {
  const ffmpeg = await getFFmpeg();

  const inputName = 'input_' + Date.now() + '.mp4';
  const outputName = 'output_' + Date.now() + '.mp4';

  const progressHandler = ({ progress }: { progress: number }) => {
    if (onProgress) {
      const pct = Math.min(Math.round(progress * 100), 99);
      onProgress(pct);
    }
  };

  ffmpeg.on('progress', progressHandler);

  try {
    // Write input file to in-memory virtual filesystem
    const fileData = await fetchFile(file);
    await ffmpeg.writeFile(inputName, fileData);

    // Build FFmpeg command arguments
    const args: string[] = ['-i', inputName];

    // Video filters (Scale / Resolution)
    let scaleFilter = '';
    if (options.resolution === '1080p') {
      scaleFilter = 'scale=-2:1080';
    } else if (options.resolution === '720p') {
      scaleFilter = 'scale=-2:720';
    } else if (options.resolution === '480p') {
      scaleFilter = 'scale=-2:480';
    } else if (options.mode === 'preset') {
      if (options.presetPercentage === 90) {
        scaleFilter = 'scale=-2:480';
      } else if (options.presetPercentage === 70) {
        scaleFilter = 'scale=-2:720';
      }
    }

    if (scaleFilter) {
      args.push('-vf', scaleFilter);
    }

    // Video codec & CRF / Bitrate
    args.push('-c:v', 'libx264');

    if (options.mode === 'target_size' && options.targetSizeBytes && meta.duration > 0) {
      // Calculate target bitrate in kbps: (targetBytes * 8) / durationSeconds - audioRate
      const targetAudioKbits = options.muteAudio ? 0 : 96;
      const targetTotalKbits = (options.targetSizeBytes * 8) / 1000;
      const targetVideoKbits = Math.max(Math.floor((targetTotalKbits / meta.duration) - targetAudioKbits), 100);
      
      args.push('-b:v', `${targetVideoKbits}k`);
      args.push('-maxrate', `${Math.round(targetVideoKbits * 1.3)}k`);
      args.push('-bufsize', `${Math.round(targetVideoKbits * 2)}k`);
    } else {
      let crf = 28;
      if (options.mode === 'preset') {
        if (options.presetPercentage === 90) crf = 33;
        else if (options.presetPercentage === 70) crf = 28;
        else if (options.presetPercentage === 50) crf = 24;
        else if (options.presetPercentage === 30) crf = 20;
      } else if (options.crf) {
        crf = options.crf;
      }
      args.push('-crf', crf.toString());
    }

    // Preset speed
    const preset = options.speedPreset || 'veryfast';
    args.push('-preset', preset);

    // Audio handling
    if (options.muteAudio) {
      args.push('-an');
    } else {
      args.push('-c:a', 'aac', '-b:a', '128k');
    }

    // Faststart for web progressive playback
    args.push('-movflags', '+faststart');
    args.push(outputName);

    // Run command
    await ffmpeg.exec(args);

    // Read compressed file
    const outputData = await ffmpeg.readFile(outputName);
    const outputUint8 = outputData as Uint8Array;
    const blob = new Blob([outputUint8.buffer as ArrayBuffer], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);

    const savedBytes = Math.max(0, file.size - blob.size);
    const savedPercentage = Math.round((savedBytes / file.size) * 100);

    if (onProgress) onProgress(100);

    // Cleanup virtual filesystem
    try {
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
    } catch {
      // Ignore cleanup error
    }

    return {
      blob,
      url,
      size: blob.size,
      duration: meta.duration,
      savedPercentage,
    };
  } finally {
    // Remove listener
    try {
      (ffmpeg as any).off?.('progress', progressHandler);
    } catch {
      // Ignore
    }
  }
}
