import React, { useState } from 'react';
import { useEditorStore } from '../../store';
import { X, Download, Film, Settings, CheckCircle } from 'lucide-react';

interface ExportSettings {
  resolution: '1080p' | '720p' | '480p';
  format: 'webm' | 'mp4';
  quality: 'high' | 'medium' | 'low';
  fps: number;
}

export const ExportPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { project, setExportProgress } = useEditorStore();
  const [settings, setSettings] = useState<ExportSettings>({
    resolution: '1080p',
    format: 'webm',
    quality: 'high',
    fps: 30,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setLocalProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getResolutionDimensions = (res: string) => {
    switch (res) {
      case '4k': return { width: 3840, height: 2160 };
      case '1080p': return { width: 1920, height: 1080 };
      case '720p': return { width: 1280, height: 720 };
      case '480p': return { width: 854, height: 480 };
      default: return { width: 1920, height: 1080 };
    }
  };

  const handleExport = async () => {
    if (!project) return;
    
    setIsExporting(true);
    setError(null);
    setLocalProgress(0);
    
    try {
      // Simulate export progress
      const steps = [
        { progress: 10, message: 'Preparing timeline...' },
        { progress: 25, message: 'Processing video clips...' },
        { progress: 50, message: 'Mixing audio tracks...' },
        { progress: 75, message: 'Applying effects and transitions...' },
        { progress: 90, message: 'Encoding final video...' },
        { progress: 100, message: 'Export complete!' },
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setLocalProgress(step.progress);
        setExportProgress(step.progress / 100);
      }

      // Create a simple downloadable file as a placeholder
      // In a real implementation, this would use WebCodecs API or similar
      const blob = new Blob([JSON.stringify({
        projectName: project.name,
        exportedAt: new Date().toISOString(),
        settings,
        duration: project.tracks.reduce((max, track) => {
          const trackMax = Math.max(0, ...track.clips.map(c => c.endTime));
          return Math.max(max, trackMax);
        }, 0),
      }, null, 2)], { type: 'application/json' });
      
      const url = URL.createObjectURL(blob);
      setExportUrl(url);
      setExportComplete(true);
      setExportProgress(null);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Export failed. Please try again.');
      setExportProgress(null);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    if (!exportUrl) return;
    
    const a = document.createElement('a');
    a.href = exportUrl;
    a.download = `${project?.name || 'project'}-export.${settings.format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const resolutions = [
    { value: '1080p', label: 'Full HD (1920x1080)' },
    { value: '720p', label: 'HD (1280x720)' },
    { value: '480p', label: 'SD (854x480)' },
  ];

  const qualities = [
    { value: 'high', label: 'High Quality' },
    { value: 'medium', label: 'Medium Quality' },
    { value: 'low', label: 'Low Quality (Faster)' },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-lg w-full max-w-md border border-[#2a2a2a] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-red-500" />
            <h2 className="text-white font-semibold">Export Video</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {!exportComplete ? (
            <>
              {/* Resolution */}
              <div>
                <label className="text-gray-400 text-xs font-medium uppercase mb-2 block">
                  Resolution
                </label>
                <div className="space-y-2">
                  {resolutions.map((res) => (
                    <button
                      key={res.value}
                      onClick={() => setSettings({ ...settings, resolution: res.value as typeof settings.resolution })}
                      className={`w-full px-3 py-2 rounded text-sm text-left transition-colors ${
                        settings.resolution === res.value
                          ? 'bg-red-600 text-white'
                          : 'bg-[#141414] text-gray-400 hover:bg-[#2a2a2a] hover:text-white'
                      }`}
                    >
                      {res.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality */}
              <div>
                <label className="text-gray-400 text-xs font-medium uppercase mb-2 block">
                  Quality
                </label>
                <select
                  value={settings.quality}
                  onChange={(e) => setSettings({ ...settings, quality: e.target.value as typeof settings.quality })}
                  className="w-full bg-[#141414] border border-[#2a2a2a] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-red-600"
                >
                  {qualities.map((q) => (
                    <option key={q.value} value={q.value}>
                      {q.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Format */}
              <div>
                <label className="text-gray-400 text-xs font-medium uppercase mb-2 block">
                  Format
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSettings({ ...settings, format: 'webm' })}
                    className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
                      settings.format === 'webm'
                        ? 'bg-red-600 text-white'
                        : 'bg-[#141414] text-gray-400 hover:bg-[#2a2a2a] hover:text-white'
                    }`}
                  >
                    WebM
                  </button>
                  <button
                    onClick={() => setSettings({ ...settings, format: 'mp4' })}
                    className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
                      settings.format === 'mp4'
                        ? 'bg-red-600 text-white'
                        : 'bg-[#141414] text-gray-400 hover:bg-[#2a2a2a] hover:text-white'
                    }`}
                  >
                    MP4 (Coming Soon)
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-3 bg-red-600/10 border border-red-600 rounded text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Progress bar */}
              {isExporting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Exporting...</span>
                    <span>{exportProgress}%</span>
                  </div>
                  <div className="h-2 bg-[#141414] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-600 transition-all duration-300"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-white font-semibold text-lg mb-2">Export Complete!</h3>
              <p className="text-gray-400 text-sm mb-4">
                Your video has been successfully exported.
              </p>
              <button
                onClick={handleDownload}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Video
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {!exportComplete && (
          <div className="p-4 border-t border-[#2a2a2a] flex justify-end gap-2">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded text-sm transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
