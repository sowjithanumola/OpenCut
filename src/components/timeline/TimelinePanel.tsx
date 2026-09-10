import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useEditorStore } from '../../store';
import { TimelineEngine } from '../../engine';
import { Lock, Eye, Volume2, VolumeX, Plus, Minus, Scissors, Trash2 } from 'lucide-react';
import type { Track, Clip, MediaAsset } from '../../types';
import { formatTime } from '../../utils';

export const TimelinePanel: React.FC = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  
  const { 
    project, 
    playheadPosition, 
    setPlayheadPosition, 
    isPlaying,
    setIsPlaying,
    zoom,
    setZoom,
    selectedClipId,
    setSelectedClip,
    addClip,
    removeClip,
    splitClip,
    moveClip,
    updateClip
  } = useEditorStore();

  const PIXELS_PER_SECOND = 50 * zoom;
  const TRACK_HEIGHT = 64;
  const RULER_HEIGHT = 32;

  // Get timeline duration
  const timelineDuration = project ? TimelineEngine.getTimelineDuration(project) : 60;
  const timelineWidth = timelineDuration * PIXELS_PER_SECOND;

  // Handle drop from media library
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    if (!project) return;
    
    try {
      const data = e.dataTransfer.getData('application/json');
      if (!data) return;
      
      const parsed = JSON.parse(data);
      if (parsed.type !== 'media-asset') return;
      
      const assetId = parsed.assetId;
      const asset = project.mediaAssets.find(a => a.id === assetId);
      if (!asset) return;
      
      // Calculate drop position
      const rect = timelineRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX - rect.left;
      let startTime = Math.max(0, x / PIXELS_PER_SECOND);
      
      // Find appropriate track based on asset type
      let targetTrackId: string | undefined;
      
      if (asset.type === 'video') {
        const videoTrack = project.tracks.find(t => t.type === 'video' && !t.locked);
        targetTrackId = videoTrack?.id;
      } else if (asset.type === 'audio') {
        const audioTrack = project.tracks.find(t => t.type === 'audio' && !t.locked);
        targetTrackId = audioTrack?.id;
      } else if (asset.type === 'image') {
        const videoTrack = project.tracks.find(t => t.type === 'video' && !t.locked);
        targetTrackId = videoTrack?.id;
      }
      
      if (!targetTrackId) return;
      
      // Create clip at drop position
      const clip = TimelineEngine.createClip(asset, targetTrackId, startTime);
      if (clip) {
        addClip(clip);
        setSelectedClip(clip.id);
      }
    } catch (error) {
      console.error('Failed to handle drop:', error);
    }
  }, [project, PIXELS_PER_SECOND, addClip, setSelectedClip]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  }, []);

  // Handle timeline click to move playhead
  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = x / PIXELS_PER_SECOND;
    setPlayheadPosition(Math.max(0, time));
  }, [PIXELS_PER_SECOND, setPlayheadPosition]);

  // Handle play/drag on timeline
  const handlePlayheadDrag = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = Math.max(0, x / PIXELS_PER_SECOND);
    setPlayheadPosition(time);
  }, [PIXELS_PER_SECOND, setPlayheadPosition]);

  // Toggle playback
  const togglePlayback = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying, setIsPlaying]);

  // Split clip at playhead
  const handleSplit = useCallback(() => {
    if (selectedClipId && project) {
      splitClip(selectedClipId, playheadPosition);
    }
  }, [selectedClipId, playheadPosition, splitClip, project]);

  // Delete selected clip
  const handleDelete = useCallback(() => {
    if (selectedClipId) {
      removeClip(selectedClipId);
      setSelectedClip(null);
    }
  }, [selectedClipId, removeClip, setSelectedClip]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayback();
          break;
        case 'KeyS':
          if (e.ctrlKey || e.metaKey) return; // Don't trigger on Ctrl+S
          e.preventDefault();
          handleSplit();
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          handleDelete();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setPlayheadPosition(playheadPosition - 0.1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setPlayheadPosition(playheadPosition + 0.1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayback, handleSplit, handleDelete, playheadPosition, setPlayheadPosition]);

  // Get track color based on type
  const getTrackColor = (type: Track['type']) => {
    switch (type) {
      case 'video': return 'bg-blue-600';
      case 'audio': return 'bg-green-600';
      case 'text': return 'bg-purple-600';
      case 'effect': return 'bg-orange-600';
    }
  };

  const getClipColor = (type: Track['type'], isSelected: boolean) => {
    if (isSelected) return 'ring-2 ring-white ring-offset-1 ring-offset-gray-800';
    switch (type) {
      case 'video': return 'bg-blue-500 hover:bg-blue-400';
      case 'audio': return 'bg-green-500 hover:bg-green-400';
      case 'text': return 'bg-purple-500 hover:bg-purple-400';
      case 'effect': return 'bg-orange-500 hover:bg-orange-400';
    }
  };

  const tracks = project?.tracks || [];

  return (
    <div className="h-full bg-gray-900 flex flex-col border-t border-gray-700">
      {/* Timeline Toolbar */}
      <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlayback}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              isPlaying 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          
          <div className="w-px h-5 bg-gray-700 mx-2" />
          
          <button
            onClick={handleSplit}
            disabled={!selectedClipId}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title="Split (S)"
          >
            <Scissors className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleDelete}
            disabled={!selectedClipId}
            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-xs">{formatTime(playheadPosition)}</span>
          
          <div className="w-px h-5 bg-gray-700 mx-2" />
          
          <button
            onClick={() => setZoom(zoom - 0.25)}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-gray-400 text-xs w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(zoom + 0.25)}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Track Headers */}
        <div className="w-32 bg-gray-800 border-r border-gray-700 shrink-0">
          {/* Ruler space */}
          <div className="h-8 border-b border-gray-700" />
          
          {/* Track headers */}
          <div className="overflow-hidden">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="h-16 border-b border-gray-700 p-2 flex flex-col justify-center"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-medium truncate">
                    {track.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <button className="p-0.5 text-gray-500 hover:text-white">
                      {track.locked ? (
                        <Lock className="w-3 h-3" />
                      ) : (
                        <Lock className="w-3 h-3 opacity-50" />
                      )}
                    </button>
                    <button className="p-0.5 text-gray-500 hover:text-white">
                      {track.hidden ? (
                        <Eye className="w-3 h-3 opacity-50" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                    </button>
                    {track.type === 'audio' && (
                      <button className="p-0.5 text-gray-500 hover:text-white">
                        {track.muted ? (
                          <VolumeX className="w-3 h-3" />
                        ) : (
                          <Volume2 className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Tracks */}
        <div 
          className="flex-1 overflow-x-auto overflow-y-hidden"
          ref={timelineRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div style={{ width: timelineWidth }} className="relative">
            {/* Ruler */}
            <div
              ref={rulerRef}
              className={`h-8 bg-gray-800 border-b border-gray-700 cursor-pointer relative ${
                isDraggingOver ? 'bg-red-600/20' : ''
              }`}
              onClick={handleTimelineClick}
            >
              {/* Time markers */}
              {Array.from({ length: Math.ceil(timelineDuration) + 1 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-full border-l border-gray-600"
                  style={{ left: i * PIXELS_PER_SECOND }}
                >
                  <span className="text-gray-400 text-xs ml-1 mt-1 block">
                    {formatTime(i)}
                  </span>
                </div>
              ))}
              
              {/* Playhead indicator in ruler */}
              <div
                className="absolute top-0 w-px h-full bg-red-500 z-20"
                style={{ left: playheadPosition * PIXELS_PER_SECOND }}
              >
                <div className="w-3 h-3 -ml-1.5 bg-red-500 transform rotate-45 -mt-1.5" />
              </div>
            </div>

            {/* Tracks */}
            <div className="relative">
              {/* Playhead line */}
              <div
                className="absolute top-0 w-px bg-red-500 z-30 pointer-events-none"
                style={{ 
                  left: playheadPosition * PIXELS_PER_SECOND,
                  height: tracks.length * TRACK_HEIGHT
                }}
              />

              {tracks.map((track, trackIndex) => (
                <div
                  key={track.id}
                  className={`h-16 border-b border-gray-700 relative ${
                    track.hidden ? 'opacity-50' : ''
                  }`}
                  style={{ width: timelineWidth }}
                >
                  {/* Clips */}
                  {track.clips.map((clip) => {
                    const asset = project?.mediaAssets.find(a => a.id === clip.assetId);
                    const isSelected = clip.id === selectedClipId;
                    
                    return (
                      <div
                        key={clip.id}
                        className={`absolute top-1 bottom-1 rounded ${getClipColor(track.type, isSelected)} cursor-pointer transition-colors`}
                        style={{
                          left: clip.startTime * PIXELS_PER_SECOND,
                          width: (clip.endTime - clip.startTime) * PIXELS_PER_SECOND,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClip(clip.id);
                        }}
                      >
                        <div className="p-1 h-full overflow-hidden">
                          {asset?.thumbnailUrl && track.type === 'video' && (
                            <img
                              src={asset.thumbnailUrl}
                              alt=""
                              className="h-full w-full object-cover opacity-50"
                            />
                          )}
                          <span className="absolute top-1 left-2 text-white text-xs font-medium truncate max-w-full">
                            {asset?.name || 'Clip'}
                          </span>
                        </div>
                        
                        {/* Trim handles */}
                        <div className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 rounded-l" />
                        <div className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 rounded-r" />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
