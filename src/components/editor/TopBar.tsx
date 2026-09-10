import React from 'react';
import { useEditorStore } from '../../store';
import { Play, Save, Download, Settings, Undo2, Redo2, FolderOpen } from 'lucide-react';

interface TopBarProps {
  onNewProject: () => void;
  onSaveProject: () => void;
  onExport: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onNewProject, onSaveProject, onExport }) => {
  const { project, updateProject, undo, redo, setViewMode } = useEditorStore();

  return (
    <header className="h-14 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-4">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <button 
          onClick={() => setViewMode('home')}
          className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
        >
          <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none">
            <rect width="100" height="100" rx="20" fill="#1a1a2e"/>
            <polygon points="40,30 70,50 40,70" fill="#e94560" stroke="#fff" strokeWidth="3"/>
            <circle cx="50" cy="50" r="35" fill="none" stroke="#e94560" strokeWidth="3"/>
          </svg>
          <span className="font-bold text-lg">OpenCut</span>
        </button>

        {/* Menu Items */}
        <nav className="hidden md:flex items-center gap-1">
          <button onClick={onNewProject} className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors">
            File
          </button>
          <button className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors">
            Edit
          </button>
          <button className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors">
            View
          </button>
          <button className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors">
            Project
          </button>
          <button className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors">
            Export
          </button>
        </nav>

        {/* Undo/Redo */}
        <div className="hidden lg:flex items-center gap-1 ml-4 pl-4 border-l border-gray-700">
          <button 
            onClick={undo}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button 
            onClick={redo}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center - Project Name */}
      <div className="flex-1 max-w-md mx-4 hidden sm:block">
        <input
          type="text"
          value={project?.name || ''}
          onChange={(e) => updateProject({ name: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white text-center focus:outline-none focus:border-red-600 transition-colors"
          placeholder="Untitled Project"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <button 
          onClick={onSaveProject}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
          title="Save Project"
        >
          <Save className="w-5 h-5" />
        </button>
        <button 
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
          title="Open Project"
        >
          <FolderOpen className="w-5 h-5" />
        </button>
        <button 
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
        <button 
          onClick={onExport}
          className="ml-2 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>
    </header>
  );
};
