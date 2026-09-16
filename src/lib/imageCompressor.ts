import JSZip from 'jszip';

export interface ImageCompressOptions {
  quality: number; // 0.1 to 1.0 (e.g. 0.8)
  format: 'auto' | 'image/jpeg' | 'image/webp' | 'image/png';
  maxWidth?: number;
  maxHeight?: number;
}

export interface CompressedImageItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  compressedSize: number;
  originalUrl: string;
  compressedUrl: string;
  compressedBlob: Blob;
  savedPercentage: number;
  width: number;
  height: number;
  outputFormat: string;
}

/**
 * Compresses a single image using browser native Canvas API
 */
export async function compressSingleImage(
  file: File,
  options: ImageCompressOptions
): Promise<CompressedImageItem> {
  const originalUrl = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // Handle dimension scaling
      if (options.maxWidth && width > options.maxWidth) {
        height = Math.round((height * options.maxWidth) / width);
        width = options.maxWidth;
      }
      if (options.maxHeight && height > options.maxHeight) {
        width = Math.round((width * options.maxHeight) / height);
        height = options.maxHeight;
      }

      // Render to canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to create canvas context'));
        return;
      }

      // Smooth downsampling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // If converting transparent PNG to JPEG, draw white background
      let targetMime = options.format === 'auto' ? file.type : options.format;
      if (!targetMime || targetMime === 'image/svg+xml') {
        targetMime = 'image/jpeg';
      }

      if (targetMime === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas toBlob failed'));
            return;
          }

          // If compressed size turns out larger than original and format is same, keep original
          const effectiveBlob =
            blob.size > file.size && targetMime === file.type ? file : blob;
          const compressedUrl = URL.createObjectURL(effectiveBlob);
          const savedBytes = Math.max(0, file.size - effectiveBlob.size);
          const savedPercentage = Math.round((savedBytes / file.size) * 100);

          let outputName = file.name;
          if (targetMime === 'image/webp' && !outputName.toLowerCase().endsWith('.webp')) {
            outputName = outputName.replace(/\.[^/.]+$/, '') + '.webp';
          } else if (targetMime === 'image/jpeg' && !outputName.toLowerCase().endsWith('.jpg') && !outputName.toLowerCase().endsWith('.jpeg')) {
            outputName = outputName.replace(/\.[^/.]+$/, '') + '.jpg';
          } else if (targetMime === 'image/png' && !outputName.toLowerCase().endsWith('.png')) {
            outputName = outputName.replace(/\.[^/.]+$/, '') + '.png';
          }

          resolve({
            id: 'img_' + Math.random().toString(36).slice(2, 9),
            file,
            name: outputName,
            originalSize: file.size,
            compressedSize: effectiveBlob.size,
            originalUrl,
            compressedUrl,
            compressedBlob: effectiveBlob,
            savedPercentage,
            width,
            height,
            outputFormat: targetMime,
          });
        },
        targetMime,
        options.quality
      );
    };

    img.onerror = (e) => {
      URL.revokeObjectURL(originalUrl);
      reject(new Error('Failed to load image file: ' + e));
    };

    img.src = originalUrl;
  });
}

/**
 * Package multiple compressed images into a single ZIP file for 1-click bulk download
 */
export async function createZipArchive(items: CompressedImageItem[]): Promise<Blob> {
  const zip = new JSZip();

  for (const item of items) {
    zip.file(item.name, item.compressedBlob);
  }

  return await zip.generateAsync({ type: 'blob' });
}
