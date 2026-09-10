import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useEditorStore } from '../../store';
import { TimelineEngine } from '../../engine';
import { Play, Pause, SkipBack, SkipForward, Maximize, Volume2, VolumeX } from 'lucide-react';
import { formatTime } from '../../utils';
import { Tooltip } from '../editor/Tooltip';
import type { MediaAsset } from '../../types';

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

  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentVideoAsset, setCurrentVideoAsset] = useState<MediaAsset | null>(null);

  // Get all clips at current playhead position
  const getCurrentClips = useCallback(() => {
    if (!project) return [];
    return TimelineEngine.getClipsAtTime(project, playheadPosition);
  }, [project, playheadPosition]);

  // Get the topmost video clip at current time
  const currentClip = getCurrentClips().filter(c => {
    const track = project?.tracks.find(t => t.id === c.trackId);
    return track?.type === 'video' || track?.type === 'text';
  }).pop() || (selectedClipId 
    ? project?.tracks.flatMap(t => t.clips).find(c => c.id === selectedClipId)
    : null);

  // Get media asset for current clip
  const currentAsset = currentClip 
    ? project?.mediaAssets.find(a => a.id === currentClip.assetId)
    : null;

  // Update current video asset when clip changes
  useEffect(() => {
    if (currentAsset?.type === 'video') {
      setCurrentVideoAsset(currentAsset);
    } else {
      setCurrentVideoAsset(null);
    }
  }, [currentAsset?.id, currentAsset?.type]);

  // Handle playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = playbackSpeed;
    video.volume = isMuted ? 0 : volume;

    if (isPlaying && currentVideoAsset) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
  }, [isPlaying, volume, isMuted, playbackSpeed, currentVideoAsset]);

  // Update video time when playhead changes (when not playing)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isPlaying || !currentClip) return;

    const sourceTime = currentClip.trimStart + (playheadPosition - currentClip.startTime);
    if (sourceTime >= currentClip.trimStart && sourceTime <= currentClip.trimEnd) {
      video.currentTime = sourceTime;
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

  // Render frame to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = project?.settings.backgroundColor || '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw video if available
    if (currentVideoAsset && video.readyState >= 2) {
      const asset = currentVideoAsset;
      const clip = currentClip;
      
      if (clip && asset) {
        const scaleX = canvas.width / (asset.width || 1920);
        const scaleY = canvas.height / (asset.height || 1080);
        const scale = clip.transform.scale * Math.min(scaleX, scaleY);
        
        ctx.save();
        
        // Apply transform
        ctx.translate(canvas.width / 2 + clip.transform.x, canvas.height / 2 + clip.transform.y);
        ctx.rotate((clip.transform.rotation * Math.PI) / 180);
        ctx.scale(scale, scale);
        ctx.globalAlpha = clip.transform.opacity;
        
        // Draw video frame
        ctx.drawImage(video, -(asset.width || 1920) / 2, -(asset.height || 1080) / 2);
        
        ctx.restore();
      }
    } else if (currentAsset?.type === 'image' && currentAsset.url) {
      // Draw image
      const img = new Image();
      img.src = currentAsset.url;
      if (img.complete) {
        const clip = currentClip;
        const scaleX = canvas.width / (currentAsset.width || 1920);
        const scaleY = canvas.height / (currentAsset.height || 1080);
        const scale = clip ? clip.transform.scale * Math.min(scaleX, scaleY) : 1;
        
        ctx.save();
        if (clip) {
          ctx.translate(canvas.width / 2 + clip.transform.x, canvas.height / 2 + clip.transform.y);
          ctx.rotate((clip.transform.rotation * Math.PI) / 180);
          ctx.scale(scale, scale);
          ctx.globalAlpha = clip.transform.opacity;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      }
    }
  }, [currentVideoAsset, currentAsset, currentClip, playheadPosition, project?.settings.backgroundColor]);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (!currentClip) return;
    setIsPlaying(!isPlaying);
  }, [isPlaying, setIsPlaying, currentClip]);

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

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  }, []);

  return (
    <div className="h-full bg-[#1a1a1a] flex flex-col" ref={containerRef}>
      {/* Video Canvas Area */}
      <div 
        className="flex-1 flex items-center justify-center bg-[#0a0a0a] relative"
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
          {currentVideoAsset?.url && (
            <video
              ref={videoRef}
              src={currentVideoAsset.url}
              className="hidden"
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              muted={isMuted}
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
          {!currentAsset && getCurrentClips().length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-600">
              <div className="text-center">
                <p className="text-base font-medium">No clip selected</p>
                <p className="text-sm mt-1">Select a clip from the timeline to preview</p>
              </div>
            </div>
          )}
          
          {/* Resolution indicator */}
          <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
            {project?.settings.width || 1920} x {project?.settings.height || 1080} @ {project?.settings.fps || 30}fps
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="h-14 bg-[#141414] border-t border-[#2a2a2a] flex items-center px-3 gap-3 shrink-0">
        {/* Time display */}
        <div className="text-white font-mono text-xs min-w-[90px] font-medium">
          <span className="text-red-500">{formatTime(playheadPosition)}</span>
          <span className="text-gray-600 mx-1">/</span>
          <span className="text-gray-500">{formatTime(timelineDuration)}</span>
        </div>

        {/* Playback buttons */}
        <div className="flex items-center gap-1">
          <Tooltip content="Go to start">
            <button
              onClick={skipToStart}
              className="p-1.5 text-gray-500 hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>
          </Tooltip>
          
          <button
            onClick={togglePlayPause}
            disabled={!currentClip}
            className={`px-4 py-1.5 rounded text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isPlaying 
                ? 'bg-red-600 text-white' 
                : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
            }`}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          
          <Tooltip content="Forward 1 second">
            <button
              onClick={() => setPlayheadPosition(Math.min(playheadPosition + 1, timelineDuration))}
              className="p-1.5 text-gray-500 hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </Tooltip>
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
            className="flex-1 h-1.5 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-red-600"
          />
        </div>

        {/* Volume control */}
        <div className="flex items-center gap-1">
          <Tooltip content={isMuted ? 'Unmute' : 'Mute'}>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 text-gray-500 hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          </Tooltip>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 h-1 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-red-600"
          />
        </div>

        {/* Speed selector */}
        <select
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
          className="bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400 text-xs rounded px-2 py-1 focus:outline-none focus:border-red-600"
        >
          <option value="0.25">0.25x</option>
          <option value="0.5">0.5x</option>
          <option value="1">1x</option>
          <option value="1.5">1.5x</option>
          <option value="2">2x</option>
        </select>

        {/* Fullscreen button */}
        <Tooltip content="Fullscreen">
          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-gray-500 hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};
