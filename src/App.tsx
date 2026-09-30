import React, { useEffect } from 'react';
import { useEditorStore } from './store';
import { HomeScreen } from './components/home';
import { EditorLayout } from './components/editor';
import type { Project } from './types';
import { loadProject, saveProject } from './services/projectStorage';
import { ExportPanel } from './components/export/ExportPanel';

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
  const [isExportOpen, setExportOpen] = React.useState(false);

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

  const handleSaveProject = async () => {
    if (!project) return;
    try { await saveProject(project); }
    catch (error) {
      console.error('Failed to save project:', error);
      useEditorStore.getState().setError(error instanceof Error ? error.message : 'Failed to save project.');
      throw error;
    }
  };

  const handleExport = () => setExportOpen(true);

  // Load project from URL hash or check for recent project
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      try {
        loadProject(hash).then((savedProject) => {
          if (savedProject) {
          setProject(savedProject);
          setViewMode('editor');
          }
        }).catch((error) => {
        console.error('Failed to load project:', error);
        useEditorStore.getState().setError(error instanceof Error ? error.message : 'Failed to load project.');
        });
      } catch (error) { console.error('Invalid project link:', error); }
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
      {isExportOpen && <ExportPanel onClose={() => setExportOpen(false)} />}
    </div>
  );
}

export default App;
