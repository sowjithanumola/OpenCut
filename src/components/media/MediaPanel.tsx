import React, { useRef, useCallback, useState } from 'react';
import { useEditorStore } from '../../store';
import { MediaProcessor } from '../../engine';
import { TimelineEngine } from '../../engine';
import { Plus, Image, Music, Video, Trash2, Upload, Film, Mic } from 'lucide-react';
import type { MediaAsset } from '../../types';
import { Tooltip } from '../editor/Tooltip';

export const MediaPanel: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const { project, addMediaAsset, removeMediaAsset, addClip, setSelectedClip } = useEditorStore();
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'audio' | 'image'>('all');

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files) return;

    for (const file of Array.from(files)) {
      const asset = await MediaProcessor.processFile(file);
      if (asset) {
        addMediaAsset(asset);
      }
    }
  }, [addMediaAsset]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDragToTimeline = useCallback((e: React.DragEvent, asset: MediaAsset) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'media-asset',
      assetId: asset.id,
      assetType: asset.type,
      duration: asset.duration || 5
    }));
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  const handleClickToAddToTimeline = useCallback((asset: MediaAsset) => {
    if (!project) return;
    
    // Find appropriate track based on asset type
    let targetTrackId: string | undefined;
    
    if (asset.type === 'video') {
      // Try video tracks first, then audio track for detached audio
      const videoTrack = project.tracks.find(t => t.type === 'video' && !t.locked);
      targetTrackId = videoTrack?.id;
    } else if (asset.type === 'audio') {
      const audioTrack = project.tracks.find(t => t.type === 'audio' && !t.locked);
      targetTrackId = audioTrack?.id;
    } else if (asset.type === 'image') {
      const videoTrack = project.tracks.find(t => t.type === 'video' && !t.locked);
      targetTrackId = videoTrack?.id;
    }
    
    if (!targetTrackId) {
      // Create a new track if needed
      const trackId = `${asset.type}-${Date.now()}`;
      targetTrackId = trackId;
    }
    
    // Create clip at the end of existing content or at playhead
    const track = project.tracks.find(t => t.id === targetTrackId);
    let startTime = 0;
    if (track) {
      const maxEndTime = Math.max(0, ...track.clips.map(c => c.endTime));
      startTime = maxEndTime; // Start after last clip
    }
    
    const clip = TimelineEngine.createClip(asset, targetTrackId, startTime);
    if (clip) {
      addClip(clip);
      setSelectedClip(clip.id);
    }
  }, [project, addClip, setSelectedClip]);

  const getMediaTypeIcon = (type: MediaAsset['type']) => {
    switch (type) {
      case 'video':
        return <Film className="w-4 h-4" />;
      case 'audio':
        return <Mic className="w-4 h-4" />;
      case 'image':
        return <Image className="w-4 h-4" />;
    }
  };

  const mediaAssets = project?.mediaAssets || [];
  const filteredAssets = activeTab === 'all' 
    ? mediaAssets 
    : mediaAssets.filter(a => a.type === activeTab);

  return (
    <div className="h-full bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col w-72 shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-[#2a2a2a]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-sm">Media Library</h2>
          <Tooltip content="Import Media">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
            >
              <Upload className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`w-full px-3 py-2 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center gap-2 ${
            isDragging 
              ? 'border-red-600 bg-red-600/10' 
              : 'border-[#2a2a2a] hover:border-[#3a3a3a] bg-[#141414]'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span className="text-xs font-medium text-gray-400">Import Media</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/*,audio/*,image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2a2a2a]">
        {(['all', 'video', 'audio', 'image'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-2 py-2 text-xs font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'text-white border-b-2 border-red-600'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Media List */}
      <div 
        ref={dropZoneRef}
        className="flex-1 overflow-y-auto p-2"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {filteredAssets.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="w-14 h-14 mx-auto mb-3 bg-[#141414] rounded-lg flex items-center justify-center">
              {activeTab === 'all' || activeTab === 'video' ? (
                <Video className="w-6 h-6 text-gray-600" />
              ) : activeTab === 'audio' ? (
                <Music className="w-6 h-6 text-gray-600" />
              ) : (
                <Image className="w-6 h-6 text-gray-600" />
              )}
            </div>
            <p className="text-gray-500 text-sm">
              {activeTab === 'all' ? 'No media yet' : `No ${activeTab} files`}
            </p>
            <p className="text-gray-600 text-xs mt-1">
              {activeTab === 'all' 
                ? 'Drag & drop or import media' 
                : `Import ${activeTab} files to get started`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                draggable
                onDragStart={(e) => handleDragToTimeline(e, asset)}
                onClick={() => handleClickToAddToTimeline(asset)}
                className="group relative bg-[#141414] rounded-lg overflow-hidden border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-[#0a0a0a] relative">
                  {asset.thumbnailUrl ? (
                    <img
                      src={asset.thumbnailUrl}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      {getMediaTypeIcon(asset.type)}
                    </div>
                  )}
                  
                  {/* Type badge */}
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded flex items-center gap-1">
                    {getMediaTypeIcon(asset.type)}
                  </div>
                  
                  {/* Duration badge for video/audio */}
                  {asset.duration && (
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded">
                      {formatDuration(asset.duration)}
                    </span>
                  )}
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <p className="text-white text-xs font-medium">Click or drag to timeline</p>
                  </div>
                </div>

                {/* Info */}
                <div className="p-2">
                  <p className="text-gray-300 text-xs truncate" title={asset.name}>
                    {asset.name}
                  </p>
                  {asset.width && asset.height && (
                    <p className="text-gray-600 text-xs">{asset.width}x{asset.height}</p>
                  )}
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeMediaAsset(asset.id);
                  }}
                  className="absolute top-1 right-1 p-1 bg-red-600/90 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Supported formats info */}
      <div className="p-2 border-t border-[#2a2a2a] bg-[#141414]">
        <p className="text-gray-600 text-xs text-center">
          MP4, WebM, MOV, MP3, WAV, PNG, JPG, WebP
        </p>
      </div>
    </div>
  );
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
