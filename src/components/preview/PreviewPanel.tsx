import React, { useRef, useEffect, useCallback } from 'react';
import { useEditorStore } from '../../store';
import { Play, Pause, SkipBack, SkipForward, Maximize } from 'lucide-react';
import { formatTime } from '../../utils';

export const PreviewPanel: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { 
    project, 
    playheadPosition, 
    isPlaying, 
    setIsPlaying, 
    setPlayheadPosition,
    selectedClipId 
  } = useEditorStore();

  // Get current clip being previewed
  const currentClip = selectedClipId 
    ? project?.tracks.flatMap(t => t.clips).find(c => c.id === selectedClipId)
    : null;

  // Get media asset for current clip
  const currentAsset = currentClip 
    ? project?.mediaAssets.find(a => a.id === currentClip.assetId)
    : null;

  // Handle playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
  }, [isPlaying]);

  // Update video time when playhead changes (when not playing)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isPlaying) return;

    if (currentClip) {
      const sourceTime = currentClip.trimStart + (playheadPosition - currentClip.startTime);
      if (sourceTime >= currentClip.trimStart && sourceTime <= currentClip.trimEnd) {
        video.currentTime = sourceTime;
      }
    }
  }, [playheadPosition, currentClip, isPlaying]);

  // Handle video time updates
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !currentClip) return;

    const timelineTime = currentClip.startTime + (video.currentTime - currentClip.trimStart);
    setPlayheadPosition(timelineTime);

    // Auto-pause at clip end
    if (video.currentTime >= currentClip.trimEnd) {
      video.pause();
      setIsPlaying(false);
    }
  }, [currentClip, setPlayheadPosition, setIsPlaying]);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying, setIsPlaying]);

  // Skip to start of clip or beginning
  const skipToStart = useCallback(() => {
    if (currentClip) {
      setPlayheadPosition(currentClip.startTime);
    } else {
      setPlayheadPosition(0);
    }
  }, [currentClip, setPlayheadPosition]);

  // Get total duration for progress bar
  const getTimelineDuration = useCallback(() => {
    if (!project) return 30;
    let maxEndTime = 0;
    for (const track of project.tracks) {
      for (const clip of track.clips) {
        if (clip.endTime > maxEndTime) {
          maxEndTime = clip.endTime;
        }
      }
    }
    return Math.max(maxEndTime, 30);
  }, [project]);

  // Calculate display dimensions
  const getDisplayDimensions = useCallback(() => {
    if (!containerRef.current) return { width: 640, height: 360 };
    
    const containerWidth = containerRef.current.clientWidth - 32;
    const containerHeight = containerRef.current.clientHeight - 100;
    
    const targetAspect = 16 / 9;
    const containerAspect = containerWidth / containerHeight;
    
    if (containerAspect > targetAspect) {
      return {
        width: containerHeight * targetAspect,
        height: containerHeight
      };
    } else {
      return {
        width: containerWidth,
        height: containerWidth / targetAspect
      };
    }
  }, []);

  const [displaySize, setDisplaySize] = React.useState({ width: 640, height: 360 });

  useEffect(() => {
    const updateSize = () => setDisplaySize(getDisplayDimensions());
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [getDisplayDimensions]);

  const timelineDuration = getTimelineDuration();

  return (
    <div className="h-full bg-gray-800 flex flex-col">
      {/* Video Canvas Area */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center bg-gray-900 relative"
      >
        <div 
          className="relative bg-black"
          style={{ 
            width: displaySize.width, 
            height: displaySize.height,
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        >
          {/* Hidden video element for playback */}
          {currentAsset?.type === 'video' && currentAsset.url && (
            <video
              ref={videoRef}
              src={currentAsset.url}
              className="hidden"
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              muted={false}
            />
          )}
          
          {/* Display canvas/video */}
          <canvas
            ref={canvasRef}
            width={displaySize.width}
            height={displaySize.height}
            className="w-full h-full"
          />
          
          {/* Placeholder when no clip selected */}
          {!currentAsset && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-600">
              <div className="text-center">
                <p className="text-lg font-medium">No clip selected</p>
                <p className="text-sm mt-1">Select a clip from the timeline to preview</p>
              </div>
            </div>
          )}
          
          {/* Resolution indicator */}
          <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
            {project?.settings.width || 1920} x {project?.settings.height || 1080}
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="h-16 bg-gray-900 border-t border-gray-700 flex items-center px-4 gap-4">
        {/* Time display */}
        <div className="text-white font-mono text-sm min-w-[100px]">
          {formatTime(playheadPosition)} / {formatTime(timelineDuration)}
        </div>

        {/* Playback buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={skipToStart}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            title="Go to start"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          
          <button
            onClick={togglePlayPause}
            className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>
          
          <button
            onClick={() => setPlayheadPosition(Math.min(playheadPosition + 1, timelineDuration))}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            title="Forward 1 second"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Timeline scrubber */}
        <div className="flex-1 flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={timelineDuration}
            step={0.01}
            value={playheadPosition}
            onChange={(e) => {
              setPlayheadPosition(parseFloat(e.target.value));
              setIsPlaying(false);
            }}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
          />
        </div>

        {/* Fullscreen button */}
        <button
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
          title="Fullscreen"
        >
          <Maximize className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
