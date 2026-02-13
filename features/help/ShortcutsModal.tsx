
import React from 'react';
import { useEditor } from '../../context/EditorContext';

const ShortcutGroup: React.FC<{ title: string; shortcuts: { keys: string[]; action: string }[] }> = ({ title, shortcuts }) => (
  <div className="space-y-3">
    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-white/5 pb-2">{title}</h3>
    <div className="grid grid-cols-1 gap-2">
      {shortcuts.map((s, i) => (
        <div key={i} className="flex items-center justify-between group">
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{s.action}</span>
          <div className="flex gap-1">
            {s.keys.map((k, j) => (
              <kbd key={j} className="bg-white/10 border border-white/10 rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-300 min-w-[20px] text-center shadow-sm">
                {k}
              </kbd>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const ShortcutsModal: React.FC = () => {
  const { isShortcutsModalOpen, toggleShortcutsModal } = useEditor();

  if (!isShortcutsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={toggleShortcutsModal}></div>
      <div className="relative z-10 w-full max-w-2xl bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-2">
                <span className="material-icons text-slate-400">keyboard</span>
                <h2 className="text-white font-bold text-lg">Keyboard Shortcuts</h2>
            </div>
            <button onClick={toggleShortcutsModal} className="text-slate-400 hover:text-white"><span className="material-icons">close</span></button>
        </div>
        
        <div className="p-6 grid grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
            <ShortcutGroup 
                title="Essentials"
                shortcuts={[
                    { keys: ['Ctrl', 'Z'], action: 'Undo' },
                    { keys: ['Ctrl', 'Y'], action: 'Redo' },
                    { keys: ['Del'], action: 'Delete Selection' },
                    { keys: ['Ctrl', 'D'], action: 'Duplicate' },
                ]}
            />
            <ShortcutGroup 
                title="Tools"
                shortcuts={[
                    { keys: ['V'], action: 'Select Tool' },
                    { keys: ['H'], action: 'Hand Tool' },
                    { keys: ['Space'], action: 'Pan Canvas' },
                ]}
            />
            <ShortcutGroup 
                title="Navigation"
                shortcuts={[
                    { keys: ['Ctrl', '+'], action: 'Zoom In' },
                    { keys: ['Ctrl', '-'], action: 'Zoom Out' },
                    { keys: ['Ctrl', '0'], action: 'Reset Zoom' },
                    { keys: ['Shift', '1'], action: 'Fit Page' },
                    { keys: ['Shift', '2'], action: 'Fit Selection' },
                ]}
            />
             <ShortcutGroup 
                title="Arrangement"
                shortcuts={[
                    { keys: ['Arrows'], action: 'Nudge (1px)' },
                    { keys: ['Shift', 'Arrows'], action: 'Big Nudge (10px)' },
                ]}
            />
        </div>
      </div>
    </div>
  );
};
