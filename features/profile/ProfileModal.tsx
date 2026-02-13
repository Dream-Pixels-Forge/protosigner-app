
import React, { useState, useRef, useEffect } from 'react';
import { useEditor } from '../../context/EditorContext';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
    const { user, updateUser } = useEditor();
    
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
    const [role, setRole] = useState(user.role);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync state when user changes
    useEffect(() => {
        if(isOpen) {
            setName(user.name);
            setEmail(user.email);
            setAvatarUrl(user.avatarUrl);
            setRole(user.role);
        }
    }, [isOpen, user]);

    const handleSave = () => {
        updateUser({ name, email, avatarUrl, role });
        onClose();
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    setAvatarUrl(ev.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative z-10 w-full max-w-md bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                        <span className="material-icons text-slate-400">person</span>
                        <h2 className="text-white font-bold text-lg">Profile Settings</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><span className="material-icons">close</span></button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-white transition-colors">
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="material-icons text-white">edit</span>
                            </div>
                        </div>
                        <input 
                            ref={fileInputRef} 
                            type="file" 
                            accept="image/*" 
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                        <div className="text-xs text-slate-500">Click to change avatar</div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs text-slate-400 font-medium ml-1">Display Name</label>
                            <input 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-white/40 outline-none"
                                placeholder="Your Name"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-slate-400 font-medium ml-1">Email Address</label>
                            <input 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-white/40 outline-none"
                                placeholder="name@example.com"
                            />
                        </div>

                         <div className="space-y-1">
                            <label className="text-xs text-slate-400 font-medium ml-1">Role / Plan</label>
                            <input 
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-white/40 outline-none"
                                placeholder="e.g. Pro Plan"
                            />
                        </div>

                        <div className="pt-2">
                             <label className="text-xs text-slate-400 font-medium ml-1">Avatar URL (Optional)</label>
                             <input 
                                value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-xs text-slate-300 focus:border-white/40 outline-none font-mono"
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-white/5 bg-white/[0.02] flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        className="bg-white text-black px-6 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors shadow-lg shadow-white/10"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
