import { useEffect, useCallback } from 'react';
import { useEditorStore } from '../store';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts() {
  const { 
    undo, 
    redo, 
    setIsPlaying, 
    isPlaying,
    setPlayheadPosition,
    playheadPosition,
    selectedClipId,
    splitClip,
    removeClip,
    setSelectedClip,
    project,
    addClip,
    zoom,
    setZoom
  } = useEditorStore();

  const shortcuts: ShortcutConfig[] = [
    {
      key: ' ',
      action: () => setIsPlaying(!isPlaying),
      description: 'Play/Pause',
    },
    {
      key: 'z',
      ctrl: true,
      shift: false,
      action: () => undo(),
      description: 'Undo',
    },
    {
      key: 'z',
      ctrl: true,
      shift: true,
      action: () => redo(),
      description: 'Redo',
    },
    {
      key: 's',
      ctrl: false,
      shift: false,
      action: () => {
        if (selectedClipId && project) {
          splitClip(selectedClipId, playheadPosition);
        }
      },
      description: 'Split Clip',
    },
    {
      key: 'Delete',
      action: () => {
        if (selectedClipId) {
          removeClip(selectedClipId);
          setSelectedClip(null);
        }
      },
      description: 'Delete Clip',
    },
    {
      key: 'Backspace',
      action: () => {
        if (selectedClipId) {
          removeClip(selectedClipId);
          setSelectedClip(null);
        }
      },
      description: 'Delete Clip',
    },
    {
      key: 'ArrowLeft',
      action: () => setPlayheadPosition(playheadPosition - 0.1),
      description: 'Move Playhead Left',
    },
    {
      key: 'ArrowRight',
      action: () => setPlayheadPosition(playheadPosition + 0.1),
      description: 'Move Playhead Right',
    },
    {
      key: 'ArrowUp',
      action: () => setPlayheadPosition(playheadPosition - 1),
      description: 'Move Playhead Up (1s)',
    },
    {
      key: 'ArrowDown',
      action: () => setPlayheadPosition(playheadPosition - 1),
      description: 'Move Playhead Down (1s)',
    },
    {
      key: 'Home',
      action: () => setPlayheadPosition(0),
      description: 'Go to Start',
    },
    {
      key: 'End',
      action: () => {
        if (project) {
          let maxTime = 30;
          project.tracks.forEach(track => {
            track.clips.forEach(clip => {
              if (clip.endTime > maxTime) maxTime = clip.endTime;
            });
          });
          setPlayheadPosition(maxTime);
        }
      },
      description: 'Go to End',
    },
    {
      key: '=',
      action: () => setZoom(Math.min(zoom + 0.25, 4)),
      description: 'Zoom In',
    },
    {
      key: '-',
      action: () => setZoom(Math.max(zoom - 0.25, 0.25)),
      description: 'Zoom Out',
    },
    {
      key: '0',
      action: () => setZoom(1),
      description: 'Reset Zoom',
    },
    {
      key: 'k',
      action: () => setIsPlaying(false),
      description: 'Stop Playback',
    },
    {
      key: 'l',
      action: () => setIsPlaying(true),
      description: 'Play',
    },
    {
      key: 'j',
      action: () => {
        setPlayheadPosition(Math.max(0, playheadPosition - 5));
      },
      description: 'Reverse 5s',
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      if ((e.target as HTMLElement).tagName === 'INPUT' || 
          (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      const shortcut = shortcuts.find(s => {
        const keyMatch = e.key.toLowerCase() === s.key.toLowerCase();
        const ctrlMatch = s.ctrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
        const shiftMatch = s.shift ? e.shiftKey : !e.shiftKey;
        return keyMatch && ctrlMatch && shiftMatch;
      });

      if (shortcut) {
        e.preventDefault();
        shortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
