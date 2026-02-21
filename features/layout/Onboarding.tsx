
import React, { useState, useEffect } from 'react';
import { useEditor } from '../../context/EditorContext';
import { useAuth } from '../../context/AuthContext';

interface OnboardingProps {
  onComplete: () => void;
}

const PRESETS = [
  { id: 'desktop', label: 'Desktop', width: 1440, height: 900, icon: 'laptop_mac' },
  { id: 'tablet', label: 'Tablet', width: 834, height: 1194, icon: 'tablet_mac' },
  { id: 'mobile', label: 'Mobile', width: 393, height: 852, icon: 'smartphone' },
  { id: 'custom', label: 'Custom', width: 1200, height: 800, icon: 'tune' },
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { updateUser, setProjectName, updateProjectSettings } = useEditor();
  const { user } = useAuth();
  
  // Local state
  const [localName, setLocalName] = useState('');
  const [localEmail, setLocalEmail] = useState('');
  const [pName, setPName] = useState('');
  
  // Dimensions State
  const [width, setWidth] = useState(PRESETS[0].width);
  const [viewportHeight, setViewportHeight] = useState(PRESETS[0].height);
  const [pageHeight, setPageHeight] = useState(PRESETS[0].height);
  
  const [activePresetId, setActivePresetId] = useState<string>('desktop');
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Check if user is already customized (not default)
    if (user && user.email !== 'demo@protosigner.pro') {
      setIsExistingUser(true);
      setLocalName(user.name || '');
    }
  }, [user]);

  const handlePresetSelect = (preset: typeof PRESETS[0]) => {
      setActivePresetId(preset.id);
      if (preset.id !== 'custom') {
          setWidth(preset.width);
          setViewportHeight(preset.height);
          setPageHeight(preset.height); // Start 1:1, user can extend
      }
  };

  const handleDimensionChange = (type: 'width' | 'vHeight' | 'pHeight', value: string) => {
      // Handle empty input to allow clearing
      if (value === '') {
          if (type === 'width') setWidth(0);
          if (type === 'vHeight') setViewportHeight(0);
          if (type === 'pHeight') setPageHeight(0);
          return;
      }

      const numValue = parseInt(value.replace(/[^0-9]/g, ''));
      if (isNaN(numValue)) return;
      
      if (type === 'width') setWidth(numValue);
      if (type === 'vHeight') {
          setViewportHeight(numValue);
          // We don't auto-adjust pageHeight here to avoid jumping values while user edits viewport
      }
      if (type === 'pHeight') {
          // Allow any value while typing. Constraint is applied on submit.
          setPageHeight(numValue); 
      }
      
      setActivePresetId('custom');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) return;

    // 1. Update Project
    setProjectName(pName);
    
    // Ensure logical constraints on submit
    const finalWidth = width > 0 ? width : 375; // Fallback min width
    const finalViewportH = viewportHeight > 0 ? viewportHeight : 600; // Fallback min height
    const finalPageH = Math.max(pageHeight > 0 ? pageHeight : finalViewportH, finalViewportH);

    updateProjectSettings({
      viewportSize: { width: finalWidth, height: finalViewportH },
      pageSize: { width: finalWidth, height: finalPageH }
    });

    // 2. Update Profile (if new)
    if (!isExistingUser && localName && localEmail) {
      updateUser({
        name: localName,
        email: localEmail,
        // Generate a deterministic avatar based on name
        avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${localName.replace(' ', '')}&backgroundColor=e5e7eb` 
      });
    }

    // 3. Exit Animation
    setIsExiting(true);
    setTimeout(onComplete, 600);
  };

  return (
    <div className={`fixed inset-0 z-[9000] bg-[#050505] flex items-center justify-center overflow-hidden transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* --- BACKGROUND DECORATIONS --- */}
      
      {/* 1. Dot Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-30"
           style={{
             backgroundImage: 'radial-gradient(#333 1.5px, transparent 1.5px)',
             backgroundSize: '24px 24px',
             maskImage: 'radial-gradient(circle at center, black 0%, transparent 80%)'
           }}>
      </div>

      {/* 2. Floating Elements (Decorations) */}
      <div className="absolute top-20 left-20 w-64 h-40 border border-white/5 rounded-xl bg-white/[0.02] backdrop-blur-sm -rotate-6 animate-[pulse_8s_ease-in-out_infinite]">
         <div className="absolute top-0 left-0 right-0 h-6 border-b border-white/5 flex items-center px-2 gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
            <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
         </div>
         <div className="p-4 space-y-2">
            <div className="w-3/4 h-2 bg-white/10 rounded"></div>
            <div className="w-1/2 h-2 bg-white/10 rounded"></div>
            <div className="flex gap-2 mt-4">
                <div className="w-8 h-8 rounded bg-blue-500/20"></div>
                <div className="w-8 h-8 rounded bg-purple-500/20"></div>
            </div>
         </div>
      </div>

      <div className="absolute bottom-32 right-32 text-slate-700 font-mono text-xs opacity-40 rotate-12">
          {`const render = () => { return <UI /> }`}
      </div>

      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>


      {/* --- MAIN CARD --- */}
      <div className="relative z-10 w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex animate-in zoom-in-95 duration-500">
        
        {/* Left Panel: Visual */}
        <div className="w-1/3 bg-black/40 border-r border-white/5 p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-transparent opacity-50"></div>
            
            <div className="relative z-10">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                    <span className="material-icons text-black text-2xl">layers</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Architect<br/>Your Vision.</h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                    Initialize your workspace settings. Prepare the neural engine for generation.
                </p>
            </div>

            <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="material-icons text-sm text-green-400">check_circle</span>
                    <span>AI Models Ready</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="material-icons text-sm text-green-400">check_circle</span>
                    <span>Design System Linked</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="material-icons text-sm text-green-400">check_circle</span>
                    <span>React 19 Environment</span>
                </div>
            </div>
        </div>

        {/* Right Panel: Form */}
        <div className="flex-1 p-10 bg-gradient-to-br from-[#0a0a0a] to-[#121212]">
            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Header */}
                <div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        {isExistingUser ? `Welcome back, ${localName.split(' ')[0]}` : 'Initialize Project'}
                        {isExistingUser && <span className="text-lg">👋</span>}
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">Configure your new canvas environment.</p>
                </div>

                {/* User Info (Only if new) */}
                {!isExistingUser && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Name</label>
                            <input 
                                required
                                value={localName}
                                onChange={(e) => setLocalName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-white/30 focus:ring-1 focus:ring-white/20 outline-none transition-all placeholder-slate-600"
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</label>
                            <input 
                                required
                                type="email"
                                value={localEmail}
                                onChange={(e) => setLocalEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-white/30 focus:ring-1 focus:ring-white/20 outline-none transition-all placeholder-slate-600"
                                placeholder="john@example.com"
                            />
                        </div>
                    </div>
                )}

                {/* Project Details */}
                <div className="space-y-1.5 animate-in fade-in slide-in-from-left-4 duration-500 delay-200">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Name</label>
                    <input 
                        required
                        value={pName}
                        onChange={(e) => setPName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-base text-white focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all placeholder-slate-600 font-medium"
                        placeholder="e.g. Neo-Bank Dashboard v1"
                        autoFocus
                    />
                </div>

                {/* Canvas Configuration */}
                <div className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-500 delay-300">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Canvas</label>
                    
                    {/* Presets Grid */}
                    <div className="grid grid-cols-4 gap-2">
                        {PRESETS.map(preset => (
                            <button
                                key={preset.id}
                                type="button"
                                onClick={() => handlePresetSelect(preset)}
                                className={`
                                    flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border transition-all duration-200
                                    ${activePresetId === preset.id 
                                        ? 'bg-white text-black border-white shadow-lg' 
                                        : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white'}
                                `}
                            >
                                <span className="material-icons text-lg">{preset.icon}</span>
                                <div className="text-[10px] font-bold">{preset.label}</div>
                            </button>
                        ))}
                    </div>

                    {/* Custom Input Row */}
                    <div className="p-3 bg-black/20 border border-white/5 rounded-lg space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                    Width <span className="text-slate-600">(Device)</span>
                                </label>
                                <input 
                                    type="number"
                                    value={width || ''}
                                    onChange={(e) => handleDimensionChange('width', e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:border-white/30 outline-none font-mono text-center"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                    Fold <span className="text-slate-600">(Viewport)</span>
                                </label>
                                <input 
                                    type="number"
                                    value={viewportHeight || ''}
                                    onChange={(e) => handleDimensionChange('vHeight', e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:border-white/30 outline-none font-mono text-center"
                                />
                            </div>
                        </div>
                        
                        {/* Page Height Separator */}
                        <div className="relative pt-1">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-white/5"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-[#101010] px-2 text-[9px] text-slate-600">Total Scrollable Area</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase flex items-center justify-between">
                                <span>Page Height</span>
                                {pageHeight > viewportHeight && (
                                    <span className="text-blue-400">Scrolls {pageHeight - viewportHeight}px</span>
                                )}
                            </label>
                            <input 
                                type="number"
                                value={pageHeight || ''}
                                onChange={(e) => handleDimensionChange('pHeight', e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:border-white/30 outline-none font-mono text-center"
                            />
                        </div>
                    </div>
                </div>

                {/* Action */}
                <div className="pt-4 border-t border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
                    <button 
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                        <span>Launch Workspace</span>
                        <span className="material-icons text-sm">arrow_forward</span>
                    </button>
                </div>

            </form>
        </div>
      </div>
      
      {/* Footer Version */}
      <div className="absolute bottom-6 text-[10px] text-slate-600 font-mono">
          Protosigner Pro • Early Access Build
      </div>
    </div>
  );
};
