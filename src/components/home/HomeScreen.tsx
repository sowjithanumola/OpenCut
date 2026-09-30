import React, { useEffect, useState } from 'react';
import { Project } from '../../types';
import { listProjects, loadProject } from '../../services/projectStorage';

interface HomeScreenProps {
  onNewProject: () => void;
  onOpenProject: (project: Project) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNewProject, onOpenProject }) => {
  const [projects, setProjects] = useState<Array<{ id: string; name: string; updatedAt: number }>>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { listProjects().then(setProjects).catch(() => setError('Could not read local projects.')); }, []);
  const open = async (id: string) => {
    try { const project = await loadProject(id); if (!project) throw new Error('Project not found.'); onOpenProject(project); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not open project.'); }
  };
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
            onClick={() => projects[0] ? open(projects[0].id) : setError('There are no saved projects to open.')}
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
          <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-700 min-h-[120px]">
            {error && <p className="text-red-400 text-sm p-3">{error}</p>}
            {!error && projects.length === 0 && <p className="text-gray-500 text-center p-6">No recent projects</p>}
            {projects.map(project => <button key={project.id} onClick={() => open(project.id)} className="w-full text-left p-3 rounded hover:bg-gray-700 text-white flex justify-between"><span>{project.name}</span><span className="text-xs text-gray-500">{new Date(project.updatedAt).toLocaleDateString()}</span></button>)}
          </div>
        </div>
      </div>
    </div>
  );
};
