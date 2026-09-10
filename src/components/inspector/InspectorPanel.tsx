import React from 'react';
import { useEditorStore } from '../../store';
import type { Clip, Effect, TextStyle } from '../../types';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<SectionProps> = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  
  return (
    <div className="border-b border-[#2a2a2a]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center gap-2 text-gray-400 hover:text-white hover:bg-[#1a1a1a] transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
        <h3 className="text-xs font-medium uppercase tracking-wide">{title}</h3>
      </button>
      {isOpen && (
        <div className="px-3 pb-3">
          {children}
        </div>
      )}
    </div>
  );
};

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
      <div className="h-full bg-[#1a1a1a] border-l border-[#2a2a2a] w-72 shrink-0 flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-[#2a2a2a]">
          <h2 className="text-white font-semibold text-sm">Properties</h2>
        </div>
        
        {/* Empty state */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-gray-500">
            <div className="w-12 h-12 mx-auto mb-3 bg-[#141414] rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-400">No clip selected</p>
            <p className="text-xs mt-1">Select a clip to edit its properties</p>
          </div>
        </div>
        
        {/* Project settings when nothing selected */}
        {project && (
          <div className="p-3 border-t border-[#2a2a2a] bg-[#141414]">
            <h3 className="text-gray-400 text-xs font-medium uppercase mb-3">Project Settings</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Resolution</span>
                <span className="text-gray-300">{project.settings.width}x{project.settings.height}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Frame Rate</span>
                <span className="text-gray-300">{project.settings.fps} fps</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full bg-[#1a1a1a] border-l border-[#2a2a2a] w-72 shrink-0 overflow-y-auto">
      {/* Header */}
      <div className="p-3 border-b border-[#2a2a2a]">
        <h2 className="text-white font-semibold text-sm truncate" title={selectedAsset?.name}>
          {selectedAsset?.name || 'Clip'}
        </h2>
        <p className="text-gray-500 text-xs capitalize">{selectedAsset?.type}</p>
      </div>

      {/* Transform Section */}
      <CollapsibleSection title="Transform">
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
                className="w-full bg-[#141414] border border-[#2a2a2a] rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-red-600 transition-colors"
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
                className="w-full bg-[#141414] border border-[#2a2a2a] rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-gray-500 text-xs">Scale</label>
              <span className="text-gray-400 text-xs">{Math.round(selectedClip.transform.scale * 100)}%</span>
            </div>
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
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-gray-500 text-xs">Rotation</label>
              <span className="text-gray-400 text-xs">{Math.round(selectedClip.transform.rotation)}°</span>
            </div>
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
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-gray-500 text-xs">Opacity</label>
              <span className="text-gray-400 text-xs">{Math.round(selectedClip.transform.opacity * 100)}%</span>
            </div>
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
          </div>
        </div>
      </CollapsibleSection>

      {/* Audio Section (for video/audio clips) */}
      {(selectedAsset?.type === 'video' || selectedAsset?.type === 'audio') && selectedClip.audio && (
        <CollapsibleSection title="Audio">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-gray-500 text-xs">Volume</label>
                <span className="text-gray-400 text-xs">{Math.round(selectedClip.audio.volume * 100)}%</span>
              </div>
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
            </div>

            <div className="flex items-center justify-between">
              <label className="text-gray-500 text-xs">Mute</label>
              <button
                onClick={() => updateClip(selectedClip.id, {
                  audio: { ...selectedClip.audio!, muted: !selectedClip.audio!.muted }
                })}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  selectedClip.audio.muted
                    ? 'bg-red-600 text-white'
                    : 'bg-[#2a2a2a] text-gray-400 hover:text-white'
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
                className="w-full bg-[#141414] border border-[#2a2a2a] rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-red-600 transition-colors"
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
                className="w-full bg-[#141414] border border-[#2a2a2a] rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Effects Section */}
      <CollapsibleSection title="Effects" defaultOpen={false}>
        <div className="space-y-3">
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
                  max="1"
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
      </CollapsibleSection>
    </div>
  );
};
