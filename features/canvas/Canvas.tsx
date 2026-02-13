
import React, { useState, useRef, useEffect } from 'react';
import { useEditor } from '../../context/EditorContext';
import { ElementRenderer } from './ElementRenderer';
import { Toolbar } from './Toolbar';
import { PromptBar } from './PromptBar';
import { DesignGuideOverlay } from '../guides/DesignGuideOverlay';

export const Canvas: React.FC = () => {
  const { 
    elements, 
    selectElement, 
    addElement,
    projectSettings, 
    zoom,
    setZoom,
    activeTool,
    setActiveTool,
    pan,
    setPan
  } = useEditor();
  
  const [isPanning, setIsPanning] = useState(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  
  // Track tool before spacebar press
  const previousToolRef = useRef(activeTool);

  // Handle Spacebar for Hand Tool
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space' && !e.repeat && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
            e.preventDefault(); // Prevent scroll
            if (activeTool !== 'hand') {
                previousToolRef.current = activeTool;
                setActiveTool('hand');
            }
        }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
             if (activeTool === 'hand') {
                 setActiveTool(previousToolRef.current);
             }
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeTool, setActiveTool]);


  // DYNAMIC ROOT: Find the visible page or fallback to first
  const activePage = elements.find(el => el.type === 'page' && el.style?.display !== 'none') || elements[0];
  const rootElement = activePage;
  const canvasContent = rootElement.children || [];

  // --- Pan & Zoom Logic ---
  
  // Handle wheel events with passive: false
  useEffect(() => {
    const canvasElement = document.querySelector('main');
    if (!canvasElement) return;

    const handleWheelEvent = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest('.custom-scrollbar')) return;
      if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;

      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        const zoomSensitivity = 0.001;
        const delta = -e.deltaY * zoomSensitivity;
        const newZoom = Math.max(0.1, Math.min(5, zoom + delta));
        
        const rect = canvasElement.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const worldX = (mouseX - pan.x) / zoom;
        const worldY = (mouseY - pan.y) / zoom;
        
        const newPanX = mouseX - worldX * newZoom;
        const newPanY = mouseY - worldY * newZoom;
        
        setZoom(newZoom);
        setPan({ x: newPanX, y: newPanY });
      } else {
        setPan({ x: pan.x - e.deltaX, y: pan.y - e.deltaY });
      }
    };

    canvasElement.addEventListener('wheel', handleWheelEvent, { passive: false });
    return () => canvasElement.removeEventListener('wheel', handleWheelEvent);
  }, [zoom, pan, setZoom, setPan]);

  const handleMouseDown = (e: React.MouseEvent) => {
      if (activeTool === 'hand' || e.button === 1) { // Middle click also pans
          setIsPanning(true);
          lastMouseRef.current = { x: e.clientX, y: e.clientY };
          e.preventDefault();
      } else {
          selectElement(null);
      }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (isPanning) {
          const dx = e.clientX - lastMouseRef.current.x;
          const dy = e.clientY - lastMouseRef.current.y;
          setPan({ x: pan.x + dx, y: pan.y + dy });
          lastMouseRef.current = { x: e.clientX, y: e.clientY };
      }
  };

  const handleMouseUp = () => {
      setIsPanning(false);
  };

  // Global mouse up to catch drag release outside canvas
  useEffect(() => {
      const globalUp = () => setIsPanning(false);
      window.addEventListener('mouseup', globalUp);
      return () => window.removeEventListener('mouseup', globalUp);
  }, []);

  // Drop Handlers for file upload
  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
               const reader = new FileReader();
               reader.onload = (ev) => {
                   if (ev.target?.result) {
                       // Calculate position relative to the Page Container
                       const pageArea = document.getElementById('canvas-page-area');
                       let finalX = 0;
                       let finalY = 0;
                       
                       if (pageArea) {
                           const pageRect = pageArea.getBoundingClientRect();
                           finalX = (e.clientX - pageRect.left) / zoom;
                           finalY = (e.clientY - pageRect.top) / zoom;
                       } else {
                           // Fallback to world coords if page not found
                           const rect = e.currentTarget.getBoundingClientRect();
                           const mouseX = e.clientX - rect.left;
                           const mouseY = e.clientY - rect.top;
                           finalX = (mouseX - pan.x) / zoom;
                           finalY = (mouseY - pan.y) / zoom;
                       }

                       addElement('image', {
                           name: file.name,
                           props: { src: ev.target.result as string, alt: file.name },
                           style: {
                               position: 'absolute',
                               left: finalX - 100, // Center approx
                               top: finalY - 100,
                               width: 200,
                               height: 200,
                               objectFit: 'cover'
                           }
                       });
                   }
               };
               reader.readAsDataURL(file);
          }
      }
  };

  return (
    <main 
        className={`flex-1 relative bg-canvas-dark flex items-center justify-center overflow-hidden ${activeTool === 'hand' || isPanning ? 'cursor-grab active:cursor-grabbing' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDragOver={handleDragOver}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
            // Dynamic Grid Implementation
            backgroundSize: projectSettings.showGrid ? `${projectSettings.gridSize * zoom}px ${projectSettings.gridSize * zoom}px` : undefined,
            backgroundImage: projectSettings.showGrid 
                ? `radial-gradient(circle, rgba(255,255,255,0.07) ${1 * zoom}px, transparent 1px)` 
                : undefined,
            backgroundPosition: `${pan.x}px ${pan.y}px` // Sync grid with pan
        }}
    >
      <Toolbar />

      {/* Viewport Transform Container */}
      <div 
        className="w-full h-full flex items-center justify-center will-change-transform"
        style={{ 
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isPanning ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
      >
        {/* PAGE CONTAINER (The real content area) */}
        <div 
            id="canvas-page-area"
            className={`
                relative overflow-visible transition-all duration-500
                ${projectSettings.darkMode ? 'bg-black' : 'bg-white'}
            `}
            style={{
                ...rootElement.style,
                
                // --- FORCE EDITOR LAYOUT OVERRIDES ---
                // We must override width/height/flex logic to ensure the canvas
                // represents the PHYSICAL size of the page, not relative to screen.
                
                width: projectSettings.pageSize.width,
                height: projectSettings.pageSize.height,
                minWidth: projectSettings.pageSize.width, // Prevent flex shrinking
                minHeight: projectSettings.pageSize.height, // Prevent flex shrinking
                flexShrink: 0, 
                flexGrow: 0,
                boxSizing: 'border-box',
                
                // Force display flex to ensure visibility in canvas context even if switching was slow
                display: 'flex', 
                
                // Page Border Logic
                borderWidth: projectSettings.pageBorder.show ? projectSettings.pageBorder.width : 0,
                borderColor: projectSettings.pageBorder.color,
                borderStyle: projectSettings.pageBorder.style,
                
                // If page border is hidden, fallback to shadow for visibility against grid
                boxShadow: projectSettings.pageBorder.show 
                    ? 'none'
                    : projectSettings.darkMode 
                        ? '0 0 0 1px rgba(255,255,255,0.05), 0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
                        : '0 0 0 1px rgba(0,0,0,0.05), 0 25px 50px -12px rgba(0, 0, 0, 0.2)'
            }}
            onMouseDown={(e) => {
                if (activeTool === 'hand') return;
            }}
        >
            {/* 1. Design Guides Overlay (Behind Content logic, but physically needs to be here or on top) */}
            {/* Placed here so it overlays content but under selection helpers if z-index managed */}
            <DesignGuideOverlay 
                settings={projectSettings.guides} 
                width={projectSettings.pageSize.width} 
                height={projectSettings.pageSize.height} 
            />

            {/* 2. Recursive Renderer */}
            {canvasContent.map(child => (
                <ElementRenderer 
                    key={child.id} 
                    element={child} 
                    zoom={zoom} 
                    parentLayout={rootElement.style?.display || 'block'} 
                />
            ))}

            {/* 3. VIEWPORT OVERLAY (The "Above the Fold" indicator) */}
            {projectSettings.viewportBorder.show && (
                <div 
                    className="absolute top-0 left-0 pointer-events-none z-[100]"
                    style={{
                        width: projectSettings.viewportSize.width,
                        height: projectSettings.viewportSize.height,
                        // Changed to full border for clear aspect ratio visibility
                        borderWidth: projectSettings.viewportBorder.width,
                        borderColor: projectSettings.viewportBorder.color,
                        borderStyle: projectSettings.viewportBorder.style,
                        boxSizing: 'border-box'
                    }}
                >
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/50 text-white text-[10px] rounded backdrop-blur font-mono">
                        Viewport: {projectSettings.viewportSize.width}x{projectSettings.viewportSize.height}
                    </div>
                </div>
            )}
        </div>
      </div>

      <PromptBar />
    </main>
  );
};
