
import React, { useState, useEffect, useRef } from 'react';
import { useEditor } from '../../context/EditorContext';
import html2canvas from 'html2canvas';

const ToolbarBtn: React.FC<{ icon: string; label: string; onClick: () => void; active?: boolean; disabled?: boolean }> = ({ icon, label, onClick, active, disabled }) => (
    <button 
        onClick={(e) => { e.stopPropagation(); if (!disabled) onClick(); }}
        disabled={disabled}
        className={`group relative w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${active ? 'bg-white text-black' : 'hover:bg-white/20 text-slate-400 hover:text-white'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={label}
    >
        <span className={`material-icons ${disabled ? 'animate-pulse' : ''}`}>{icon}</span>
        <span className="absolute left-12 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-white/10 shadow-xl">
            {label}
        </span>
    </button>
);

export const Toolbar: React.FC = () => {
    const { 
        activeTool, 
        setActiveTool, 
        addElement, 
        zoomIn, 
        zoomOut, 
        fitToPage, 
        fitToViewport, 
        fitToSelection,
        selectElement 
    } = useEditor();
    
    const [showFitMenu, setShowFitMenu] = useState(false);
    const [isSnapping, setIsSnapping] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowFitMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSnapshot = async () => {
        if (isSnapping) return;
        
        const originalElement = document.getElementById('canvas-page-area');
        if (!originalElement) return;

        try {
            setIsSnapping(true);
            
            // 1. Deselect everything to ensure no selection UI is captured
            selectElement(null);
            
            // Wait briefly for React to update the DOM (remove selection handles)
            await new Promise(resolve => setTimeout(resolve, 200));

            // 2. Clone the element to isolate it from Canvas Zoom/Pan transforms.
            const clone = originalElement.cloneNode(true) as HTMLElement;
            
            // 3. Prepare dimensions
            const width = parseInt(originalElement.style.width || '1200');
            const height = parseInt(originalElement.style.height || '800');

            // 4. Setup a neutral container for the clone
            const container = document.createElement('div');
            container.style.position = 'fixed';
            container.style.top = '0';
            container.style.left = '0';
            container.style.width = `${width}px`;
            container.style.height = `${height}px`;
            container.style.zIndex = '-9999'; // Hide behind app
            container.style.visibility = 'visible'; // Must be visible for rendering logic
            container.style.overflow = 'hidden';
            
            // 5. Reset transforms on the clone so it renders flat at 1:1
            clone.style.transform = 'none';
            clone.style.margin = '0';
            clone.style.position = 'absolute';
            clone.style.top = '0';
            clone.style.left = '0';
            clone.style.boxShadow = 'none'; // Remove the floating shadow effect from capture
            
            // 6. Manual Cleanup: Remove overlays and guides from the clone
            // We manually query because html2canvas sometimes renders ignored elements if they are part of the cloned tree root
            const elementsToRemove = clone.querySelectorAll('[data-html2canvas-ignore]');
            elementsToRemove.forEach(el => el.remove());

            // Ensure background color is consistent
            if (!clone.style.backgroundColor && !clone.className.includes('bg-')) {
                clone.style.backgroundColor = '#ffffff'; 
            }

            container.appendChild(clone);
            document.body.appendChild(container);

            // 7. Capture
            const canvas = await html2canvas(clone, {
                useCORS: true,
                scale: 2, // Retina quality
                backgroundColor: null, 
                logging: false,
                width: width,
                height: height,
                windowWidth: width,
                windowHeight: height,
                x: 0,
                y: 0,
                scrollX: 0,
                scrollY: 0,
                ignoreElements: (element) => {
                    // Double check for ignore attribute just in case
                    return element.hasAttribute('data-html2canvas-ignore');
                }
            });

            // 8. Cleanup
            document.body.removeChild(container);

            // 9. Download
            const link = document.createElement('a');
            link.download = `protosigner_snap_${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Snapshot failed:', error);
            alert('Failed to generate snapshot. Check console for details.');
        } finally {
            setIsSnapping(false);
        }
    };

    return (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 p-2 glass-high rounded-xl z-40" onMouseDown={(e) => e.stopPropagation()}>
            <ToolbarBtn icon="near_me" label="Select (V)" onClick={() => setActiveTool('select')} active={activeTool === 'select'} />
            <ToolbarBtn icon="pan_tool" label="Hand (H)" onClick={() => setActiveTool('hand')} active={activeTool === 'hand'} />
            
            <div className="h-px w-6 mx-auto bg-white/10 my-1"></div>
            
            <ToolbarBtn icon="crop_square" label="Rectangle" onClick={() => addElement('rectangle')} />
            <ToolbarBtn icon="circle" label="Circle" onClick={() => addElement('circle')} />
            <ToolbarBtn icon="crop_free" label="Frame" onClick={() => addElement('frame')} />
            <ToolbarBtn icon="text_fields" label="Text" onClick={() => addElement('text')} />
            <ToolbarBtn icon="image" label="Image" onClick={() => addElement('image')} />
            <ToolbarBtn icon="smart_button" label="Button" onClick={() => addElement('button')} />
            
            <div className="h-px w-6 mx-auto bg-white/10 my-1"></div>
            
            <ToolbarBtn icon="zoom_in" label="Zoom In" onClick={zoomIn} />
            <ToolbarBtn icon="zoom_out" label="Zoom Out" onClick={zoomOut} />
            
            {/* Fit Button with Dropdown */}
            <div className="relative" ref={menuRef}>
                <ToolbarBtn 
                    icon="fit_screen" 
                    label="Fit..." 
                    onClick={() => setShowFitMenu(!showFitMenu)} 
                    active={showFitMenu}
                />
                {showFitMenu && (
                    <div className="absolute left-12 bottom-0 bg-[#1e1e1e] border border-white/10 rounded-lg shadow-xl p-1 flex flex-col gap-0.5 min-w-[140px] animate-in slide-in-from-left-2 duration-100">
                        <button 
                            className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded text-left transition-colors text-slate-300 hover:text-white"
                            onClick={() => { fitToPage(); setShowFitMenu(false); }}
                        >
                            <span className="material-icons text-sm">web_asset</span>
                            <span className="text-xs font-medium">Fit Page</span>
                        </button>
                        <button 
                            className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded text-left transition-colors text-slate-300 hover:text-white"
                            onClick={() => { fitToViewport(); setShowFitMenu(false); }}
                        >
                            <span className="material-icons text-sm">laptop_mac</span>
                            <span className="text-xs font-medium">Fit Viewport</span>
                        </button>
                        <button 
                            className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded text-left transition-colors text-slate-300 hover:text-white"
                            onClick={() => { fitToSelection(); setShowFitMenu(false); }}
                        >
                            <span className="material-icons text-sm">center_focus_strong</span>
                            <span className="text-xs font-medium">Fit Selection</span>
                        </button>
                    </div>
                )}
            </div>
            
            <div className="h-px w-6 mx-auto bg-white/10 my-1"></div>

            <ToolbarBtn 
                icon={isSnapping ? "downloading" : "photo_camera"} 
                label={isSnapping ? "Processing..." : "Snapshot"} 
                onClick={handleSnapshot} 
                active={isSnapping}
                disabled={isSnapping}
            />
        </div>
    );
};
