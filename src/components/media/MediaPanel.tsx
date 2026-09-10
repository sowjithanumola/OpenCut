import React, { useRef, useCallback } from 'react';
import { useEditorStore } from '../../store';
import { MediaProcessor } from '../../engine';
import { Plus, Image, Music, Video, Trash2 } from 'lucide-react';
import type { MediaAsset } from '../../types';

export const MediaPanel: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { project, addMediaAsset, removeMediaAsset } = useEditorStore();

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
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const getMediaTypeIcon = (type: MediaAsset['type']) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      case 'image':
        return <Image className="w-4 h-4" />;
    }
  };

  const mediaAssets = project?.mediaAssets || [];

  return (
    <div 
      className="h-full bg-gray-900 border-r border-gray-700 flex flex-col w-64 shrink-0"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <h2 className="text-white font-semibold text-sm mb-2">Media Library</h2>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Import Media
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

      {/* Media List */}
      <div className="flex-1 overflow-y-auto p-2">
        {mediaAssets.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="w-16 h-16 mx-auto mb-3 bg-gray-800 rounded-full flex items-center justify-center">
              <Image className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-500 text-sm">No media yet</p>
            <p className="text-gray-600 text-xs mt-1">Import videos, images, or audio</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {mediaAssets.map((asset) => (
              <div
                key={asset.id}
                className="group relative bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-gray-900 relative">
                  {asset.thumbnailUrl ? (
                    <img
                      src={asset.thumbnailUrl}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      {getMediaTypeIcon(asset.type)}
                    </div>
                  )}
                  
                  {/* Duration badge for video/audio */}
                  {asset.duration && (
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded">
                      {formatDuration(asset.duration)}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-2">
                  <p className="text-white text-xs truncate" title={asset.name}>
                    {asset.name}
                  </p>
                  <p className="text-gray-500 text-xs capitalize">{asset.type}</p>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => removeMediaAsset(asset.id)}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>

                {/* Drag to timeline hint */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <p className="text-white text-xs font-medium">Drag to timeline</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Supported formats info */}
      <div className="p-3 border-t border-gray-700">
        <p className="text-gray-500 text-xs">
          Supports: MP4, WebM, MOV, MP3, WAV, PNG, JPG, WebP, GIF
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
