
import React, { useState } from 'react';

// --- Atomic Sub-Components ---

export const PropertySection: React.FC<{ title: string; icon: string; children: React.ReactNode; isOpen?: boolean }> = ({ title, icon, children, isOpen = true }) => {
    const [expanded, setExpanded] = useState(isOpen);
    return (
        <div className="border-b border-white/5 pb-1 mb-1 last:border-0">
            <button 
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3 px-1 hover:text-slate-300 transition-colors"
            >
                <span className="flex items-center gap-2">
                    <span className="material-icons text-[14px]">{icon}</span>
                    {title}
                </span>
                <span className="material-icons text-[14px] opacity-50">{expanded ? 'expand_less' : 'expand_more'}</span>
            </button>
            {expanded && (
                <div className="space-y-3 px-1 pb-4 animate-in slide-in-from-top-1 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
};

export const Row: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`flex items-center gap-2 ${className}`}>{children}</div>
);

export const Label: React.FC<{ children: React.ReactNode; icon?: string }> = ({ children, icon }) => (
  <label className="text-[10px] text-slate-400 font-medium mb-1.5 flex items-center gap-1">
    {icon && <span className="material-icons text-[10px]">{icon}</span>}
    {children}
  </label>
);

export const NumberInput: React.FC<{ 
  label?: string; 
  icon?: string;
  value: any; 
  onChange: (val: any) => void; 
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
  placeholder?: string;
}> = ({ label, icon, value, onChange, unit, step = 1, min: _min, max: _max, placeholder = "Auto" }) => (
  <div className="flex-1 min-w-0">
    {label && <Label icon={icon}>{label}</Label>}
    <div className="relative group bg-black/20 border border-white/10 rounded flex items-center hover:border-white/20 focus-within:border-white/40 transition-colors">
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => {
          const val = e.target.value;
          // Allow empty string to clear value
          if (val === '') {
              onChange(undefined);
              return;
          }
          // Check if it's a valid number
          const num = Number(val);
          if (!isNaN(num)) {
              onChange(num);
          } else {
              // Pass raw string for 'auto', '100%', 'max-content' etc.
              onChange(val);
          }
        }}
        onKeyDown={(e) => {
            // Only increment if it's a number
            const num = Number(value);
            if (!isNaN(num)) {
                if(e.key === 'ArrowUp') {
                    e.preventDefault();
                    onChange(num + step);
                }
                if(e.key === 'ArrowDown') {
                    e.preventDefault();
                    onChange(num - step);
                }
            }
        }}
        className="w-full bg-transparent border-none py-1.5 pl-2 pr-6 text-xs text-slate-200 outline-none placeholder-slate-600 font-mono"
        placeholder={placeholder}
      />
      <div className="absolute right-1 top-0 bottom-0 flex items-center pointer-events-none">
         <span className="text-[9px] text-slate-600">{unit}</span>
      </div>
    </div>
  </div>
);

export const SliderInput: React.FC<{
    label?: string;
    value: number;
    onChange: (val: number) => void;
    min?: number;
    max?: number;
    unit?: string;
}> = ({ label, value, onChange, min = 0, max = 100, unit = '%' }) => (
    <div className="flex-1">
        {label && <Label>{label}</Label>}
        <div className="flex items-center gap-2">
            <input 
                type="range" 
                min={min} 
                max={max} 
                value={Number(value) || 0} 
                onChange={(e) => onChange(Number(e.target.value))}
                className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white hover:accent-slate-200"
            />
            <div className="w-12 bg-black/20 border border-white/10 rounded px-1 py-1 text-center">
                <span className="text-[10px] text-slate-300 font-mono">{value}{unit}</span>
            </div>
        </div>
    </div>
);

export const ColorInput: React.FC<{ label?: string; value: string; onChange: (val: string) => void }> = ({ label, value, onChange }) => (
  <div className="flex-1">
    {label && <Label>{label}</Label>}
    <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded p-1 hover:border-white/20 transition-colors">
      <div className="relative w-5 h-5 rounded bg-checkerboard overflow-hidden flex-shrink-0 border border-white/10">
        <input
          type="color"
          value={value && value.startsWith('#') ? value : '#ffffff'}
          onChange={(e) => onChange(e.target.value)}
          className="absolute -top-2 -left-2 w-8 h-8 cursor-pointer p-0 opacity-0"
        />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: value }}></div>
      </div>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-[10px] text-slate-300 outline-none font-mono uppercase focus:text-white"
        placeholder="None"
      />
    </div>
  </div>
);

