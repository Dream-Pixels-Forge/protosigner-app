
import React, { useState, useRef, useEffect } from 'react';
import { useEditor } from '../../context/EditorContext';
import { ProfileModal } from '../profile/ProfileModal';

export const Header: React.FC = () => {
  const { 
    toggleSettingsModal, 
    toggleExportModal, 
    toggleHistoryModal,
    undo, 
    redo, 
    canUndo, 
    canRedo,
    projectName,
    setProjectName,
    newProject,
    user,
    updateUser,
    setActiveSettingsTab,
    environmentMode,
    setEnvironmentMode
  } = useEditor();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
      if (confirm('Are you sure you want to sign out? This will reset your profile.')) {
        updateUser({ 
            name: 'Guest Designer', 
            email: 'guest@protosigner.pro', 
            avatarUrl: 'https://picsum.photos/seed/guest/200/200',
            role: 'Free Tier'
        });
        setIsProfileOpen(false);
      }
  };

  const openSettings = (tab: 'models' | 'billing') => {
      setActiveSettingsTab(tab);
      toggleSettingsModal();
      setIsProfileOpen(false);
  }

  const getInitials = (name: string) => {
      return name.split(' ').map(n => n[0]).join('').substr(0, 2).toUpperCase();
  };

  return (
    <>
    <header className="h-14 border-b border-white/5 bg-black/50 backdrop-blur-xl flex items-center justify-between px-4 shrink-0 z-50 relative">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg shadow-white/10">
            <span className="material-icons text-black text-xl">layers</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-white">Protosigner<span className="text-slate-500">.</span></span>
        </div>
        <div className="h-6 w-px bg-white/10"></div>
        <div className="flex items-center gap-3">
          {/* Undo/Redo Controls */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5 border border-white/5 mr-2">
            <button 
                onClick={undo} 
                disabled={!canUndo}
                className={`p-1.5 rounded transition-colors ${!canUndo ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                title="Undo (Ctrl+Z)"
            >
                <span className="material-icons text-sm">undo</span>
            </button>
            <button 
                onClick={redo} 
                disabled={!canRedo}
                className={`p-1.5 rounded transition-colors ${!canRedo ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                title="Redo (Ctrl+Shift+Z)"
            >
                <span className="material-icons text-sm">redo</span>
            </button>
          </div>

          <span className="text-sm text-slate-500">Project /</span>
          {/* Editable Project Name */}
          <input 
            type="text" 
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="bg-transparent text-sm font-medium text-slate-200 focus:text-white outline-none border-b border-transparent focus:border-white/20 transition-all w-48 hover:border-white/10"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* Environment Toggle */}
        <div className="flex bg-black/40 p-0.5 rounded-lg border border-white/5 mr-2">
            <button
                onClick={() => setEnvironmentMode('cloud')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md flex items-center gap-1.5 transition-all ${environmentMode === 'cloud' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}
            >
                <span className="material-icons text-[12px]">cloud</span> Cloud
            </button>
            <button
                onClick={() => setEnvironmentMode('local')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md flex items-center gap-1.5 transition-all ${environmentMode === 'local' ? 'bg-green-600 text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}
            >
                <span className="material-icons text-[12px]">terminal</span> Local
            </button>
        </div>

        <button 
          onClick={newProject}
          className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-white/5 rounded transition-colors text-slate-400 hover:text-white"
          title="Create New Project"
        >
          <span className="material-icons text-sm">add_circle_outline</span>
          <span>New</span>
        </button>
        <button 
          onClick={() => openSettings('models')}
          className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-white/5 rounded transition-colors text-slate-400 hover:text-white"
        >
          <span className="material-icons text-sm">settings_input_component</span>
          <span>Config</span>
        </button>
        <button 
            onClick={toggleHistoryModal}
            className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-white/5 rounded transition-colors text-slate-400 hover:text-white"
        >
          <span className="material-icons text-sm">history</span>
          <span>History</span>
        </button>
        <button 
          onClick={toggleExportModal}
          className="bg-white hover:bg-slate-200 text-black px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-white/10"
        >
          <span className="material-icons text-sm">code</span>
          Export
        </button>
        
        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
            <div 
                className="w-8 h-8 rounded-full overflow-hidden border border-white/20 cursor-pointer hover:border-white transition-colors bg-white/10 flex items-center justify-center relative"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
                {user.avatarUrl ? (
                    <img alt={user.name} src={user.avatarUrl} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-xs font-bold text-white">{getInitials(user.name)}</span>
                )}
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-full"></div>
            </div>

            {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-[#141414] border border-white/10 rounded-xl shadow-2xl p-1 animate-in slide-in-from-top-2 fade-in duration-200 z-[100]">
                    <div className="p-3 pb-2 border-b border-white/5 mb-1">
                        <div className="font-bold text-white text-sm">{user.name}</div>
                        <div className="text-xs text-slate-500 truncate">{user.email}</div>
                        <div className="mt-2 text-[10px] uppercase tracking-wider font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded w-fit">
                            {user.role}
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => { setIsProfileModalOpen(true); setIsProfileOpen(false); }}
                        className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        <span className="material-icons text-[16px]">person</span>
                        Edit Profile
                    </button>
                    <button 
                         onClick={() => openSettings('billing')}
                        className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        <span className="material-icons text-[16px]">credit_card</span>
                        Billing & Plans
                    </button>
                    <div className="h-px bg-white/5 my-1"></div>
                    <button 
                        onClick={handleSignOut}
                        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <span className="material-icons text-[16px]">logout</span>
                        Sign Out
                    </button>
                </div>
            )}
        </div>

      </div>
    </header>

    <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </>
  );
};
