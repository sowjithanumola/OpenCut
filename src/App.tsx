import React, { useEffect } from 'react';
import { useEditorStore } from './store';
import { HomeScreen } from './components/home';
import { EditorLayout } from './components/editor';
import type { Project } from './types';

function App() {
  const { 
    project, 
    setProject, 
    viewMode, 
    setViewMode, 
    updateProject,
    addClip,
    setSelectedClip
  } = useEditorStore();

  // Create a new project
  const handleNewProject = () => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: 'Untitled Project',
      tracks: [
        { id: 'video-1', name: 'Video 1', type: 'video', locked: false, hidden: false, muted: false, solo: false, clips: [] },
        { id: 'video-2', name: 'Video 2', type: 'video', locked: false, hidden: false, muted: false, solo: false, clips: [] },
        { id: 'audio-1', name: 'Audio 1', type: 'audio', locked: false, hidden: false, muted: false, solo: false, volume: 100, clips: [] },
        { id: 'text-1', name: 'Text', type: 'text', locked: false, hidden: false, muted: false, solo: false, clips: [] },
      ],
      mediaAssets: [],
      settings: {
        width: 1920,
        height: 1080,
        fps: 30,
        backgroundColor: '#000000',
        audioSampleRate: 44100,
      },
      captions: [],
      transitions: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    setProject(newProject);
    setViewMode('editor');
  };

  // Save project to localStorage
  const handleSaveProject = () => {
    if (!project) return;
    
    try {
      // Create a serializable version without File objects
      const serializableProject = {
        ...project,
        mediaAssets: project.mediaAssets.map(asset => ({
          ...asset,
          file: undefined, // Don't save File references
        })),
      };
      
      localStorage.setItem(`opencut-project-${project.id}`, JSON.stringify(serializableProject));
      alert('Project saved successfully!');
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  // Export handler (placeholder for now)
  const handleExport = () => {
    if (!project) return;
    alert('Export functionality coming soon.\n\nThis will render your timeline to a video file using browser APIs.');
  };

  // Load project from URL hash or check for recent project
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      try {
        const savedProject = localStorage.getItem(`opencut-project-${hash}`);
        if (savedProject) {
          const parsed = JSON.parse(savedProject);
          setProject(parsed);
          setViewMode('editor');
        }
      } catch (error) {
        console.error('Failed to load project:', error);
      }
    }
  }, [setProject, setViewMode]);

  // Update URL when project changes
  useEffect(() => {
    if (project && viewMode === 'editor') {
      window.location.hash = project.id;
    }
  }, [project?.id, viewMode]);

  return (
    <div className="antialiased">
      {viewMode === 'home' || !project ? (
        <HomeScreen 
          onNewProject={handleNewProject}
          onOpenProject={(p) => {
            setProject(p);
            setViewMode('editor');
          }}
        />
      ) : (
        <EditorLayout
          onNewProject={handleNewProject}
          onSaveProject={handleSaveProject}
          onExport={handleExport}
        />
      )}
    </div>
  );
}

export default App;
