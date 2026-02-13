
import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label }) => {
  return (
    <div className="flex items-center justify-between cursor-pointer group" onClick={() => onChange(!checked)}>
      {label && <span className="text-slate-400 text-xs">{label}</span>}
      <div className={`relative w-8 h-4 rounded-full transition-colors duration-200 ${checked ? 'bg-white' : 'bg-slate-700'}`}>
        <div 
          className={`absolute top-0.5 w-3 h-3 bg-black rounded-full transition-transform duration-200 shadow-sm ${checked ? 'left-[18px]' : 'left-0.5'}`}
        ></div>
      </div>
    </div>
  );
};
