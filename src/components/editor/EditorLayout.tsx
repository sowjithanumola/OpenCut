import React from 'react';
import { TopBar } from './TopBar';
import { MediaPanel } from '../media';
import { PreviewPanel } from '../preview';
import { TimelinePanel } from '../timeline';
import { InspectorPanel } from '../inspector';

interface EditorLayoutProps {
  onNewProject: () => void;
  onSaveProject: () => void;
  onExport: () => void;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({
  onNewProject,
  onSaveProject,
  onExport,
}) => {
  return (
    <div className="h-screen flex flex-col bg-gray-900 overflow-hidden">
      {/* Top Bar */}
      <TopBar 
        onNewProject={onNewProject}
        onSaveProject={onSaveProject}
        onExport={onExport}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Media Library */}
        <MediaPanel />
        
        {/* Center - Preview and Timeline */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Preview Area */}
          <div className="h-[55%] min-h-0">
            <PreviewPanel />
          </div>
          
          {/* Timeline Area */}
          <div className="h-[45%] min-h-0 border-t border-gray-700">
            <TimelinePanel />
          </div>
        </div>
        
        {/* Right Panel - Inspector */}
        <InspectorPanel />
      </div>
    </div>
  );
};
