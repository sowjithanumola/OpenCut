import { create } from 'zustand';
import type { 
  EditorState, 
  Project, 
  Clip, 
  Track, 
  MediaAsset,
  HistoryEntry 
} from '../types';

interface EditorActions {
  // Project actions
  setProject: (project: Project | null) => void;
  updateProject: (updates: Partial<Project>) => void;
  
  // Selection
  setSelectedClip: (clipId: string | null) => void;
  setSelectedTrack: (trackId: string | null) => void;
  
  // Playback
  setPlayheadPosition: (position: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setZoom: (zoom: number) => void;
  
  // History
  pushHistory: (action: string, data: unknown, undoData?: unknown) => void;
  undo: () => void;
  redo: () => void;
  
  // Loading/Error
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Export
  setExportProgress: (progress: number | null) => void;
  
  // View
  setViewMode: (mode: 'home' | 'editor') => void;
  
  // Timeline operations
  addTrack: (track: Track) => void;
  removeTrack: (trackId: string) => void;
  addClip: (clip: Clip) => void;
  updateClip: (clipId: string, updates: Partial<Clip>) => void;
  removeClip: (clipId: string) => void;
  moveClip: (clipId: string, newStartTime: number, newTrackId?: string) => void;
  trimClip: (clipId: string, trimStart: number, trimEnd: number) => void;
  splitClip: (clipId: string, splitTime: number) => Clip | null;
  
  // Media
  addMediaAsset: (asset: MediaAsset) => void;
  removeMediaAsset: (assetId: string) => void;
  
  // Utility
  reset: () => void;
}

const defaultProject = (): Project => ({
  id: crypto.randomUUID(),
  name: 'Untitled Project',
  tracks: [
    { id: 'video-1', name: 'Video 1', type: 'video', locked: false, hidden: false, muted: false, solo: false, clips: [] },
    { id: 'video-2', name: 'Video 2', type: 'video', locked: false, hidden: false, muted: false, solo: false, clips: [] },
    { id: 'audio-1', name: 'Audio 1', type: 'audio', locked: false, hidden: false, muted: false, solo: false, volume: 100, clips: [] },
    { id: 'text-1', name: 'Text', type: 'text', locked: false, hidden: false, muted: false, solo: false, clips: [] },
  ],
  mediaAssets: [],
  settings: {
    width: 1920,
    height: 1080,
    fps: 30,
    backgroundColor: '#000000',
    audioSampleRate: 44100,
  },
  captions: [],
  transitions: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const initialState: EditorState = {
  project: null,
  selectedClipId: null,
  selectedTrackId: null,
  playheadPosition: 0,
  isPlaying: false,
  zoom: 1,
  history: [],
  historyIndex: -1,
  isLoading: false,
  error: null,
  exportProgress: null,
  viewMode: 'home',
};

export const useEditorStore = create<EditorState & EditorActions>((set, get) => ({
  ...initialState,
  
  setProject: (project) => set({ project }),
  
  updateProject: (updates) => {
    const { project } = get();
    if (project) {
      set({ project: { ...project, ...updates, updatedAt: Date.now() } });
    }
  },
  
  setSelectedClip: (clipId) => set({ selectedClipId: clipId }),
  
  setSelectedTrack: (trackId) => set({ selectedTrackId: trackId }),
  
  setPlayheadPosition: (position) => set({ playheadPosition: Math.max(0, position) }),
  
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  
  setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(4, zoom)) }),
  
  pushHistory: (action, data, undoData) => {
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ action, timestamp: Date.now(), data, undoData });
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },
  
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < 0) return;
    
    const entry = history[historyIndex];
    // Undo logic would be implemented based on action type
    set({ historyIndex: historyIndex - 1 });
  },
  
  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    set({ historyIndex: historyIndex + 1 });
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  setExportProgress: (exportProgress) => set({ exportProgress }),
  
  setViewMode: (viewMode) => set({ viewMode }),
  
  addTrack: (track) => {
    const { project } = get();
    if (project) {
      set({ project: { ...project, tracks: [...project.tracks, track], updatedAt: Date.now() } });
    }
  },
  
  removeTrack: (trackId) => {
    const { project } = get();
    if (project) {
      set({ 
        project: { 
          ...project, 
          tracks: project.tracks.filter(t => t.id !== trackId),
          updatedAt: Date.now()
        } 
      });
    }
  },
  
  addClip: (clip) => {
    const { project } = get();
    if (project) {
      const tracks = project.tracks.map(track => {
        if (track.id === clip.trackId) {
          return { ...track, clips: [...track.clips, clip] };
        }
        return track;
      });
      set({ project: { ...project, tracks, updatedAt: Date.now() } });
    }
  },
  
  updateClip: (clipId, updates) => {
    const { project } = get();
    if (project) {
      const tracks = project.tracks.map(track => ({
        ...track,
        clips: track.clips.map(clip => 
          clip.id === clipId ? { ...clip, ...updates } : clip
        ),
      }));
      set({ project: { ...project, tracks, updatedAt: Date.now() } });
    }
  },
  
  removeClip: (clipId) => {
    const { project } = get();
    if (project) {
      const tracks = project.tracks.map(track => ({
        ...track,
        clips: track.clips.filter(clip => clip.id !== clipId),
      }));
      set({ project: { ...project, tracks, updatedAt: Date.now() } });
    }
  },
  
  moveClip: (clipId, newStartTime, newTrackId) => {
    const { project } = get();
    if (project) {
      const clipDuration = (() => {
        for (const track of project.tracks) {
          const clip = track.clips.find(c => c.id === clipId);
          if (clip) return clip.endTime - clip.startTime;
        }
        return 0;
      })();
      
      const tracks = project.tracks.map(track => {
        const clipsInThisTrack = track.clips.filter(c => c.id !== clipId);
        if (track.id === (newTrackId || project.tracks.find(t => t.clips.some(c => c.id === clipId))?.id)) {
          const updatedClip = project.tracks
            .flatMap(t => t.clips)
            .find(c => c.id === clipId);
          if (updatedClip) {
            clipsInThisTrack.push({
              ...updatedClip,
              startTime: newStartTime,
              endTime: newStartTime + clipDuration,
            });
          }
        }
        return { ...track, clips: clipsInThisTrack };
      });
      set({ project: { ...project, tracks, updatedAt: Date.now() } });
    }
  },
  
  trimClip: (clipId, trimStart, trimEnd) => {
    const { project } = get();
    if (project) {
      const tracks = project.tracks.map(track => ({
        ...track,
        clips: track.clips.map(clip => {
          if (clip.id === clipId) {
            const duration = clip.endTime - clip.startTime;
            const newDuration = trimEnd - trimStart;
            const timeScale = newDuration > 0 ? duration / newDuration : 1;
            return {
              ...clip,
              trimStart,
              trimEnd,
              offset: clip.offset + trimStart,
            };
          }
          return clip;
        }),
      }));
      set({ project: { ...project, tracks, updatedAt: Date.now() } });
    }
  },
  
  splitClip: (clipId, splitTime) => {
    const { project } = get();
    if (!project) return null;
    
    let originalClip: Clip | undefined;
    for (const track of project.tracks) {
      originalClip = track.clips.find(c => c.id === clipId);
      if (originalClip) break;
    }
    
    if (!originalClip) return null;
    
    const clipDuration = originalClip.endTime - originalClip.startTime;
    const splitPoint = splitTime - originalClip.startTime;
    
    if (splitPoint <= 0 || splitPoint >= clipDuration) return null;
    
    const firstClip: Clip = {
      ...originalClip,
      id: crypto.randomUUID(),
      endTime: splitTime,
      trimEnd: originalClip.trimStart + splitPoint,
    };
    
    const secondClip: Clip = {
      ...originalClip,
      id: crypto.randomUUID(),
      startTime: splitTime,
      trimStart: originalClip.trimStart + splitPoint,
      offset: originalClip.offset + splitPoint,
    };
    
    const tracks = project.tracks.map(track => ({
      ...track,
      clips: track.clips
        .filter(c => c.id !== clipId)
        .concat(firstClip, secondClip),
    }));
    
    set({ project: { ...project, tracks, updatedAt: Date.now() } });
    
    return secondClip;
  },
  
  addMediaAsset: (asset) => {
    const { project } = get();
    if (project) {
      set({ 
        project: { 
          ...project, 
          mediaAssets: [...project.mediaAssets, asset],
          updatedAt: Date.now()
        } 
      });
    }
  },
  
  removeMediaAsset: (assetId) => {
    const { project } = get();
    if (project) {
      // Remove from assets
      const mediaAssets = project.mediaAssets.filter(a => a.id !== assetId);
      
      // Remove from all clips
      const tracks = project.tracks.map(track => ({
        ...track,
        clips: track.clips.filter(clip => clip.assetId !== assetId),
      }));
      
      set({ project: { ...project, mediaAssets, tracks, updatedAt: Date.now() } });
    }
  },
  
  reset: () => set(initialState),
}));
