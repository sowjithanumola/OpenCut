import type { MediaAsset } from '../../types';
import { generateId } from '../../utils';

export class MediaProcessor {
  private static readonly SUPPORTED_VIDEO_TYPES = [
    'video/mp4',
    'video/webm',
    'video/quicktime',
  ];
  
  private static readonly SUPPORTED_AUDIO_TYPES = [
    'audio/mp3',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/webm',
  ];
  
  private static readonly SUPPORTED_IMAGE_TYPES = [
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
  ];

  static async processFile(file: File): Promise<MediaAsset | null> {
    try {
      const url = URL.createObjectURL(file);
      let mediaInfo: Partial<MediaAsset> = {};

      if (this.isVideoType(file.type)) {
        mediaInfo = await this.getVideoInfo(url, file);
      } else if (this.isAudioType(file.type)) {
        mediaInfo = await this.getAudioInfo(url, file);
      } else if (this.isImageType(file.type)) {
        mediaInfo = await this.getImageInfo(url, file);
      } else {
        URL.revokeObjectURL(url);
        return null;
      }

      return {
        id: generateId(),
        name: file.name,
        file,
        url,
        createdAt: Date.now(),
        ...mediaInfo,
      } as MediaAsset;
    } catch (error) {
      console.error('Error processing media file:', error);
      return null;
    }
  }

  private static isVideoType(type: string): boolean {
    return this.SUPPORTED_VIDEO_TYPES.some(t => type.includes(t.replace('video/', ''))) ||
           type.startsWith('video/');
  }

  private static isAudioType(type: string): boolean {
    return this.SUPPORTED_AUDIO_TYPES.some(t => type.includes(t.replace('audio/', ''))) ||
           type.startsWith('audio/');
  }

  private static isImageType(type: string): boolean {
    return this.SUPPORTED_IMAGE_TYPES.some(t => type === t) ||
           type.startsWith('image/');
  }

  private static async getVideoInfo(url: string, file: File): Promise<Partial<MediaAsset>> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = url;
      
      video.onloadedmetadata = () => {
        // Generate thumbnail
        const thumbnailUrl = this.generateThumbnail(video);
        
        resolve({
          type: 'video' as const,
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          fps: this.estimateFps(video),
          thumbnailUrl,
        });
      };
      
      video.onerror = () => {
        resolve({
          type: 'video' as const,
          duration: 0,
        });
      };
    });
  }

  private static async getAudioInfo(url: string, file: File): Promise<Partial<MediaAsset>> {
    return new Promise((resolve) => {
      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      audio.src = url;
      
      audio.onloadedmetadata = () => {
        resolve({
          type: 'audio' as const,
          duration: audio.duration,
        });
      };
      
      audio.onerror = () => {
        resolve({
          type: 'audio' as const,
          duration: 0,
        });
      };
    });
  }

  private static async getImageInfo(url: string, file: File): Promise<Partial<MediaAsset>> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      
      img.onload = () => {
        resolve({
          type: 'image' as const,
          width: img.width,
          height: img.height,
          thumbnailUrl: url,
        });
      };
      
      img.onerror = () => {
        resolve({
          type: 'image' as const,
        });
      };
    });
  }

  private static generateThumbnail(video: HTMLVideoElement): string {
    try {
      const canvas = document.createElement('canvas');
      const width = 160;
      const height = Math.round((video.videoHeight / video.videoWidth) * width);
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';
      
      // Seek to 10% of the video or 1 second
      const seekTime = Math.min(video.duration * 0.1, 1);
      video.currentTime = seekTime;
      
      // Draw after seeking (this is synchronous for already loaded metadata)
      ctx.drawImage(video, 0, 0, width, height);
      
      return canvas.toDataURL('image/jpeg', 0.7);
    } catch {
      return '';
    }
  }

  private static estimateFps(video: HTMLVideoElement): number {
    // Try to get fps from video metadata if available
    // This is an approximation since browsers don't always expose fps
    return 30; // Default to 30fps
  }

  static revokeUrl(url: string): void {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Ignore errors when revoking URLs
    }
  }

  static cleanupAsset(asset: MediaAsset): void {
    if (asset.url && asset.url.startsWith('blob:')) {
      this.revokeUrl(asset.url);
    }
    if (asset.thumbnailUrl && asset.thumbnailUrl.startsWith('blob:')) {
      this.revokeUrl(asset.thumbnailUrl);
    }
  }
}
