import React, { useCallback } from 'react';
import { useEditorStore } from '../../store';
import { Project } from '../../types';

interface HomeScreenProps {
  onNewProject: () => void;
  onOpenProject: (project: Project) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNewProject, onOpenProject }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <svg className="w-24 h-24 mx-auto mb-6" viewBox="0 0 100 100" fill="none">
            <rect width="100" height="100" rx="20" fill="#1a1a2e"/>
            <polygon points="40,30 70,50 40,70" fill="#e94560" stroke="#fff" strokeWidth="3"/>
            <circle cx="50" cy="50" r="35" fill="none" stroke="#e94560" strokeWidth="3"/>
          </svg>
          <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">OpenCut</h1>
          <p className="text-xl text-gray-400">Professional video editing. Free for everyone.</p>
        </div>

        {/* Main Actions */}
        <div className="flex gap-4 justify-center mb-12">
          <button
            onClick={onNewProject}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
          >
            New Project
          </button>
          <button
            onClick={() => {/* Handle open project */}}
            className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold text-lg transition-colors border border-gray-600"
          >
            Open Project
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <h3 className="text-white font-semibold mb-2">Free & Open Source</h3>
            <p className="text-gray-400 text-sm">No subscriptions, no watermarks, no hidden costs. Built for everyone.</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <h3 className="text-white font-semibold mb-2">Local-First</h3>
            <p className="text-gray-400 text-sm">Your projects stay on your device. Privacy-focused by design.</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <h3 className="text-white font-semibold mb-2">Professional Tools</h3>
            <p className="text-gray-400 text-sm">Multi-track timeline, effects, transitions, text, audio, and more.</p>
          </div>
        </div>

        {/* Recent Projects Section */}
        <div className="mt-12 text-left">
          <h2 className="text-white font-semibold mb-4">Recent Projects</h2>
          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700 min-h-[120px] flex items-center justify-center">
            <p className="text-gray-500">No recent projects</p>
          </div>
        </div>
      </div>
    </div>
  );
};
