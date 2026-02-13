
import React from 'react';

interface GridItemsProps {
  count?: number;
  darkMode: boolean;
}

export const GridItems: React.FC<GridItemsProps> = ({ count = 3, darkMode }) => {
  // Ensure we render at least 1 item
  const safeCount = Math.max(1, count);
  
  return (
    <>
      {Array.from({ length: safeCount }).map((_, i) => (
        <div key={i} className={`
          min-h-[200px] rounded-xl border p-6 flex flex-col items-center justify-center gap-4 transition-all
          ${darkMode 
            ? 'bg-slate-900/50 border-white/5 hover:bg-slate-900 hover:border-primary/30' 
            : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-primary/30'
          }
        `}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? 'bg-slate-800' : 'bg-white shadow-sm'}`}>
             <span className="material-icons text-primary opacity-80 text-xl">
               {i % 3 === 0 ? 'speed' : i % 3 === 1 ? 'sync' : 'security'}
             </span>
          </div>
          <div className="text-center space-y-2 w-full">
             <div className={`h-4 w-3/4 rounded mx-auto ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
             <div className={`h-3 w-1/2 rounded mx-auto ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          </div>
        </div>
      ))}
    </>
  );
};
