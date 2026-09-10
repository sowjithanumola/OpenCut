import React from 'react';
import { useEditorStore } from '../../store';
import type { Clip, Effect, TextStyle } from '../../types';

export const InspectorPanel: React.FC = () => {
  const { project, selectedClipId, updateClip } = useEditorStore();

  // Get selected clip and its asset
  const selectedClip = selectedClipId
    ? project?.tracks.flatMap(t => t.clips).find(c => c.id === selectedClipId)
    : null;

  const selectedAsset = selectedClip
    ? project?.mediaAssets.find(a => a.id === selectedClip.assetId)
    : null;

  if (!selectedClip) {
    return (
      <div className="h-full bg-gray-900 border-l border-gray-700 w-72 shrink-0 flex items-center justify-center p-4">
        <div className="text-center text-gray-500">
          <p className="text-sm">No clip selected</p>
          <p className="text-xs mt-1">Select a clip to edit its properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 border-l border-gray-700 w-72 shrink-0 overflow-y-auto">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <h2 className="text-white font-semibold text-sm truncate" title={selectedAsset?.name}>
          {selectedAsset?.name || 'Clip'}
        </h2>
        <p className="text-gray-500 text-xs capitalize">{selectedAsset?.type}</p>
      </div>

      {/* Transform Section */}
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-gray-400 text-xs font-medium uppercase mb-3">Transform</h3>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-gray-500 text-xs block mb-1">Position X</label>
              <input
                type="number"
                value={Math.round(selectedClip.transform.x)}
                onChange={(e) => updateClip(selectedClip.id, {
                  transform: { ...selectedClip.transform, x: Number(e.target.value) }
                })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-red-600"
              />
            </div>
            <div>
              <label className="text-gray-500 text-xs block mb-1">Position Y</label>
              <input
                type="number"
                value={Math.round(selectedClip.transform.y)}
                onChange={(e) => updateClip(selectedClip.id, {
                  transform: { ...selectedClip.transform, y: Number(e.target.value) }
                })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-500 text-xs block mb-1">Scale</label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={selectedClip.transform.scale}
              onChange={(e) => updateClip(selectedClip.id, {
                transform: { ...selectedClip.transform, scale: Number(e.target.value) }
              })}
              className="w-full accent-red-600"
            />
            <span className="text-gray-400 text-xs">{Math.round(selectedClip.transform.scale * 100)}%</span>
          </div>

          <div>
            <label className="text-gray-500 text-xs block mb-1">Rotation</label>
            <input
              type="range"
              min="0"
              max="360"
              value={selectedClip.transform.rotation}
              onChange={(e) => updateClip(selectedClip.id, {
                transform: { ...selectedClip.transform, rotation: Number(e.target.value) }
              })}
              className="w-full accent-red-600"
            />
            <span className="text-gray-400 text-xs">{Math.round(selectedClip.transform.rotation)}°</span>
          </div>

          <div>
            <label className="text-gray-500 text-xs block mb-1">Opacity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={selectedClip.transform.opacity}
              onChange={(e) => updateClip(selectedClip.id, {
                transform: { ...selectedClip.transform, opacity: Number(e.target.value) }
              })}
              className="w-full accent-red-600"
            />
            <span className="text-gray-400 text-xs">{Math.round(selectedClip.transform.opacity * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Audio Section (for video/audio clips) */}
      {(selectedAsset?.type === 'video' || selectedAsset?.type === 'audio') && selectedClip.audio && (
        <div className="p-3 border-b border-gray-700">
          <h3 className="text-gray-400 text-xs font-medium uppercase mb-3">Audio</h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-gray-500 text-xs block mb-1">Volume</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.01"
                value={selectedClip.audio.volume}
                onChange={(e) => updateClip(selectedClip.id, {
                  audio: { ...selectedClip.audio!, volume: Number(e.target.value) }
                })}
                className="w-full accent-red-600"
              />
              <span className="text-gray-400 text-xs">{Math.round(selectedClip.audio.volume * 100)}%</span>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-gray-500 text-xs">Mute</label>
              <button
                onClick={() => updateClip(selectedClip.id, {
                  audio: { ...selectedClip.audio!, muted: !selectedClip.audio!.muted }
                })}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  selectedClip.audio.muted
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                {selectedClip.audio.muted ? 'On' : 'Off'}
              </button>
            </div>

            <div>
              <label className="text-gray-500 text-xs block mb-1">Fade In (sec)</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={selectedClip.audio.fadeIn}
                onChange={(e) => updateClip(selectedClip.id, {
                  audio: { ...selectedClip.audio!, fadeIn: Number(e.target.value) }
                })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="text-gray-500 text-xs block mb-1">Fade Out (sec)</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={selectedClip.audio.fadeOut}
                onChange={(e) => updateClip(selectedClip.id, {
                  audio: { ...selectedClip.audio!, fadeOut: Number(e.target.value) }
                })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-red-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Effects Section */}
      <div className="p-3">
        <h3 className="text-gray-400 text-xs font-medium uppercase mb-3">Effects</h3>
        
        <div className="space-y-2">
          {['brightness', 'contrast', 'saturation', 'blur', 'grayscale', 'sepia'].map((effectType) => {
            const effect = selectedClip.effects.find(e => e.type === effectType);
            const intensity = effect?.intensity || 0;
            
            return (
              <div key={effectType}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-gray-500 text-xs capitalize">{effectType}</label>
                  <span className="text-gray-400 text-xs">{Math.round(intensity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.01"
                  value={intensity}
                  onChange={(e) => {
                    const newIntensity = Number(e.target.value);
                    const newEffects = selectedClip.effects.filter(e => e.type !== effectType);
                    if (newIntensity > 0) {
                      newEffects.push({
                        id: `${effectType}-${selectedClip.id}`,
                        type: effectType as Effect['type'],
                        enabled: true,
                        intensity: newIntensity,
                        settings: {}
                      });
                    }
                    updateClip(selectedClip.id, { effects: newEffects });
                  }}
                  className="w-full accent-red-600"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
