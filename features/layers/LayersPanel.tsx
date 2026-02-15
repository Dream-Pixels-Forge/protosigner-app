
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useEditor } from '../../context/EditorContext';
import { UIElement } from '../../types';

// --- Types & Helper Functions ---

interface LayerItemProps {
  element: UIElement;
  depth?: number;
  selectedId: string | null;
  selectedIds: string[];
  onSelect: (id: string, multi: boolean) => void;
  onToggleExpand: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDrop: (dragId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
}

const LayerItem: React.FC<LayerItemProps> = ({ 
    element, 
    depth = 0, 
    selectedId, 
    selectedIds,
    onSelect, 
    onToggleExpand, 
    onRename,
    onDrop
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(element.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);
  
  // Drag State
  const [dragOverPos, setDragOverPos] = useState<'top' | 'bottom' | 'center' | null>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditName(element.name);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editName.trim() && editName !== element.name) {
        onRename(element.id, editName);
    } else {
        setEditName(element.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleBlur();
    if (e.key === 'Escape') {
        setIsEditing(false);
        setEditName(element.name);
    }
  };

  // DnD Handlers
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', element.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!itemRef.current) return;
    
    const rect = itemRef.current.getBoundingClientRect();
    const relY = e.clientY - rect.top;
    
    if (relY < rect.height * 0.25) {
        setDragOverPos('top');
    } else if (relY > rect.height * 0.75) {
        setDragOverPos('bottom');
    } else {
        setDragOverPos('center');
    }
  };

  const handleDragLeave = () => {
      setDragOverPos(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const dragId = e.dataTransfer.getData('text/plain');
    setDragOverPos(null);

    if (dragId === element.id) return;
    
    let position: 'before' | 'after' | 'inside' = 'inside';
    if (dragOverPos === 'top') position = 'before';
    if (dragOverPos === 'bottom') position = 'after';
    if (dragOverPos === 'center') position = 'inside';

    onDrop(dragId, element.id, position);
  };

  const iconMap: Record<string, string> = {
    page: 'web', section: 'view_agenda', container: 'view_quilt', text: 'title',
    button: 'smart_button', grid: 'grid_view', image: 'image', circle: 'circle',
    rectangle: 'rectangle', frame: 'crop_free', box: 'check_box_outline_blank'
  };

  const hasChildren = element.children && element.children.length > 0;
  const isSelected = selectedIds.includes(element.id);
  const isPrimarySelected = selectedId === element.id;
  const isExpanded = element.isExpanded !== false; 
  const isHidden = element.style?.display === 'none';
  const isLocked = element.isLocked;

  return (
    <div className={`select-none ${isHidden ? 'opacity-50' : 'opacity-100'}`}>
      <div 
        ref={itemRef}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={(e) => {
          e.stopPropagation();
          const multi = e.metaKey || e.ctrlKey;
          onSelect(element.id, multi);
        }}
        className={`
          group flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-all text-sm mb-0.5 relative
          ${isPrimarySelected ? 'bg-white text-black font-semibold shadow-lg shadow-white/5' : isSelected ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'}
        `}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {dragOverPos === 'top' && <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 pointer-events-none z-50"></div>}
        {dragOverPos === 'bottom' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 pointer-events-none z-50"></div>}
        {dragOverPos === 'center' && <div className="absolute inset-0 bg-blue-500/20 border border-blue-500 rounded pointer-events-none z-50"></div>}

        <span 
            className={`material-icons text-[14px] cursor-pointer hover:bg-white/10 rounded ${isSelected ? 'text-current' : 'text-slate-600 group-hover:text-white'} ${!hasChildren ? 'opacity-0' : ''}`}
            onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(element.id);
            }}
        >
            {isExpanded ? 'expand_more' : 'chevron_right'}
        </span>
        
        <span className={`material-icons text-[14px] ${isSelected ? 'text-current' : 'text-slate-500'}`}>
          {iconMap[element.type] || 'circle'}
        </span>
        
        {isEditing ? (
            <input
                ref={inputRef}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 bg-transparent border-b border-blue-500 outline-none min-w-0 px-1 text-sm font-medium"
            />
        ) : (
            <span 
                className="flex-1 truncate"
                onDoubleClick={handleDoubleClick}
                title="Double click to rename"
            >
                {element.name}
            </span>
        )}
        
        {/* Status Indicators */}
        <div className="flex items-center gap-1 pr-1 opacity-70">
            {isLocked && <span className="material-icons text-[10px] text-slate-500">lock</span>}
            {isHidden && <span className="material-icons text-[10px] text-slate-500">visibility_off</span>}
        </div>
      </div>
      
      {hasChildren && isExpanded && element.children?.map(child => (
        <LayerItem 
          key={child.id} 
          element={child} 
          depth={depth + 1} 
          selectedId={selectedId}
          selectedIds={selectedIds}
          onSelect={onSelect}
          onToggleExpand={onToggleExpand}
          onRename={onRename}
          onDrop={onDrop}
        />
      ))}
    </div>
  );
};

// --- DATA: Mock Images & Icons ---
const MOCK_IMAGES = [
    { id: 'img1', url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=500&auto=format&fit=crop', name: 'Mountain' },
    { id: 'img2', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop', name: 'Tech' },
    { id: 'img3', url: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=500&auto=format&fit=crop', name: 'Minimal' },
    { id: 'img4', url: 'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=500&auto=format&fit=crop', name: 'Office' },
    { id: 'img5', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop', name: 'Portrait' },
    { id: 'img6', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop', name: 'Data' },
];

const MOCK_ICONS = [
    'home', 'settings', 'search', 'favorite', 'add', 'delete', 'edit', 'check', 
    'close', 'menu', 'arrow_forward', 'arrow_back', 'logout', 'login', 'person', 
    'shopping_cart', 'notifications', 'email', 'call', 'map', 'dashboard', 'analytics', 'radar', 'qr_code', 'terminal'
];

// --- DATA: HUD Assets ---
const MOCK_HUD_ASSETS = [
    {
        id: 'hud-circle-1',
        name: 'Target Reticle',
        icon: 'gps_fixed',
        element: {
            type: 'circle',
            name: 'Target Reticle',
            style: { 
                width: 200, height: 200, 
                border: '2px solid #06b6d4', // Cyan
                backgroundColor: 'transparent',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            },
            children: [
                { type: 'circle', name: 'Inner Dot', style: { width: 10, height: 10, backgroundColor: '#06b6d4' } },
                { type: 'box', name: 'Cross H', style: { position: 'absolute', width: '100%', height: 1, backgroundColor: '#06b6d4', opacity: 0.5 } },
                { type: 'box', name: 'Cross V', style: { position: 'absolute', width: 1, height: '100%', backgroundColor: '#06b6d4', opacity: 0.5 } }
            ]
        }
    },
    {
        id: 'hud-bracket-1',
        name: 'Data Bracket',
        icon: 'crop_free',
        element: {
            type: 'container',
            name: 'HUD Bracket',
            style: { 
                width: 300, height: 150, 
                border: '1px solid #22c55e', // Green
                borderLeft: '4px solid #22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.05)',
                padding: 16,
                display: 'flex', flexDirection: 'column', gap: 8
            },
            children: [
                { type: 'text', name: 'Label', props: { text: 'SYSTEM STATUS: ONLINE' }, style: { fontFamily: 'monospace', fontSize: 12, color: '#22c55e' } },
                { type: 'box', name: 'Bar BG', style: { width: '100%', height: 4, backgroundColor: '#052e16' }, children: [
                     { type: 'box', name: 'Bar Fill', style: { width: '75%', height: '100%', backgroundColor: '#22c55e' } }
                ]}
            ]
        }
    },
    {
        id: 'hud-terminal-1',
        name: 'Terminal Log',
        icon: 'terminal',
        element: {
            type: 'container',
            name: 'Log Window',
            style: {
                width: 250, height: 180,
                backgroundColor: '#0a0a0a',
                border: '1px solid #ef4444', // Red
                padding: 12,
                fontFamily: 'monospace'
            },
            children: [
                { type: 'text', name: 'Line 1', props: { text: '> INIT SEQUENCE...' }, style: { fontSize: 10, color: '#ef4444' } },
                { type: 'text', name: 'Line 2', props: { text: '> LOADING ASSETS...' }, style: { fontSize: 10, color: '#ef4444', opacity: 0.8 } },
                { type: 'text', name: 'Line 3', props: { text: '> ERROR: 404 NOT FOUND' }, style: { fontSize: 10, color: '#ef4444', opacity: 0.6 } }
            ]
        }
    }
];

// --- DATA: Component Templates ---
const COMPONENT_TEMPLATES = [
    {
        id: 'comp-card-1',
        name: 'Feature Card',
        icon: 'video_label',
        element: {
            type: 'container',
            name: 'Feature Card',
            style: { width: 320, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 16, border: '1px solid rgba(255,255,255,0.1)' },
            children: [
                { type: 'box', name: 'Icon Box', style: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: [{ type: 'text', name: 'Icon', props: { text: 'star' }, style: { fontFamily: 'Material Icons', fontSize: 24, color: 'white' } }] },
                { type: 'text', name: 'Title', props: { text: 'Feature Title' }, style: { fontSize: 20, fontWeight: 'bold', color: 'white' } },
                { type: 'text', name: 'Description', props: { text: 'Description of the feature goes here. Make it compelling.' }, style: { fontSize: 14, color: '#94a3b8', lineHeight: '1.5' } }
            ]
        }
    },
];

export const LayersPanel: React.FC = () => {
  const { 
      elements, selectedId, selectedIds, selectElement, 
      toggleElementLock, toggleElementExpand, toggleVisibility,
      deleteElement, addElement, renameElement, reorderElement 
  } = useEditor();
  
  const [activeTab, setActiveTab] = useState<'layers' | 'assets'>('layers');
  const [assetCategory, setAssetCategory] = useState<'components' | 'hud' | 'images' | 'icons' | 'uploads'>('components');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadedImages, setUploadedImages] = useState<{name: string, url: string}[]>([]);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // --- Filtering Logic ---
  const filteredComponents = useMemo(() => COMPONENT_TEMPLATES.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())), [searchQuery]);
  const filteredImages = useMemo(() => MOCK_IMAGES.filter(img => img.name.toLowerCase().includes(searchQuery.toLowerCase())), [searchQuery]);
  const filteredIcons = useMemo(() => MOCK_ICONS.filter(icon => icon.toLowerCase().includes(searchQuery.toLowerCase())), [searchQuery]);
  const filteredUploads = useMemo(() => uploadedImages.filter(img => img.name.toLowerCase().includes(searchQuery.toLowerCase())), [searchQuery, uploadedImages]);
  const filteredHud = useMemo(() => MOCK_HUD_ASSETS.filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase())), [searchQuery]);

  // Find currently selected element for toolbar state
  const selectedElement = useMemo(() => {
      if (!selectedId) return null;
      const find = (list: UIElement[]): UIElement | null => {
          for (const item of list) {
              if (item.id === selectedId) return item;
              if (item.children) {
                  const found = find(item.children);
                  if (found) return found;
              }
          }
          return null;
      };
      return find(elements);
  }, [elements, selectedId]);

  // --- Helpers ---
  const generateUniqueElement = (template: any): UIElement => {
    const newId = Math.random().toString(36).substr(2, 9);
    return {
        ...template,
        id: newId,
        children: template.children?.map(generateUniqueElement)
    } as UIElement;
  };

  const handleAddComponent = (template: any) => {
    const newElement = generateUniqueElement(template.element);
    addElement(newElement.type, {
        name: newElement.name,
        props: newElement.props,
        style: newElement.style,
        children: newElement.children 
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (ev.target?.result) {
                setUploadedImages(prev => [...prev, { name: file.name, url: ev.target!.result as string }]);
            }
        };
        reader.readAsDataURL(file);
    }
  };

  return (
    <aside className="w-72 glass-left flex flex-col shrink-0 h-full z-20">
      {/* Main Tabs */}
      <div className="flex border-b border-white/5">
        <button 
            onClick={() => setActiveTab('layers')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'layers' ? 'border-white text-white bg-white/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
            Layers
        </button>
        <button 
            onClick={() => setActiveTab('assets')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'assets' ? 'border-white text-white bg-white/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
            Assets
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        {activeTab === 'layers' && (
            <div className="p-3 space-y-4">
                <div>
                {/* Updated Toolbar Header */}
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-2 h-8">
                    <span>Structure</span>
                    <div className="flex items-center gap-2">
                        {/* Layer Actions (Visible when selected) */}
                        <div className={`flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5 border border-white/5 transition-all duration-200 ${selectedId ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                            <button 
                                onClick={() => selectedId && toggleVisibility(selectedId)}
                                className={`p-1 rounded hover:bg-white/10 transition-colors ${selectedElement?.style?.display === 'none' ? 'text-slate-500' : 'text-slate-300 hover:text-white'}`}
                                title={selectedElement?.style?.display === 'none' ? "Show Layer" : "Hide Layer"}
                            >
                                <span className="material-icons text-[14px]">{selectedElement?.style?.display === 'none' ? 'visibility_off' : 'visibility'}</span>
                            </button>
                            <button 
                                onClick={() => selectedId && toggleElementLock(selectedId)}
                                className={`p-1 rounded hover:bg-white/10 transition-colors ${selectedElement?.isLocked ? 'text-red-400' : 'text-slate-300 hover:text-white'}`}
                                title={selectedElement?.isLocked ? "Unlock Layer" : "Lock Layer"}
                            >
                                <span className="material-icons text-[14px]">{selectedElement?.isLocked ? 'lock' : 'lock_open'}</span>
                            </button>
                            <button 
                                onClick={() => selectedId && deleteElement(selectedId)}
                                className="p-1 rounded hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition-colors"
                                title="Delete Layer"
                            >
                                <span className="material-icons text-[14px]">delete</span>
                            </button>
                        </div>

                        {/* Separator */}
                        <div className="w-px h-3 bg-white/10"></div>

                        {/* Creation Actions */}
                        <div className="flex items-center gap-1">
                            <button 
                                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors" 
                                onClick={() => addElement('page')}
                                title="New Page"
                            >
                                <span className="material-icons text-[16px]">post_add</span>
                            </button>
                            <button 
                                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors" 
                                onClick={() => addElement('container')}
                                title="New Container"
                            >
                                <span className="material-icons text-[16px]">add_box</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-0.5">
                    {elements.map(el => (
                    <LayerItem 
                        key={el.id}
                        element={el} 
                        selectedId={selectedId} 
                        selectedIds={selectedIds}
                        onSelect={selectElement} 
                        onToggleExpand={toggleElementExpand}
                        onRename={renameElement}
                        onDrop={reorderElement}
                    />
                    ))}
                </div>
                </div>
            </div>
        )}

        {/* ... (Assets Tab Content preserved) ... */}
        {activeTab === 'assets' && (
            <div className="flex flex-col h-full">
                <div className="p-3 pb-0 sticky top-0 bg-[#141414] z-10 border-b border-white/5 shadow-xl">
                    <div className="relative mb-3">
                        <span className="material-icons absolute left-2.5 top-2 text-sm text-slate-500">search</span>
                        <input 
                            type="text" 
                            placeholder="Search assets..." 
                            className="w-full bg-black/30 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-white/30 transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex bg-black/40 p-0.5 rounded-lg border border-white/5 mb-3 overflow-x-auto scrollbar-hide gap-1">
                         {[
                             { id: 'components', icon: 'dashboard', label: 'UI' },
                             { id: 'hud', icon: 'radar', label: 'HUD' },
                             { id: 'images', icon: 'image', label: 'Img' },
                             { id: 'icons', icon: 'emoji_emotions', label: 'Icon' },
                             { id: 'uploads', icon: 'cloud_upload', label: 'Up' },
                         ].map(cat => (
                             <button
                                key={cat.id}
                                onClick={() => setAssetCategory(cat.id as any)}
                                className={`flex-1 min-w-[40px] py-1.5 rounded-md flex flex-col items-center justify-center gap-0.5 transition-all ${assetCategory === cat.id ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                             >
                                 <span className="material-icons text-[16px]">{cat.icon}</span>
                                 <span className="text-[9px] font-bold uppercase">{cat.label}</span>
                             </button>
                         ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                    {/* COMPONENTS TAB */}
                    {assetCategory === 'components' && (
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Pre-built UI</h3>
                            <div className="grid grid-cols-1 gap-2">
                                {filteredComponents.map((comp) => (
                                    <div 
                                        key={comp.id}
                                        className="group flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 cursor-pointer transition-all"
                                        onClick={() => handleAddComponent(comp)}
                                    >
                                        <div className="w-10 h-10 rounded-md bg-black/30 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                                            <span className="material-icons">{comp.icon}</span>
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-200 group-hover:text-white">{comp.name}</div>
                                            <div className="text-[10px] text-slate-500">Drag or Click to add</div>
                                        </div>
                                        <span className="material-icons text-slate-600 ml-auto group-hover:text-white text-sm">add_circle</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                     {/* HUD TAB */}
                     {assetCategory === 'hud' && (
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Sci-Fi / HUD Assets</h3>
                            <div className="grid grid-cols-1 gap-2">
                                {filteredHud.map((comp) => (
                                    <div 
                                        key={comp.id}
                                        className="group flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 cursor-pointer transition-all"
                                        onClick={() => handleAddComponent(comp)}
                                    >
                                        <div className="w-10 h-10 rounded-md bg-black/30 flex items-center justify-center text-cyan-400 group-hover:text-cyan-200 transition-colors border border-cyan-900">
                                            <span className="material-icons">{comp.icon}</span>
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-200 group-hover:text-white">{comp.name}</div>
                                            <div className="text-[10px] text-slate-500">Click to add</div>
                                        </div>
                                        <span className="material-icons text-slate-600 ml-auto group-hover:text-white text-sm">add_circle</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* IMAGES TAB */}
                    {assetCategory === 'images' && (
                        <div className="space-y-3">
                             <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Stock Photos</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {filteredImages.map((img) => (
                                    <div 
                                        key={img.id}
                                        className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer border border-white/5 hover:border-white/30 transition-all"
                                        onClick={() => addElement('image', { 
                                            name: img.name, 
                                            props: { src: img.url, alt: img.name },
                                            style: { objectFit: 'cover' }
                                        })}
                                    >
                                        <img src={img.url} alt={img.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="material-icons text-white">add</span>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                                            <p className="text-[10px] text-white font-medium truncate">{img.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ICONS TAB */}
                    {assetCategory === 'icons' && (
                        <div className="space-y-3">
                             <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Material Symbols</h3>
                            <div className="grid grid-cols-5 gap-2">
                                {filteredIcons.map((icon) => (
                                    <button 
                                        key={icon}
                                        className="aspect-square flex flex-col items-center justify-center bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 hover:border-white/30 hover:text-white transition-all group relative"
                                        title={icon}
                                        onClick={() => addElement('text', {
                                            name: `Icon ${icon}`,
                                            props: { text: icon },
                                            style: { 
                                                fontFamily: 'Material Icons', 
                                                fontSize: 24, 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                width: 40,
                                                height: 40
                                            }
                                        })}
                                    >
                                        <span className="material-icons text-xl text-slate-400 group-hover:text-white transition-colors">{icon}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* UPLOADS TAB */}
                    {assetCategory === 'uploads' && (
                        <div className="space-y-4">
                             <div 
                                onClick={() => uploadInputRef.current?.click()}
                                className="border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-white/30 hover:bg-white/5 transition-all group"
                             >
                                 <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:bg-white/10">
                                     <span className="material-icons text-slate-400 group-hover:text-white">cloud_upload</span>
                                 </div>
                                 <span className="text-xs font-bold text-slate-300">Click to Upload</span>
                                 <span className="text-[10px] text-slate-500 mt-1">JPG, PNG, SVG supported</span>
                                 <input 
                                    ref={uploadInputRef}
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleFileUpload}
                                 />
                             </div>

                             <div className="grid grid-cols-2 gap-2">
                                {filteredUploads.map((img, idx) => (
                                    <div 
                                        key={idx}
                                        className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer border border-white/5 hover:border-white/30 transition-all"
                                        onClick={() => addElement('image', { 
                                            name: img.name, 
                                            props: { src: img.url, alt: img.name },
                                            style: { objectFit: 'cover' }
                                        })}
                                    >
                                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="material-icons text-white">add</span>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
    </aside>
  );
};
