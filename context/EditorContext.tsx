
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { EditorContextType, UIElement, ProjectSettings, MCPStatus, ToolType, HistoryEntry, AppSettings, AIProvider, UserProfile, SettingsTab, ExpertMode, EnvironmentMode } from '../types';
import { MCPClient } from '../services/MCPClient';
import { initialElements, defaultSettings, defaultAppSettings } from './defaults';
import { 
    cloneElementWithNewIds, 
    getAbsoluteRect, 
    insertNodeIntoParent, 
    updateElementRecursively, 
    deleteFromList 
} from './utils';
import { useAI } from './useAI';
import { SpectralAgent } from '../features/ai/SpectralAgent'; // Import Agent

interface HistorySnapshot {
  id: string;
  elements: UIElement[];
  projectSettings: ProjectSettings;
  action: string;
  timestamp: number;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

const DEFAULT_USER: UserProfile = {
    name: 'Designer',
    email: 'demo@protosigner.pro',
    avatarUrl: 'https://picsum.photos/seed/designer/200/200',
    role: 'Pro Plan'
};

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- Core State ---
  const [elements, setElements] = useState<UIElement[]>(initialElements);
  
  // Selection State
  const [selectedId, setSelectedId] = useState<string | null>('hero-title');
  const [selectedIds, setSelectedIds] = useState<string[]>(['hero-title']);

  const [projectSettings, setProjectSettings] = useState<ProjectSettings>(defaultSettings);
  const [appSettings, setAppSettings] = useState<AppSettings>(defaultAppSettings);
  const [projectName, setProjectName] = useState('SaaS Landing Page v2');
  
