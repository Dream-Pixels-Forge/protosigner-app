
import React from 'react';

interface HeroSectionProps {
  darkMode: boolean;
  animateEntrance: boolean;
  title: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  darkMode,
  animateEntrance,
  title,
  subtitle,
  primaryCta,
  secondaryCta
}) => {
  return (
    <div 
        className={`
            flex flex-col items-center justify-center text-center p-20 space-y-6 relative select-none w-full h-full
            ${animateEntrance ? 'animate-in fade-in zoom-in duration-700' : ''}
            transition-all duration-300
        `}
    >
        <h1 className={`text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b ${darkMode ? 'from-white to-slate-400' : 'from-black to-slate-600'}`}>
            {title.split('\\n').map((line, i) => (
                <React.Fragment key={i}>
                    {line}
                    {i < title.split('\\n').length - 1 && <br />}
                </React.Fragment>
            ))}
        </h1>
        
        <p className={`max-w-lg text-lg ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {subtitle}
        </p>
        
        <div className="flex gap-4 pt-4 z-20">
            <button className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${darkMode ? 'bg-white text-black hover:bg-slate-200 shadow-white/10' : 'bg-black text-white hover:bg-slate-800 shadow-black/20'}`}>
                {primaryCta}
            </button>
            <button className={`px-8 py-3 rounded-xl font-bold border transition-colors ${darkMode ? 'bg-black/50 border-white/20 text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'}`}>
                {secondaryCta}
            </button>
        </div>
    </div>
  );
};