export const SelectInput: React.FC<{ 
  label?: string; 
  value: any; 
  options: { label: string; value: string }[]; 
  onChange: (val: string) => void 
}> = ({ label, value, options, onChange }) => (
  <div className="flex-1">
    {label && <Label>{label}</Label>}
    <div className="relative">
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black/20 border border-white/10 rounded px-2 py-1.5 text-xs text-slate-300 outline-none focus:border-white/40 appearance-none cursor-pointer hover:bg-white/5 transition-colors"
      >
        {options.map(opt => <option key={opt.value} value={opt.value} className="bg-[#1e1e1e]">{opt.label}</option>)}
      </select>
      <span className="material-icons absolute right-2 top-1.5 text-[14px] text-slate-500 pointer-events-none">expand_more</span>
    </div>
  </div>
);

export const ButtonTabs: React.FC<{
  options: { icon?: string; label?: string; value: any; title: string }[];
  value: any;
  onChange: (val: any) => void;
}> = ({ options, value, onChange }) => (
  <div className="flex bg-black/40 p-0.5 rounded-lg border border-white/5">
    {options.map((opt) => (
      <button
        key={String(opt.value)}
        onClick={() => onChange(opt.value)}
        title={opt.title}
        className={`flex-1 flex items-center justify-center py-1 px-2 rounded-md transition-all ${
          value === opt.value 
            ? 'bg-white/10 text-white shadow-sm border border-white/5' 
            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
        }`}
      >
        {opt.icon && <span className="material-icons text-[16px]">{opt.icon}</span>}
        {opt.label && <span className="text-[10px] font-bold ml-1">{opt.label}</span>}
      </button>
    ))}
  </div>
);

export const IconButton: React.FC<{ 
    icon: string; 
    active?: boolean; 
    onClick: () => void; 
    title?: string;
    className?: string;
}> = ({ icon, active, onClick, title, className = '' }) => (
    <button
        onClick={onClick}
        title={title}
        className={`
            w-7 h-7 flex items-center justify-center rounded transition-all border
            ${active 
                ? 'bg-white text-black border-white shadow-sm' 
                : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/10'}
            ${className}
        `}
    >
        <span className="material-icons text-[18px]">{icon}</span>
    </button>
);

export const AlignmentMatrix: React.FC<{
    justify: string;
    align: string;
    direction: 'row' | 'column';
    onChange: (j: string, a: string) => void;
}> = ({ justify = 'flex-start', align = 'flex-start', direction, onChange }) => {
    const isRow = direction === 'row';
    
    // Simplistic mapping for UI (Start/Center/End)
    const mapToIndices = (j: string, a: string) => {
        const toIndex = (val: string) => {
            if (val?.includes('center')) return 1;
            if (val?.includes('end')) return 2;
            if (val?.includes('space-between')) return 3; // Special case for distribution
            return 0; // start
        };
        return isRow ? { x: toIndex(j), y: toIndex(a) } : { x: toIndex(a), y: toIndex(j) };
    };

    const { x: activeX, y: activeY } = mapToIndices(justify, align);

    const handleClick = (ix: number, iy: number) => {
        const toVal = (idx: number) => ['flex-start', 'center', 'flex-end'][idx];
        const valX = toVal(ix);
        const valY = toVal(iy);
        
        if (isRow) onChange(valX, valY);
        else onChange(valY, valX);
    };

    return (
        <div className="w-[72px] h-[72px] bg-black/30 rounded-lg border border-white/10 grid grid-cols-3 grid-rows-3 p-1.5 gap-1">
            {[0, 1, 2].map(y => (
                [0, 1, 2].map(x => (
                    <div 
                        key={`${x}-${y}`}
                        onClick={() => handleClick(x, y)}
                        className={`
                            rounded-[2px] cursor-pointer hover:bg-white/20 transition-all flex items-center justify-center
                            ${activeX === x && activeY === y ? 'bg-blue-500 shadow-sm ring-1 ring-blue-400' : ''}
                        `}
                    >
                        <div className={`w-0.5 h-0.5 rounded-full ${activeX === x && activeY === y ? 'bg-white' : 'bg-slate-600'}`}></div>
                    </div>
                ))
            ))}
        </div>
    );
};
