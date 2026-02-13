
import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const CHECKLIST = [
  "Initializing Neural Engine...",
  "Loading Vector Graphics Context...",
  "Syncing Design Tokens...",
  "Optimizing GPU Acceleration...",
  "Ready."
];

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Step through the checklist
    if (step < CHECKLIST.length - 1) {
      const timeout = setTimeout(() => {
        setStep(prev => prev + 1);
      }, 400 + Math.random() * 300); // Random "processing" time
      return () => clearTimeout(timeout);
    } else {
      // Finished loading, wait a moment then exit
      const timeout = setTimeout(() => {
        setIsExiting(true);
        setTimeout(onComplete, 800); // Wait for exit animation
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [step, onComplete]);

  return (
    <div 
        className={`
            fixed inset-0 z-[9999] bg-[#030303] flex flex-col items-center justify-center overflow-hidden
            transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]
            ${isExiting ? 'opacity-0 scale-110 blur-sm pointer-events-none' : 'opacity-100 scale-100'}
        `}
    >
      {/* Background Grid - Aligned with Canvas Defaults (20px, subtle white) */}
      <div className="absolute inset-0 pointer-events-none opacity-100" 
           style={{ 
             backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)', 
             backgroundSize: '20px 20px',
             maskImage: 'radial-gradient(circle at center, black 40%, transparent 90%)',
             WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 90%)'
           }}>
      </div>
      
      {/* Secondary large grid for technical feel */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
           style={{
             backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
             backgroundSize: '150px 150px',
             maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)',
             WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
           }}>
      </div>
      
      {/* Glowing Orb / AI Core */}
      <div className={`
        absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] 
        bg-gradient-to-tr from-indigo-500/20 via-purple-500/10 to-transparent rounded-full blur-[100px]
        transition-opacity duration-1000 ${isExiting ? 'opacity-0' : 'opacity-100'}
      `}></div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Icon Animation */}
        <div className="mb-8 relative">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.2)] animate-in fade-in zoom-in duration-700">
             <span className="material-icons text-black text-5xl">layers</span>
          </div>
          {/* Orbiting ring */}
          <div className="absolute inset-[-10px] border border-white/20 rounded-3xl animate-[spin_10s_linear_infinite]"></div>
          <div className="absolute inset-[-10px] border border-white/10 rounded-3xl rotate-45"></div>
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-100">
            Protosigner<span className="text-slate-500">.pro</span>
        </h1>
        <p className="text-slate-500 text-sm tracking-widest uppercase mb-12 animate-in slide-in-from-bottom-2 fade-in duration-700 delay-200">
            AI-Powered Interface Architect
        </p>

        {/* Technical Boot Sequence */}
        <div className="w-64 h-8 relative">
            {CHECKLIST.map((text, index) => (
                <div 
                    key={index}
                    className={`
                        absolute inset-0 flex items-center justify-center text-xs font-mono transition-all duration-300
                        ${index === step ? 'opacity-100 transform translate-y-0 text-white' : 
                          index < step ? 'opacity-0 transform -translate-y-4 text-slate-500' : 
                          'opacity-0 transform translate-y-4 text-slate-500'}
                    `}
                >
                    <span className="mr-2 text-green-400">{index === step ? '>' : '✓'}</span>
                    {text}
                </div>
            ))}
        </div>

        {/* Progress Bar */}
        <div className="w-48 h-1 bg-white/10 rounded-full mt-4 overflow-hidden relative">
            <div 
                className="absolute top-0 left-0 h-full bg-white transition-all duration-300 ease-out"
                style={{ width: `${((step + 1) / CHECKLIST.length) * 100}%` }}
            ></div>
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>

      {/* Footer Version Info */}
      <div className="absolute bottom-8 text-[10px] text-slate-600 font-mono">
         v2.5.0-beta // Core: Stable
      </div>
    </div>
  );
};
