// Core Types for OpenCut

export interface MediaAsset {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image';
  file?: File;
  url: string;
  duration?: number;
  width?: number;
  height?: number;
  fps?: number;
  thumbnailUrl?: string;
  createdAt: number;
}

export interface Track {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'text' | 'effect';
  locked: boolean;
  hidden: boolean;
  muted: boolean;
  solo: boolean;
  volume?: number;
  clips: Clip[];
}

export interface Clip {
  id: string;
  assetId: string;
  trackId: string;
  startTime: number; // Position on timeline
  endTime: number;
  trimStart: number; // Trim within source
  trimEnd: number;
  offset: number; // Offset within source
  transform: Transform;
  effects: Effect[];
  textContent?: string;
  textStyle?: TextStyle;
  audio?: AudioSettings;
}

export interface Transform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  flipH: boolean;
  flipV: boolean;
}

export interface Effect {
  id: string;
  type: EffectType;
  enabled: boolean;
  intensity: number;
  settings: Record<string, number>;
}

export type EffectType = 
  | 'brightness'
  | 'contrast'
  | 'saturation'
  | 'blur'
  | 'grayscale'
  | 'sepia'
  | 'hue'
  | 'vignette'
  | 'sharpen';

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  backgroundColor: string;
  alignment: 'left' | 'center' | 'right';
  letterSpacing: number;
  lineHeight: number;
  strokeColor: string;
  strokeWidth: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
}

export interface AudioSettings {
  volume: number;
  muted: boolean;
  fadeIn: number;
  fadeOut: number;
  playbackRate: number;
}

export interface Project {
  id: string;
  name: string;
  tracks: Track[];
  mediaAssets: MediaAsset[];
  settings: ProjectSettings;
  captions: Caption[];
  transitions: Transition[];
  createdAt: number;
  updatedAt: number;
}

export interface ProjectSettings {
  width: number;
  height: number;
  fps: number;
  backgroundColor: string;
  audioSampleRate: number;
}

export interface Caption {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  style: TextStyle;
}

export interface Transition {
  id: string;
  type: TransitionType;
  duration: number;
  clipId1: string;
  clipId2: string;
}

export type TransitionType = 
  | 'crossfade'
  | 'fade'
  | 'dipToBlack'
  | 'dipToWhite'
  | 'slide'
  | 'wipe'
  | 'zoom';

export interface EditorState {
  project: Project | null;
  selectedClipId: string | null;
  selectedTrackId: string | null;
  playheadPosition: number;
  isPlaying: boolean;
  zoom: number;
  history: HistoryEntry[];
  historyIndex: number;
  isLoading: boolean;
  error: string | null;
  exportProgress: number | null;
  viewMode: 'home' | 'editor';
}

export interface HistoryEntry {
  action: string;
  timestamp: number;
  data: unknown;
  undoData?: unknown;
}

export interface ExportSettings {
  resolution: '480p' | '720p' | '1080p' | '1440p' | '4K';
  frameRate: 24 | 25 | 30 | 60;
  format: 'mp4' | 'webm';
  quality: 'low' | 'medium' | 'high';
}

export interface KeyboardShortcut {
  key: string;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  action: string;
}
