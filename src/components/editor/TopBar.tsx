import React, { useState } from 'react';
import { useEditorStore } from '../../store';
import { 
  Play, Save, Download, Undo2, Redo2, Scissors, Type
} from 'lucide-react';
import type { Clip, TextStyle } from '../../types';
import { Tooltip } from './Tooltip';

interface TopBarProps {
  onSaveProject: () => Promise<void>;
  onExport: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onSaveProject, onExport }) => {
  const { project, updateProject, undo, redo, setViewMode, selectedClipId, playheadPosition, splitClip, addClip, setSelectedClip } = useEditorStore();
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const addText = () => {
    const track = project?.tracks.find(candidate => candidate.type === 'text' && !candidate.locked);
    if (!track) return;
    const style: TextStyle = { fontFamily: 'Arial', fontSize: 64, fontWeight: '700', color: '#ffffff', backgroundColor: 'transparent', alignment: 'center', letterSpacing: 0, lineHeight: 1.2, strokeColor: '#000000', strokeWidth: 0, shadowColor: 'rgba(0,0,0,.65)', shadowBlur: 8, shadowOffsetX: 2, shadowOffsetY: 2 };
    const clip: Clip = { id: crypto.randomUUID(), assetId: '', trackId: track.id, startTime: playheadPosition, endTime: playheadPosition + 5, trimStart: 0, trimEnd: 5, offset: 0, textContent: 'Edit this text', textStyle: style, transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, flipH: false, flipV: false }, effects: [] };
    addClip(clip); setSelectedClip(clip.id);
  };

  return (
    <header className="h-12 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center justify-between px-3 shrink-0">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Logo */}
        <button 
          onClick={() => setViewMode('home')}
          className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
        >
          <svg className="w-7 h-7" viewBox="0 0 100 100" fill="none">
            <rect width="100" height="100" rx="18" fill="#1a1a2e"/>
            <polygon points="40,30 70,50 40,70" fill="#e94560" stroke="#fff" strokeWidth="2.5"/>
            <circle cx="50" cy="50" r="35" fill="none" stroke="#e94560" strokeWidth="2.5"/>
          </svg>
          <span className="font-semibold text-base tracking-tight">OpenCut</span>
        </button>

        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5">
          <Tooltip content="Undo (Ctrl+Z)">
            <button 
              onClick={undo}
              className="p-1.5 text-gray-500 hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
            >
              <Undo2 className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip content="Redo (Ctrl+Shift+Z)">
            <button 
              onClick={redo}
              className="p-1.5 text-gray-500 hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>

        {/* Save Status */}
        <div className="hidden sm:flex items-center gap-2 ml-2 pl-3 border-l border-[#2a2a2a]">
          <span className={`text-xs ${saveStatus === 'unsaved' ? 'text-yellow-500' : 'text-gray-500'}`}>
            {saveStatus === 'unsaved' ? 'Unsaved changes' : saveStatus === 'saving' ? 'Saving...' : 'Saved'}
          </span>
        </div>
      </div>

      {/* Center - Project Name */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <input
          type="text"
          value={project?.name || ''}
          onChange={(e) => {
            updateProject({ name: e.target.value });
            setSaveStatus('unsaved');
          }}
          onBlur={() => setSaveStatus('saved')}
          className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-1.5 text-xs text-white text-center focus:outline-none focus:border-red-600 transition-colors"
          placeholder="Untitled Project"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1">
        <Tooltip content="Split (S)">
          <button 
            disabled={!selectedClipId}
            onClick={() => { if (selectedClipId) splitClip(selectedClipId, playheadPosition); }}
            className="p-1.5 text-gray-500 hover:text-white hover:bg-[#2a2a2a] rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Scissors className="w-4 h-4" />
          </button>
        </Tooltip>
        <Tooltip content="Add text">
          <button onClick={addText} disabled={!project?.tracks.some(track => track.type === 'text' && !track.locked)} className="p-1.5 text-gray-500 hover:text-white hover:bg-[#2a2a2a] rounded disabled:opacity-30 transition-colors"><Type className="w-4 h-4" /></button>
        </Tooltip>
        
        <Tooltip content="Save Project (Ctrl+S)">
          <button 
            onClick={async () => {
              setSaveStatus('saving');
              await onSaveProject();
              setSaveStatus('saved');
            }}
            className="p-1.5 text-gray-500 hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
          >
            <Save className="w-4 h-4" />
          </button>
        </Tooltip>
        
        <div className="w-px h-5 bg-[#2a2a2a] mx-1" />
        
        <button 
          onClick={onExport}
          className="ml-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>
    </header>
  );
};
