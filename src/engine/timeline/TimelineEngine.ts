import type { Project, Track, Clip, MediaAsset } from '../../types';

export class TimelineEngine {
  /**
   * Get the total duration of the timeline based on all clips
   */
  static getTimelineDuration(project: Project): number {
    let maxEndTime = 0;
    
    for (const track of project.tracks) {
      for (const clip of track.clips) {
        if (clip.endTime > maxEndTime) {
          maxEndTime = clip.endTime;
        }
      }
    }
    
    return Math.max(maxEndTime, 30); // Minimum 30 seconds
  }

  /**
   * Find a clip by its ID
   */
  static findClip(project: Project, clipId: string): Clip | null {
    for (const track of project.tracks) {
      const clip = track.clips.find(c => c.id === clipId);
      if (clip) return clip;
    }
    return null;
  }

  /**
   * Find a track by its ID
   */
  static findTrack(project: Project, trackId: string): Track | null {
    return project.tracks.find(t => t.id === trackId) || null;
  }

  /**
   * Check if a time range overlaps with existing clips on a track
   */
  static hasOverlap(track: Track, startTime: number, endTime: number, excludeClipId?: string): boolean {
    return track.clips.some(clip => {
      if (excludeClipId && clip.id === excludeClipId) return false;
      return startTime < clip.endTime && endTime > clip.startTime;
    });
  }

  /**
   * Find overlapping clips at a given time range
   */
  static findOverlappingClips(track: Track, startTime: number, endTime: number, excludeClipId?: string): Clip[] {
    return track.clips.filter(clip => {
      if (excludeClipId && clip.id === excludeClipId) return false;
      return startTime < clip.endTime && endTime > clip.startTime;
    });
  }

  /**
   * Snap a time value to nearby clip edges
   */
  static snapToClip(time: number, project: Project, snapThreshold: number = 0.1): number {
    let snappedTime = time;
    let minDistance = snapThreshold;

    for (const track of project.tracks) {
      for (const clip of track.clips) {
        const edges = [clip.startTime, clip.endTime];
        
        for (const edge of edges) {
          const distance = Math.abs(time - edge);
          if (distance < minDistance) {
            minDistance = distance;
            snappedTime = edge;
          }
        }
      }
    }

    return snappedTime;
  }

  /**
   * Get all clips that are visible at a given time
   */
  static getClipsAtTime(project: Project, time: number): Clip[] {
    const clips: Clip[] = [];
    
    for (const track of project.tracks) {
      if (track.hidden) continue;
      
      for (const clip of track.clips) {
        if (time >= clip.startTime && time <= clip.endTime) {
          clips.push(clip);
        }
      }
    }
    
    return clips;
  }

  /**
   * Calculate the effective duration of a clip (after trimming)
   */
  static getClipEffectiveDuration(clip: Clip): number {
    return clip.trimEnd - clip.trimStart;
  }

  /**
   * Get the source time for a given timeline time
   */
  static getClipSourceTime(clip: Clip, timelineTime: number): number {
    const relativeTime = timelineTime - clip.startTime;
    return clip.trimStart + relativeTime;
  }

  /**
   * Validate clip placement
   */
  static validateClipPlacement(clip: Clip, track: Track): { valid: boolean; error?: string } {
    if (clip.startTime >= clip.endTime) {
      return { valid: false, error: 'Clip end time must be after start time' };
    }
    
    if (clip.trimStart >= clip.trimEnd) {
      return { valid: false, error: 'Invalid trim values' };
    }
    
    if (this.hasOverlap(track, clip.startTime, clip.endTime, clip.id)) {
      return { valid: false, error: 'Clip overlaps with another clip' };
    }
    
    return { valid: true };
  }

  /**
   * Create a new clip from a media asset
   */
  static createClip(asset: MediaAsset, trackId: string, startTime: number = 0): Clip | null {
    if (!asset.duration) return null;
    
    return {
      id: crypto.randomUUID(),
      assetId: asset.id,
      trackId,
      startTime,
      endTime: startTime + asset.duration,
      trimStart: 0,
      trimEnd: asset.duration,
      offset: 0,
      transform: {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        opacity: 1,
        flipH: false,
        flipV: false,
      },
      effects: [],
      audio: {
        volume: 1,
        muted: false,
        fadeIn: 0,
        fadeOut: 0,
        playbackRate: 1,
      },
    };
  }

  /**
   * Split a clip at a specific time
   */
  static splitClip(clip: Clip, splitTime: number): { first: Clip; second: Clip } | null {
    if (splitTime <= clip.startTime || splitTime >= clip.endTime) {
      return null;
    }

    const relativeSplitPoint = splitTime - clip.startTime;
    const sourceSplitPoint = clip.trimStart + relativeSplitPoint;

    const first: Clip = {
      ...clip,
      id: crypto.randomUUID(),
      endTime: splitTime,
      trimEnd: sourceSplitPoint,
    };

    const second: Clip = {
      ...clip,
      id: crypto.randomUUID(),
      startTime: splitTime,
      trimStart: sourceSplitPoint,
      offset: relativeSplitPoint,
    };

    return { first, second };
  }
}
