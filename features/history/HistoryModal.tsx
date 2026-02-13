
import React from 'react';
import { useEditor } from '../../context/EditorContext';

export const HistoryModal: React.FC = () => {
  const { 
    isHistoryModalOpen, 
    toggleHistoryModal, 
    history, 
    future,
    restoreHistory, 
    jumpToFuture,
    undo, 
    redo, 
    canUndo, 
    canRedo,
    clearHistory
  } = useEditor();

  if (!isHistoryModalOpen) return null;

  // Format timestamp relative
  const timeAgo = (ts: number) => {
      const seconds = Math.floor((Date.now() - ts) / 1000);
      if (seconds < 60) return 'Just now';
      if (seconds < 3600) return `${Math.floor(seconds/60)}m ago`;
      return new Date(ts).toLocaleTimeString();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-end">
       <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={toggleHistoryModal}></div>
       <div className="relative z-10 w-96 h-full bg-[#141414] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                  <span className="material-icons text-slate-400">history</span>
                  <h2 className="text-white font-bold">Timeline</h2>
              </div>
              <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { if(confirm("Clear all history? This cannot be undone.")) clearHistory(); }}
                    className="text-slate-500 hover:text-red-400 p-1"
                    title="Clear History"
                  >
                    <span className="material-icons text-[16px]">delete_sweep</span>
                  </button>
                  <button onClick={toggleHistoryModal} className="text-slate-400 hover:text-white p-1">
                    <span className="material-icons text-[18px]">close</span>
                  </button>
              </div>
          </div>

          <div className="p-3 bg-white/5 border-b border-white/5 flex gap-2">
             <button 
                onClick={undo} disabled={!canUndo}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded transition-colors border border-transparent ${!canUndo ? 'text-slate-600 cursor-not-allowed' : 'bg-black hover:bg-black/80 hover:border-white/10 text-white'}`}
            >
                <span className="material-icons text-sm">undo</span> Undo
             </button>
             <button 
                onClick={redo} disabled={!canRedo}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded transition-colors border border-transparent ${!canRedo ? 'text-slate-600 cursor-not-allowed' : 'bg-black hover:bg-black/80 hover:border-white/10 text-white'}`}
            >
                <span className="material-icons text-sm">redo</span> Redo
             </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-0 relative">
             {/* Timeline Line */}
             <div className="absolute left-[19px] top-4 bottom-4 w-px bg-white/5 z-0"></div>

             <div className="relative z-10 py-4 space-y-0.5">
                 
                 {/* FUTURE (Stack: Bottom to Top) */}
                 {/* We display future from latest (bottom of list in array) to closest (top of list) for visual timeline consistency? 
                     Actually, usually timelines go Latest (Top) -> Oldest (Bottom).
                     
                     Future Array: [Next State, ..., Furthest State]
                     Past Array: [Previous State, ..., Oldest State]
                     
                     If we want standard Latest-Top vertical timeline:
                     1. Furthest Future
                     2. Next Future
                     3. CURRENT
                     4. Previous Past
                     5. Oldest Past
                 */}

                 {[...future].reverse().map((entry, idx) => {
                     // idx 0 here is the furthest future. 
                     // The real index in 'future' array for jumpToFuture needs to be calculated.
                     // entry is future[future.length - 1 - idx]
                     const realIndex = future.length - 1 - idx;
                     
                     return (
                        <div 
                            key={`fut-${entry.id || idx}`}
                            onClick={() => jumpToFuture(realIndex)}
                            className="group flex relative pl-10 pr-4 py-3 hover:bg-white/5 cursor-pointer transition-colors"
                        >
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-slate-700 bg-[#141414] group-hover:border-slate-500 transition-colors z-10"></div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-sm text-slate-400 font-medium group-hover:text-slate-200">{entry.action}</span>
                                    <span className="text-[10px] text-slate-600">{timeAgo(entry.timestamp)}</span>
                                </div>
                                <span className="text-[10px] text-slate-600">Redo to this point</span>
                            </div>
                        </div>
                     );
                 })}

                 {/* CURRENT STATE INDICATOR */}
                 <div className="relative pl-10 pr-4 py-4 bg-blue-500/10 border-y border-blue-500/20 my-2">
                     <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-blue-500 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] z-20"></div>
                     <div className="flex items-center gap-2">
                         <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Current Version</span>
                         <span className="text-[10px] text-blue-400/60">Now</span>
                     </div>
                 </div>

                 {/* PAST (Stack: Top to Bottom) */}
                 {[...history].reverse().map((entry, idx) => {
                     // history is past. 
                     // history[history.length-1] is most recent past.
                     // Reverse map gives us most recent first.
                     const realIndex = history.length - 1 - idx;
                     
                     return (
                        <div 
                            key={`past-${entry.id || idx}`}
                            onClick={() => restoreHistory(realIndex)}
                            className="group flex relative pl-10 pr-4 py-3 hover:bg-white/5 cursor-pointer transition-colors"
                        >
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-slate-600 bg-slate-400 group-hover:bg-white group-hover:border-white transition-colors z-10 shadow-sm"></div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-sm text-slate-300 font-medium group-hover:text-white">{entry.action}</span>
                                    <span className="text-[10px] text-slate-500">{timeAgo(entry.timestamp)}</span>
                                </div>
                                <span className="text-[10px] text-slate-500 group-hover:text-slate-400">Restore to this point</span>
                            </div>
                        </div>
                     );
                 })}
                 
                 {history.length === 0 && (
                     <div className="pl-10 pr-4 py-4 text-slate-600 text-xs italic">
                         Initial State (Start)
                     </div>
                 )}

             </div>
          </div>
       </div>
    </div>
  );
};
