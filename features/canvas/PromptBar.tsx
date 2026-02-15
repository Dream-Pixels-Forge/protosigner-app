
import React, { useState, useRef, useEffect } from 'react';
import { useEditor } from '../../context/EditorContext';
import { UIElement, ExpertMode } from '../../types';
import { AGENT_REGISTRY } from '../ai/agents';
import { SKILL_REGISTRY } from '../ai/skills';
import { getRandomPrompt } from '../ai/randomPrompts';

type GenMode = 'content' | 'style' | 'page';

export const PromptBar: React.FC = () => {
    const { 
        elements, 
        selectedId, 
        isGenerating, 
        generateContent, 
        generateStyles,
        expertMode,
        setExpertMode
    } = useEditor();
    
    const [prompt, setPrompt] = useState('');
    const [mode, setMode] = useState<GenMode>('content');
    const [attachedImage, setAttachedImage] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    
    // Skill & Agent State
    const [showSkills, setShowSkills] = useState(false);
    const [showAgents, setShowAgents] = useState(false);
    const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
    
    // Surprise / Random Mode
    const [isSurpriseMode, setIsSurpriseMode] = useState(false);
    
    // Auto Create Page Feature
    const [autoCreatePage, setAutoCreatePage] = useState(false);
    
    // Animation State
    const [placeholder, setPlaceholder] = useState('');
    const typingTimeoutRef = useRef<any>(null);
    const textIndexRef = useRef(0);
    const charIndexRef = useRef(0);
    const isDeletingRef = useRef(false);
    
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);
    const skillsRef = useRef<HTMLDivElement>(null);
    const agentsRef = useRef<HTMLDivElement>(null);

    // Get current Agent
    const activeAgent = AGENT_REGISTRY.find(a => a.id === expertMode) || AGENT_REGISTRY[0];
    
    // Get current Skill
    const selectedSkill = SKILL_REGISTRY.find(s => s.id === selectedSkillId);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
        }
    }, [prompt, attachedImage]);

    // Close menus on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (skillsRef.current && !skillsRef.current.contains(event.target as Node)) {
                setShowSkills(false);
            }
            if (agentsRef.current && !agentsRef.current.contains(event.target as Node)) {
                setShowAgents(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const findElement = (els: UIElement[], id: string): UIElement | undefined => {
        for (const el of els) {
            if (el.id === id) return el;
            if (el.children) {
                const found = findElement(el.children, id);
                if (found) return found;
            }
        }
        return undefined;
    };

    const activePage = elements.find(el => el.type === 'page' && el.style?.display !== 'none') || elements[0];
    const selectedElement = selectedId ? findElement(elements, selectedId) : null;
    const selectedName = selectedElement ? selectedElement.name : (activePage?.name || 'Selection');

    // --- Typewriter Effect Logic ---
    useEffect(() => {
        textIndexRef.current = 0;
        charIndexRef.current = 0;
        isDeletingRef.current = false;
        setPlaceholder('');
    }, [mode, selectedElement?.id, isGenerating, isListening, expertMode]);

    useEffect(() => {
        if (prompt) return;
        const getTexts = () => {
            if (isGenerating) return [`${activeAgent.name} is thinking...`, "Consulting neural engine...", "Generating UI structure..."];
            if (isListening) return ["Listening...", "Go ahead, I'm listening...", "Speak your command..."];
            
            const contextName = mode === 'page' ? activePage.name : selectedName;
            return [`Ask ${activeAgent.name} to design ${contextName}...`];
        };
        const texts = getTexts();
        const type = () => {
            const currentText = texts[textIndexRef.current % texts.length];
            if (!currentText) { textIndexRef.current = 0; return; }
            if (isDeletingRef.current) {
                setPlaceholder(currentText.substring(0, charIndexRef.current - 1));
                charIndexRef.current--;
            } else {
                setPlaceholder(currentText.substring(0, charIndexRef.current + 1));
                charIndexRef.current++;
            }
            let typeSpeed = 30 + Math.random() * 20;
            if (isDeletingRef.current) typeSpeed /= 2;
            if (!isDeletingRef.current && charIndexRef.current === currentText.length) {
                isDeletingRef.current = true;
                typeSpeed = 2000;
            } else if (isDeletingRef.current && charIndexRef.current === 0) {
                isDeletingRef.current = false;
                textIndexRef.current++;
                typeSpeed = 500;
            }
            typingTimeoutRef.current = setTimeout(type, typeSpeed);
        };
        typingTimeoutRef.current = setTimeout(type, 100);
        return () => clearTimeout(typingTimeoutRef.current);
    }, [prompt, mode, selectedName, activePage.name, isGenerating, isListening, activeAgent.name]);


    const handleGenerate = () => {
        if (!prompt.trim() && !attachedImage && !selectedSkillId) return;
        
        // Pass skill ID instead of raw template structure
        if (mode === 'page') {
            const pageId = activePage.id;
            generateContent(prompt, pageId, attachedImage || undefined, selectedSkillId, autoCreatePage);
        } else if (mode === 'content') {
            generateContent(prompt, undefined, attachedImage || undefined, selectedSkillId);
        } else {
            generateStyles(prompt, undefined, attachedImage || undefined);
        }
        
        // Reset after generation start
        setPrompt('');
        setAttachedImage(null);
        setSelectedSkillId(null);
        setIsSurpriseMode(false); 
    };

    const handleSurpriseMe = () => {
        const randomPrompt = getRandomPrompt(expertMode);
        setPrompt(randomPrompt);
        setIsSurpriseMode(true);
    };

    const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPrompt(e.target.value);
        if (isSurpriseMode) setIsSurpriseMode(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) setAttachedImage(ev.target.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleMicrophone = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            recognition.onstart = () => setIsListening(true);
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setPrompt(prev => prev ? `${prev} ${transcript}` : transcript);
            };
            recognition.onend = () => setIsListening(false);
            recognitionRef.current = recognition;
            recognition.start();
        }
    };

    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-4xl z-50 flex flex-col gap-0" onMouseDown={(e) => e.stopPropagation()}>
            {/* Mode Toggles */}
            <div className="flex items-center gap-0.5 self-start ml-6 mb-[-1px] z-10">
                <button 
                    onClick={() => setMode('page')}
                    className={`px-4 py-1.5 rounded-t-lg text-[11px] font-bold transition-all border-t border-x ${mode === 'page' ? 'bg-[#1e1e1e] text-white border-white/20' : 'bg-black/40 text-slate-400 border-transparent hover:text-white hover:bg-black/60'}`}
                >
                    Page
                </button>
                <button 
                    onClick={() => setMode('content')}
                    className={`px-4 py-1.5 rounded-t-lg text-[11px] font-bold transition-all border-t border-x ${mode === 'content' ? 'bg-[#1e1e1e] text-white border-white/20' : 'bg-black/40 text-slate-400 border-transparent hover:text-white hover:bg-black/60'}`}
                >
                    Content
                </button>
                <button 
                    onClick={() => setMode('style')}
                    className={`px-4 py-1.5 rounded-t-lg text-[11px] font-bold transition-all border-t border-x flex items-center gap-1 ${mode === 'style' ? 'bg-[#1e1e1e] text-white border-white/20' : 'bg-black/40 text-slate-400 border-transparent hover:text-white hover:bg-black/60'}`}
                >
                    <span className="material-icons text-[12px]">palette</span>
                    Styles
                </button>
                
                {/* Agent Selection */}
                <div className="relative" ref={agentsRef}>
                    <div className="flex items-center">
                        <button 
                            onClick={() => setShowAgents(!showAgents)}
                            className={`ml-1 px-4 py-1.5 rounded-tl-lg text-[11px] font-bold transition-all border-t border-l border-b-0 flex items-center gap-1 ${showAgents || expertMode !== 'landing' ? 'bg-purple-900/30 text-purple-300 border-purple-500/30' : 'bg-black/40 text-slate-400 border-transparent hover:text-white hover:bg-black/60'}`}
                            title="Select Sub-Agent"
                        >
                            <span className="material-icons text-[12px]">psychology</span>
                            Agent: {activeAgent.name}
                        </button>
                        
                        {/* Surprise Me / Random Button */}
                        <button
                            onClick={handleSurpriseMe}
                            className={`px-3 py-1.5 rounded-tr-lg text-[11px] font-bold transition-all border-t border-r border-l border-b-0 flex items-center justify-center hover:bg-orange-500/20 group ${isSurpriseMode ? 'bg-orange-500/20 border-orange-500/30 text-orange-400' : 'bg-black/40 border-transparent text-slate-400'}`}
                            title="Surprise Me (Random Prompt)"
                        >
                            <span className={`material-icons text-[14px] transition-transform group-hover:rotate-180 ${isSurpriseMode ? 'text-orange-400' : 'text-slate-400 group-hover:text-orange-400'}`}>casino</span>
                        </button>
                    </div>
                    
                    {showAgents && (
                        <div className="absolute bottom-full left-0 mb-1 w-64 bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl p-2 animate-in slide-in-from-bottom-2 duration-200 z-[70]">
                             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 py-1 mb-2">Deploy Sub-Agent</div>
                             <div className="space-y-1">
                                {AGENT_REGISTRY.map(agent => (
                                    <button
                                        key={agent.id}
                                        onClick={() => { setExpertMode(agent.id); setShowAgents(false); }}
                                        className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${expertMode === agent.id ? 'bg-purple-600 text-white' : 'hover:bg-white/5 text-slate-300'}`}
                                    >
                                        <span className="material-icons text-lg opacity-80">{agent.icon}</span>
                                        <div>
                                            <div className="text-xs font-bold">{agent.name}</div>
                                            <div className="text-[10px] opacity-70">{agent.role}</div>
                                        </div>
                                        {expertMode === agent.id && <span className="material-icons text-sm ml-auto">check</span>}
                                    </button>
                                ))}
                             </div>
                        </div>
                    )}
                </div>

                {/* Auto Create Page Toggle (Only visible in Page Mode) */}
                {mode === 'page' && (
                    <div className="ml-1 flex items-center gap-1.5 bg-black/40 border border-white/10 px-2 py-1.5 rounded-t-lg border-b-0 border-transparent h-full">
                        <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">Create New Page</span>
                        <button
                            onClick={() => setAutoCreatePage(!autoCreatePage)}
                            className={`w-7 h-4 rounded-full relative transition-colors ${autoCreatePage ? 'bg-green-500' : 'bg-slate-700'}`}
                            title="Auto Create New Page on Generation"
                        >
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${autoCreatePage ? 'left-[14px]' : 'left-0.5'}`}></div>
                        </button>
                    </div>
                )}
            </div>

            <div className={`
                glass-high rounded-2xl rounded-tl-none p-2 shadow-2xl flex flex-col gap-2 group ring-1 bg-[#1e1e1e] relative overflow-visible transition-all duration-300
                ${isSurpriseMode ? 'ring-orange-500/50 shadow-orange-500/20' : 'ring-white/10'}
            `}>
                
                {/* Skills Popover */}
                {showSkills && (
                    <div 
                        ref={skillsRef}
                        className="absolute bottom-full left-0 mb-2 w-72 bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl p-2 animate-in slide-in-from-bottom-2 duration-200 z-[60]"
                    >
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 py-1 mb-2">
                             {activeAgent.name}'s Skills
                        </div>
                        <div className="space-y-1">
                            {SKILL_REGISTRY.map(skill => (
                                <button
                                    key={skill.id}
                                    onClick={() => { setSelectedSkillId(skill.id); setShowSkills(false); }}
                                    className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${selectedSkillId === skill.id ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-slate-300'}`}
                                >
                                    <span className="material-icons text-lg opacity-80">{skill.icon}</span>
                                    <div>
                                        <div className="text-xs font-bold">{skill.name}</div>
                                        <div className="text-[10px] opacity-70">{skill.description}</div>
                                    </div>
                                    {selectedSkillId === skill.id && <span className="material-icons text-sm ml-auto">check</span>}
                                </button>
                            ))}
                            <button
                                onClick={() => { setSelectedSkillId(null); setShowSkills(false); }}
                                className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors hover:bg-white/5 text-slate-400`}
                            >
                                <span className="material-icons text-lg opacity-80">check_box_outline_blank</span>
                                <div>
                                    <div className="text-xs font-bold">Free Form</div>
                                    <div className="text-[10px] opacity-70">Let {activeAgent.name} decide</div>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* Attached Image Preview */}
                {attachedImage && (
                    <div className="relative mx-3 mt-2 w-fit">
                        <img src={attachedImage} alt="Reference" className="h-16 w-auto rounded-lg border border-white/20 shadow-md" />
                        <button 
                            onClick={() => setAttachedImage(null)}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center shadow-sm hover:bg-red-600"
                        >
                            <span className="material-icons text-[10px]">close</span>
                        </button>
                    </div>
                )}

                <div className="flex items-end gap-2 pl-2">
                    {/* Media Tools */}
                    <div className="flex items-center gap-1 mb-2">
                        <button 
                            onClick={() => setShowSkills(!showSkills)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${selectedSkillId ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                            title="Equip Skill (Template)"
                        >
                            <span className="material-icons text-[18px]">
                                {selectedSkill ? selectedSkill.icon : 'view_quilt'}
                            </span>
                        </button>

                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            title="Upload Reference Image"
                        >
                            <span className="material-icons text-[18px]">attach_file</span>
                        </button>
                        <input 
                            ref={fileInputRef} 
                            type="file" 
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                        
                        <button 
                            onClick={toggleMicrophone}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                            title="Voice Input"
                        >
                            <span className="material-icons text-[18px]">{isListening ? 'mic' : 'mic_none'}</span>
                        </button>
                    </div>

                    <span className={`material-icons mb-3 ${isSurpriseMode ? 'text-orange-500' : mode === 'style' ? 'text-purple-400' : 'text-blue-400'} ${isGenerating ? 'animate-spin' : 'group-hover:animate-pulse'}`}>
                        {isGenerating ? 'sync' : mode === 'style' ? 'palette' : 'auto_awesome'}
                    </span>
                    
                    <textarea 
                        ref={textareaRef}
                        className={`bg-transparent border-none outline-none ring-0 focus:ring-0 text-sm flex-1 placeholder-slate-500 font-medium resize-none py-3 max-h-[150px] overflow-y-auto transition-colors ${isSurpriseMode ? 'text-orange-200' : 'text-slate-200'}`} 
                        placeholder={placeholder}
                        disabled={isGenerating}
                        value={prompt}
                        rows={1}
                        onChange={handlePromptChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleGenerate();
                            }
                        }}
                    />
                    
                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className={`
                            px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center gap-2 mb-0.5
                            ${isGenerating ? 'opacity-50 cursor-not-allowed bg-slate-700 text-slate-400' : 
                              isSurpriseMode 
                                ? 'bg-orange-500 text-white hover:bg-orange-400 shadow-orange-500/40 hover:shadow-orange-500/60' 
                                : 'bg-white text-black hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]'}
                        `}
                    >
                        {isGenerating ? 'Thinking...' : isSurpriseMode ? 'Surprise Me!' : 'Generate'}
                        <span className="material-icons text-sm">{isGenerating ? 'hourglass_empty' : 'bolt'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