  // --- User Profile State ---
  const [user, setUser] = useState<UserProfile>(() => {
      if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('proto_user_profile');
          return saved ? JSON.parse(saved) : DEFAULT_USER;
      }
      return DEFAULT_USER;
  });

  const updateUser = useCallback((profile: Partial<UserProfile>) => {
      setUser(prev => {
          const updated = { ...prev, ...profile };
          localStorage.setItem('proto_user_profile', JSON.stringify(updated));
          return updated;
      });
  }, []);

  // --- UI State ---
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>('models');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  // --- History State ---
  const [past, setPast] = useState<HistorySnapshot[]>([]);
  const [future, setFuture] = useState<HistorySnapshot[]>([]);
  
  // --- Connection State ---
  const [activeModelId, setActiveModelId] = useState('gemini-3-flash-preview');
  const [activeModelProvider, setActiveModelProvider] = useState<AIProvider>('Google');
  const [expertMode, setExpertMode] = useState<ExpertMode>('landing');
  const [environmentMode, setEnvironmentMode] = useState<EnvironmentMode>('cloud'); // Default to Cloud
  
  // SECURITY UPDATE: Keys are now strictly read from environment variables.
  // Setters have been removed to prevent runtime/UI manipulation.
  const [googleApiKey] = useState(() => (typeof process !== 'undefined' ? process.env.API_KEY || '' : ''));
  const [openRouterApiKey] = useState(() => (typeof process !== 'undefined' ? process.env.OPENROUTER_API_KEY || '' : ''));
  
  const [ollamaServerUrl, setOllamaServerUrl] = useState('http://localhost:11434');

  const [mcpStatus, setMcpStatus] = useState<MCPStatus>('disconnected');
  
  // --- Canvas State ---
  const [zoom, setZoomState] = useState(0.8);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = useState<ToolType>('select');

  useEffect(() => {
    const mcp = MCPClient.getInstance();
    const unsubscribe = mcp.subscribe((status) => {
        setMcpStatus(status);
    });
    return unsubscribe;
  }, []);

  const updateAppSettings = useCallback((settings: Partial<AppSettings>) => {
    setAppSettings(prev => ({ ...prev, ...settings }));
  }, []);

  // --- History Logic ---
  const saveToHistory = useCallback((action: string = 'Update') => {
    setPast(prev => {
      const newSnapshot: HistorySnapshot = { 
        id: Math.random().toString(36).substr(2, 9),
        elements: JSON.parse(JSON.stringify(elements)), 
        projectSettings: JSON.parse(JSON.stringify(projectSettings)),
        action,
        timestamp: Date.now()
      };
      const newPast = [...prev, newSnapshot];
      if (newPast.length > 50) newPast.shift();
      return newPast;
    });
    setFuture([]); 
  }, [elements, projectSettings]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);
    
    // Save current to future
    const currentSnapshot: HistorySnapshot = {
        id: Math.random().toString(36).substr(2, 9),
        elements: JSON.parse(JSON.stringify(elements)),
        projectSettings: JSON.parse(JSON.stringify(projectSettings)),
        action: previous.action, // Use the action we are undoing as the label for the future state
        timestamp: Date.now()
    };
    
    setPast(newPast);
    setFuture(prev => [currentSnapshot, ...prev]);
    setElements(previous.elements);
    setProjectSettings(previous.projectSettings);
  }, [past, elements, projectSettings]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    
    // Save current to past
    const currentSnapshot: HistorySnapshot = {
        id: Math.random().toString(36).substr(2, 9),
        elements: JSON.parse(JSON.stringify(elements)),
        projectSettings: JSON.parse(JSON.stringify(projectSettings)),
        action: next.action, // The action that created the state we are restoring
        timestamp: Date.now()
    };

    setFuture(newFuture);
    setPast(prev => [...prev, currentSnapshot]);
    setElements(next.elements);
    setProjectSettings(next.projectSettings);
  }, [future, elements, projectSettings]);

  // Jump back in time
  const restoreHistory = useCallback((index: number) => {
    if (index < 0 || index >= past.length) return;
    const targetSnapshot = past[index];
    
    const newPast = past.slice(0, index);
    const entriesToMoveToFuture = past.slice(index + 1).reverse(); // Reverse because future is a stack (LIFO)
    
    const currentSnapshot: HistorySnapshot = {
        id: Math.random().toString(36).substr(2, 9),
        elements: JSON.parse(JSON.stringify(elements)),
        projectSettings: JSON.parse(JSON.stringify(projectSettings)),
        action: 'Current State',
        timestamp: Date.now()
    };
    
    const newFutureItems = entriesToMoveToFuture.concat([currentSnapshot]);
    
    setPast(newPast);
    setFuture([...newFutureItems, ...future]);
    setElements(targetSnapshot.elements);
    setProjectSettings(targetSnapshot.projectSettings);
  }, [past, future, elements, projectSettings]);

  // Jump forward in time
  const jumpToFuture = useCallback((index: number) => {
    if (index < 0 || index >= future.length) return;
    const targetSnapshot = future[index];
    
    const entriesToRestore = future.slice(0, index + 1); // These move to past
    const newFuture = future.slice(index + 1);
    
    const currentSnapshot: HistorySnapshot = {
        id: Math.random().toString(36).substr(2, 9),
        elements: JSON.parse(JSON.stringify(elements)),
        projectSettings: JSON.parse(JSON.stringify(projectSettings)),
        action: entriesToRestore[0].action, 
        timestamp: Date.now()
    };
    
    const newPastItems = [currentSnapshot, ...entriesToRestore.slice(0, -1)]; 
    if (entriesToRestore.length === 1) {
         setPast(prev => [...prev, currentSnapshot]);
    } else {
         setPast(prev => [...prev, currentSnapshot, ...entriesToRestore.slice(0, index)]);
    }

    setFuture(newFuture);
    setElements(targetSnapshot.elements);
    setProjectSettings(targetSnapshot.projectSettings);
  }, [past, future, elements, projectSettings]);

  const clearHistory = useCallback(() => {
      setPast([]);
      setFuture([]);
  }, []);

  // --- Selection Logic ---
  const selectElement = useCallback((id: string | null, multi: boolean = false) => {
    if (!id) {
        setSelectedId(null);
        setSelectedIds([]);
        return;
    }

    if (multi) {
        setSelectedIds(prev => {
            const newIds = prev.includes(id) 
                ? prev.filter(pid => pid !== id) 
                : [...prev, id];
            
            if (id === selectedId) {
                const nextPrimary = newIds.length > 0 ? newIds[newIds.length - 1] : null;
                setSelectedId(nextPrimary);
            } else if (!prev.includes(id)) {
                setSelectedId(id);
            }
            return newIds;
        });
    } else {
        setSelectedId(id);
        setSelectedIds([id]);
    }
  }, [selectedId]);

  // Handle visibility logic for tabs
  useEffect(() => {
     if (selectedId) {
        setElements(prev => {
            const isRootPage = prev.some(el => el.id === selectedId && el.type === 'page');
            if (isRootPage) {
                const needsUpdate = prev.some(el => 
                    el.type === 'page' && 
                    ((el.id === selectedId && el.style?.display === 'none') || (el.id !== selectedId && el.style?.display !== 'none'))
                );
                if (!needsUpdate) return prev;
                return prev.map(el => {
                    if (el.type === 'page') {
                        return { ...el, style: { ...el.style, display: el.id === selectedId ? 'flex' : 'none' } };
                    }
                    return el;
                });
            }
            return prev;
        });
     }
  }, [selectedId]);

  // --- CRUD Operations ---
  const deleteElement = useCallback((id: string) => {
    if (id === 'root') return; 
    saveToHistory('Delete Element');
    
    const idsToDelete = selectedIds.includes(id) ? selectedIds : [id];
    let currentElements = elements;
    idsToDelete.forEach(delId => {
        currentElements = deleteFromList(currentElements, delId);
    });
    
    setElements(currentElements);
    
    if (idsToDelete.includes(selectedId || '')) {
        setSelectedId(null);
        setSelectedIds([]);
    }
  }, [saveToHistory, selectedId, selectedIds, elements]);

  const updateElementProps = useCallback((id: string, props: Partial<Record<string, any>>) => {
    saveToHistory('Update Props');
    setElements(prev => updateElementRecursively(prev, id, (el) => ({
      ...el,
      props: { ...el.props, ...props }
    })));
  }, [saveToHistory]);

  const updateElementStyle = useCallback((id: string, style: Partial<NonNullable<UIElement['style']>>) => {
    saveToHistory('Update Style');
    setElements(prev => updateElementRecursively(prev, id, (el) => ({
      ...el,
      style: { ...el.style, ...style }
    })));
  }, [saveToHistory]);
  
  const renameElement = useCallback((id: string, newName: string) => {
    saveToHistory('Rename Element');
    setElements(prev => updateElementRecursively(prev, id, (el) => ({
      ...el,
      name: newName
    })));
  }, [saveToHistory]);

  const toggleElementLock = useCallback((id: string) => {
    saveToHistory('Toggle Lock');
    setElements(prev => updateElementRecursively(prev, id, (el) => ({
      ...el,
      isLocked: !el.isLocked
    })));
  }, [saveToHistory]);

  const toggleVisibility = useCallback((id: string) => {
    saveToHistory('Toggle Visibility');
    setElements(prev => updateElementRecursively(prev, id, (el) => ({
        ...el,
        style: { 
            ...el.style, 
            display: el.style?.display === 'none' 
                ? (el.type.includes('flex') ? 'flex' : 'block') 
                : 'none' 
        }
    })));
  }, [saveToHistory]);

  const toggleElementExpand = useCallback((id: string) => {
    setElements(prev => updateElementRecursively(prev, id, (el) => ({
      ...el,
      isExpanded: !el.isExpanded
    })));
  }, []);

  const moveSelection = useCallback((dx: number, dy: number) => {
      if (!selectedId) return;
      saveToHistory('Nudge Selection');
      
      const targets = selectedIds.length > 0 ? selectedIds : [selectedId];
      setElements(prev => {
          let updated = prev;
          targets.forEach(tid => {
              updated = updateElementRecursively(updated, tid, (el) => {
                const currentLeft = parseFloat(String(el.style?.left || 0)) || 0;
                const currentTop = parseFloat(String(el.style?.top || 0)) || 0;
                const newLeft = currentLeft + dx;
                const newTop = currentTop + dy;
                return {
                    ...el,
                    style: { ...el.style, left: newLeft, top: newTop }
                };
              });
          });
          return updated;
      });
  }, [selectedId, selectedIds, saveToHistory]);

  const duplicateSelection = useCallback(() => {
    if (!selectedId) return;
    saveToHistory('Duplicate');
    setElements(prev => {
        const recursiveDuplicate = (items: UIElement[]): UIElement[] => {
            return items.flatMap(item => {
                if (selectedIds.includes(item.id)) {
                    const clone = cloneElementWithNewIds(item);
                    const left = (parseFloat(String(clone.style?.left || 0)) || 0) + 20;
                    const top = (parseFloat(String(clone.style?.top || 0)) || 0) + 20;
                    clone.style = { ...clone.style, left, top };
                    clone.name = `${clone.name} (Copy)`;
                    return [item, clone];
                }
                if (item.children) return [{ ...item, children: recursiveDuplicate(item.children) }];
                return [item];
            });
        };
        return recursiveDuplicate(prev);
    });
  }, [selectedId, selectedIds, saveToHistory]);

  const reorderElement = useCallback((dragId: string, targetId: string, position: 'before' | 'after' | 'inside') => {
      if (dragId === targetId) return;

      saveToHistory('Reorder Layer');

      setElements(prev => {
          // --- CIRCULAR DEPENDENCY CHECK ---
          const findElement = (list: UIElement[], id: string): UIElement | null => {
              for (const item of list) {
                  if (item.id === id) return item;
                  if (item.children) {
                      const found = findElement(item.children, id);
                      if (found) return found;
                  }
              }
              return null;
          };

          const isDescendant = (parent: UIElement, target: string): boolean => {
              if (!parent.children) return false;
              return parent.children.some(child => child.id === target || isDescendant(child, target));
          };

          const dragElement = findElement(prev, dragId);
          if (dragElement && isDescendant(dragElement, targetId)) {
              console.warn("Cannot drop parent into child.");
              return prev;
          }
          // ---------------------------------

          let draggedElement: UIElement | null = null;
          const findAndRemove = (list: UIElement[]): UIElement[] => {
              const newList: UIElement[] = [];
              for (const item of list) {
                  if (item.id === dragId) {
                      draggedElement = item;
                      continue; 
                  }
                  if (item.children) {
                      const newChildren = findAndRemove(item.children);
                      newList.push({ ...item, children: newChildren });
                  } else {
                      newList.push(item);
                  }
              }
              return newList;
          };

          const elementsWithoutDrag = findAndRemove(prev);
          if (!draggedElement) return prev; 

          const insert = (list: UIElement[]): UIElement[] => {
              const newList: UIElement[] = [];
              for (const item of list) {
                  if (item.id === targetId) {
                      if (position === 'before') {
                          newList.push(draggedElement!);
                          newList.push(item);
                      } else if (position === 'after') {
                          newList.push(item);
                          newList.push(draggedElement!);
                      } else if (position === 'inside') {
                          newList.push({
                              ...item,
                              children: [draggedElement!, ...(item.children || [])],
                              isExpanded: true 
                          });
                      }
                  } else {
                      if (item.children) {
                          const newChildren = insert(item.children);
                          newList.push({ ...item, children: newChildren });
                      } else {
                          newList.push(item);
                      }
                  }
              }
              return newList;
          };

          return insert(elementsWithoutDrag);
      });
  }, [saveToHistory]);

  const addElement = useCallback((type: UIElement['type'], overrides?: Partial<Omit<UIElement, 'id'>>) => {
    saveToHistory(`Add ${type}`);
    const newId = Math.random().toString(36).substr(2, 9);
    let defaultStyle: NonNullable<UIElement['style']> = { position: 'relative' };
    let defaultProps: Record<string, any> = {};
    
    if (type === 'page') {
         const newPage: UIElement = {
            id: newId,
            type: 'page',
            name: overrides?.name || `Page ${elements.length + 1}`,
            props: {},
            style: {
                display: 'flex', flexDirection: 'column',
                backgroundColor: '#000000', color: '#ffffff',
                position: 'relative', overflow: 'hidden', containerType: 'inline-size',
                ...(overrides?.style || {})
            },
            children: [], isExpanded: true, isLocked: false
        };
        setElements(prev => {
            const hiddenPrev = prev.map(el => el.type === 'page' ? { ...el, style: { ...el.style, display: 'none' } } : el);
            return [...hiddenPrev, newPage];
        });
        setSelectedId(newId);
        setSelectedIds([newId]);
        return;
    }

    switch(type) {
        case 'rectangle': defaultStyle = { width: 150, height: 150, backgroundColor: '#3b82f6', borderRadius: 8 }; break;
        case 'circle': defaultStyle = { width: 120, height: 120, backgroundColor: '#ec4899', borderRadius: '50%' }; break;
        case 'box':
        case 'container': defaultStyle = { width: 200, height: 200, backgroundColor: '#1e293b', padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }; break;
        case 'frame': defaultStyle = { width: 300, height: 200, border: '2px dashed #94a3b8', backgroundColor: 'transparent' }; break;
        case 'text': defaultProps = { text: 'New Text Layer' }; defaultStyle = { fontSize: 16, color: 'inherit' }; break;
        case 'button': defaultProps = { label: 'Button' }; defaultStyle = { padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', borderRadius: 6 }; break;
        case 'image': defaultProps = { src: 'https://placehold.co/600x400/1e293b/ffffff?text=Image', alt: 'Placeholder' }; defaultStyle = { width: 300, height: 200, backgroundColor: '#e2e8f0', objectFit: 'cover' }; break;
    }

    const finalProps = { ...defaultProps, ...(overrides?.props || {}) };
    const finalStyle = { ...defaultStyle, ...(overrides?.style || {}) };
    const finalName = overrides?.name || `${type.charAt(0).toUpperCase() + type.slice(1)} ${Math.floor(Math.random() * 100)}`;

    const newElement: UIElement = {
        id: newId, type, name: finalName, props: finalProps, style: finalStyle,
        children: overrides?.children || [], isExpanded: true, isLocked: false
    };

    if (selectedId) {
        setElements(prev => insertNodeIntoParent(prev, selectedId, newElement));
    } else {
        setElements(prev => {
             const activeIndex = prev.findIndex(el => el.type === 'page' && el.style?.display !== 'none');
             const targetIndex = activeIndex >= 0 ? activeIndex : 0;
             const newPrev = [...prev];
             const root = { ...newPrev[targetIndex] };
             root.children = [...(root.children || []), newElement];
             newPrev[targetIndex] = root;
             return newPrev;
        });
    }
  }, [saveToHistory, selectedId, elements.length]);

  const updateProjectSettings = useCallback((settings: Partial<ProjectSettings>) => {
    saveToHistory('Update Settings');
    setProjectSettings(prev => ({ ...prev, ...settings }));
  }, [saveToHistory]);

  const toggleSettingsModal = useCallback(() => setIsSettingsModalOpen(prev => !prev), []);
  const toggleExportModal = useCallback(() => setIsExportModalOpen(prev => !prev), []);
  const toggleShortcutsModal = useCallback(() => setIsShortcutsModalOpen(prev => !prev), []);
  const toggleHistoryModal = useCallback(() => setIsHistoryModalOpen(prev => !prev), []);

  const setZoom = useCallback((scale: number) => setZoomState(Math.max(0.1, Math.min(5, scale))), []);
  const zoomIn = useCallback(() => setZoomState(prev => Math.min(prev + 0.1, 5)), []);
  const zoomOut = useCallback(() => setZoomState(prev => Math.max(prev - 0.1, 0.1)), []);

  const getCanvasDims = () => {
    if (typeof window === 'undefined') return { w: 1000, h: 800 };
    return { w: window.innerWidth - 592, h: window.innerHeight - 136 };
  };

  const fitToPage = useCallback(() => {
    const { w, h } = getCanvasDims();
    const { width: pageW, height: pageH } = projectSettings.pageSize;
    const fitZoom = Math.min(w / pageW, h / pageH) * 0.9;
    setZoomState(Math.max(0.1, Math.min(5, fitZoom)));
    setPan({ x: 0, y: 0 }); 
  }, [projectSettings.pageSize]);

  const fitToViewport = useCallback(() => {
    const { w, h } = getCanvasDims();
    const { width: viewW, height: viewH } = projectSettings.viewportSize;
    const { width: pageW, height: pageH } = projectSettings.pageSize;

    let fitZoom = Math.min(w / viewW, h / viewH) * 0.96;
    fitZoom = Math.max(0.1, Math.min(5, fitZoom));
    setZoomState(fitZoom);
    
    const panX = (pageW - viewW) / 2 * fitZoom;
    const panY = (pageH - viewH) / 2 * fitZoom;
    
    setPan({ x: panX, y: panY });
  }, [projectSettings.pageSize, projectSettings.viewportSize]);

  const fitToSelection = useCallback(() => {
    if (!selectedId) { fitToPage(); return; }
    
    const domEl = document.querySelector(`[data-element-id="${selectedId}"]`);
    const activePageEl = elements.find(el => el.type === 'page' && el.style?.display !== 'none') || elements[0];
    const pageDomEl = document.querySelector(`[data-element-id="${activePageEl.id}"]`);

    if (!domEl || !pageDomEl) { 
        fitToPage(); 
        return; 
    }

    const elRect = domEl.getBoundingClientRect();
    const pageRect = pageDomEl.getBoundingClientRect();
    const currentZoom = zoom; 
    
    const relX = (elRect.left - pageRect.left) / currentZoom;
    const relY = (elRect.top - pageRect.top) / currentZoom;
    const relW = elRect.width / currentZoom;
    const relH = elRect.height / currentZoom;

    const { w: screenW, h: screenH } = getCanvasDims();
    const padding = 100;
    const availableW = Math.max(100, screenW - padding);
    const availableH = Math.max(100, screenH - padding);

    let fitZoom = Math.min(availableW / relW, availableH / relH);
    fitZoom = Math.max(0.1, Math.min(5, fitZoom));

    const { width: pageW, height: pageH } = projectSettings.pageSize;
    const elCenterX = relX + relW / 2;
    const elCenterY = relY + relH / 2;
    const pageCenterX = pageW / 2;
    const pageCenterY = pageH / 2;
    const shiftX = pageCenterX - elCenterX;
    const shiftY = pageCenterY - elCenterY;

    const panX = shiftX * fitZoom;
    const panY = shiftY * fitZoom;

    setZoomState(fitZoom);
    setPan({ x: panX, y: panY });

  }, [selectedId, elements, projectSettings.pageSize, fitToPage, zoom]);

  const fitToView = useCallback(() => fitToViewport(), [fitToViewport]);
  useEffect(() => { setTimeout(fitToViewport, 100); }, [fitToViewport]);

  const newProject = useCallback(() => {
    if (window.confirm('Start new project? Any unsaved changes will be lost.')) {
        const newPageId = Math.random().toString(36).substr(2, 9);
        const blankPage: UIElement = {
            id: newPageId,
            type: 'page',
            name: 'Untitled Page',
            props: {},
            style: {
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#030303',
                color: '#ffffff',
                position: 'relative',
                overflow: 'hidden',
                height: '100%',
                minHeight: '100%',
                fontFamily: 'Space Grotesk',
                alignItems: 'center'
            },
            children: [],
            isExpanded: true,
            isLocked: false
        };
        
        setElements([blankPage]);
        setProjectName('Untitled Project');
        setSelectedId(newPageId);
        setSelectedIds([newPageId]);
        
        setProjectSettings(defaultSettings);
        setZoomState(0.9);
        setPan({ x: 0, y: 0 });

        setPast([]);
        setFuture([]);
    }
  }, []);

  // --- AI Hook Integration ---
  const { isGenerating, generateContent, generateStyles } = useAI({
      elements,
      setElements,
      selectedId,
      selectElement, // PASSING THIS
      googleApiKey,
      openRouterApiKey,
      ollamaServerUrl,
      activeModelId,
      activeModelProvider,
      saveToHistory,
      updateElementProps,
      updateElementStyle,
      projectSettings,
      expertMode
  });

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.getAttribute('contenteditable') === 'true') return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.shiftKey ? redo() : undo(); e.preventDefault(); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') { redo(); e.preventDefault(); }
      if (e.key === 'Delete' || e.key === 'Backspace') { if (selectedId) deleteElement(selectedId); }
      if (e.key.toLowerCase() === 'h') setActiveTool('hand');
      if (e.key.toLowerCase() === 'v') setActiveTool('select');
      if ((e.metaKey || e.ctrlKey) && (e.key === '=' || e.key === '+')) { e.preventDefault(); zoomIn(); }
      if ((e.metaKey || e.ctrlKey) && (e.key === '-')) { e.preventDefault(); zoomOut(); }
      if ((e.metaKey || e.ctrlKey) && (e.key === '0')) { e.preventDefault(); fitToView(); }
      if (e.shiftKey && e.key === '1') fitToPage();
      if (e.shiftKey && e.key === '2') fitToSelection();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') { e.preventDefault(); duplicateSelection(); }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          let dx = 0, dy = 0;
          if (e.key === 'ArrowUp') dy = -step; if (e.key === 'ArrowDown') dy = step;
          if (e.key === 'ArrowLeft') dx = -step; if (e.key === 'ArrowRight') dx = step;
          moveSelection(dx, dy);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedId, deleteElement, fitToPage, fitToSelection, zoomIn, zoomOut, fitToView, duplicateSelection, moveSelection]);

  return (
    <EditorContext.Provider value={{
      projectName, setProjectName,
      elements, selectedId, selectedIds, selectElement, updateElementProps, updateElementStyle, renameElement, 
      toggleElementLock, toggleElementExpand, toggleVisibility,
      addElement, deleteElement, duplicateSelection, moveSelection, reorderElement,
      projectSettings, updateProjectSettings,
      appSettings, updateAppSettings,
      isSettingsModalOpen, toggleSettingsModal,
      activeSettingsTab, setActiveSettingsTab,
      isShortcutsModalOpen, toggleShortcutsModal,
      isHistoryModalOpen, toggleHistoryModal, 
      history: past, future, restoreHistory, jumpToFuture, clearHistory,
      
      // User Profile
      user, updateUser,

      // AI & Provider State
      activeModelId, setActiveModelId,
      activeModelProvider, setActiveModelProvider,
      googleApiKey, // Read-only
      openRouterApiKey, // Read-only
      ollamaServerUrl, setOllamaServerUrl,
      
      // Expert Mode
      expertMode, setExpertMode,
      
      // Environment Mode
      environmentMode, setEnvironmentMode,

      isGenerating, generateContent, generateStyles, mcpStatus,
      zoom, setZoom, zoomIn, zoomOut, fitToView, fitToPage, fitToViewport, fitToSelection, pan, setPan, activeTool, setActiveTool,
      isExportModalOpen, toggleExportModal,
      undo, redo, canUndo: past.length > 0, canRedo: future.length > 0,
      newProject
    }}>
      {/* Activate Spectral Agent Logic */}
      <SpectralAgent />
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) throw new Error('useEditor must be used within an EditorProvider');
  return context;
};
