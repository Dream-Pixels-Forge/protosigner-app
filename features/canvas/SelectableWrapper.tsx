
import React, { useState, useRef, useEffect } from 'react';
import { useEditor } from '../../context/EditorContext';
import { AnimationSettings } from '../../types';
import { normalizeStyleProperties } from '../../context/utils';

interface SelectableWrapperProps {
  id: string;
  name: string;
  className?: string;
  children: React.ReactNode;
  onSelect: (id: string) => void;
  selectedId: string | null;
  zoom: number;
  initialStyle?: React.CSSProperties & { left?: number | string; top?: number | string; width?: number | string; height?: number | string };
  onUpdate: (id: string, style: { left?: number | string; top?: number | string; width?: number | string; height?: number | string }) => void;
  isLocked?: boolean;
  parentLayout?: string; // 'flex' | 'grid' | 'block' | 'none'
  animation?: AnimationSettings;
}

export const SelectableWrapper: React.FC<SelectableWrapperProps> = ({ 
  id, 
  name, 
  className = '', 
  children, 
  onSelect, 
  selectedId,
  zoom,
  initialStyle,
  onUpdate,
  isLocked = false,
  parentLayout = 'block',
  animation
}) => {
  const { projectSettings } = useEditor();
  const isSelected = selectedId === id;
  const elementRef = useRef<HTMLDivElement>(null);
  
  // A child is part of the flow if the parent is flex/grid AND the child is NOT explicitly absolute/fixed.
  const isExplicitlyPositioned = initialStyle?.position === 'absolute' || initialStyle?.position === 'fixed';
  const isFlowChild = (parentLayout === 'flex' || parentLayout === 'inline-flex') && !isExplicitlyPositioned;

  // Initialize local state. undefined means "let CSS handle it"
  const [localPos, setLocalPos] = useState<{ x: number | string | undefined; y: number | string | undefined }>({ 
    x: initialStyle?.left, 
    y: initialStyle?.top 
  });
  const [localSize, setLocalSize] = useState<{ width: number | string | undefined; height: number | string | undefined }>({ 
    width: initialStyle?.width, 
    height: initialStyle?.height 
  });

  // Sync props to local state
  useEffect(() => {
    setLocalPos({ x: initialStyle?.left, y: initialStyle?.top });
    setLocalSize({ width: initialStyle?.width, height: initialStyle?.height });
  }, [initialStyle?.left, initialStyle?.top, initialStyle?.width, initialStyle?.height]);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  const dragStartMouseRef = useRef({ x: 0, y: 0 });
  const initialRectRef = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const activeHandleRef = useRef<string | null>(null);
  const hasMovedRef = useRef(false);

  const snap = (value: number) => {
    if (!projectSettings.snapToGrid) return value;
    const size = projectSettings.gridSize || 20;
    return Math.round(value / size) * size;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // If locked, we can select but not drag
    if (isLocked) {
        if (!isSelected) onSelect(id);
        e.stopPropagation();
        return; 
    }

    // Stop event from bubbling to canvas (which deselects)
    e.stopPropagation();

    // Reset move flag on new interaction
    hasMovedRef.current = false;

    // If not selected, select it first. We don't start drag immediately on unselected items to prevent accidental moves.
    if (!isSelected) {
        onSelect(id);
        return;
    }
    
    // Disable dragging for flow children (flex items) unless it's a resize handle
    if (isFlowChild && !isResizing) {
        return;
    }

    setIsDragging(true);
    dragStartMouseRef.current = { x: e.clientX, y: e.clientY };
    
    // Get current visual position (computed or state)
    const currentX = typeof localPos.x === 'number' ? localPos.x : elementRef.current?.offsetLeft || 0;
    const currentY = typeof localPos.y === 'number' ? localPos.y : elementRef.current?.offsetTop || 0;

    initialRectRef.current = { 
        x: currentX, 
        y: currentY, 
        w: elementRef.current?.offsetWidth || 0, 
        h: elementRef.current?.offsetHeight || 0 
    };
  };

  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    if (isLocked) return;
    e.stopPropagation();
    setIsResizing(true);
    hasMovedRef.current = false; // Reset here too
    activeHandleRef.current = handle;
    dragStartMouseRef.current = { x: e.clientX, y: e.clientY };
    
    const currentX = typeof localPos.x === 'number' ? localPos.x : elementRef.current?.offsetLeft || 0;
    const currentY = typeof localPos.y === 'number' ? localPos.y : elementRef.current?.offsetTop || 0;

    initialRectRef.current = {
        x: currentX,
        y: currentY,
        w: elementRef.current?.offsetWidth || 0,
        h: elementRef.current?.offsetHeight || 0
    };
  };

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
        const dx = (e.clientX - dragStartMouseRef.current.x) / zoom;
        const dy = (e.clientY - dragStartMouseRef.current.y) / zoom;

        // --- DRAG THRESHOLD CHECK ---
        // Prevent micro-movements from counting as drags (prevents jitter on clicks)
        if (!hasMovedRef.current && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
            hasMovedRef.current = true;
        }

        // --- DRAGGING ---
        if (isDragging && hasMovedRef.current) {
            if (isFlowChild) return; 

            const rawX = initialRectRef.current.x + dx;
            const rawY = initialRectRef.current.y + dy;
            
            setLocalPos({
                x: snap(rawX),
                y: snap(rawY)
            });
        }

        // --- RESIZING ---
        if (isResizing && activeHandleRef.current) {
            // Treat resize as a move for the sake of suppressing click
            hasMovedRef.current = true;

            const handle = activeHandleRef.current;
            const newSize = { width: initialRectRef.current.w, height: initialRectRef.current.h };
            const newPos = { x: initialRectRef.current.x, y: initialRectRef.current.y };
            const MIN_SIZE = projectSettings.snapToGrid ? projectSettings.gridSize : 10;

            if (handle.includes('e')) newSize.width = Math.max(MIN_SIZE, snap(initialRectRef.current.w + dx));
            if (handle.includes('s')) newSize.height = Math.max(MIN_SIZE, snap(initialRectRef.current.h + dy));
            
            if (handle.includes('w')) {
                const rawLeft = initialRectRef.current.x + dx;
                const snappedLeft = snap(rawLeft);
                const diff = snappedLeft - initialRectRef.current.x;
                
                if (initialRectRef.current.w - diff >= MIN_SIZE) {
                     newSize.width = initialRectRef.current.w - diff;
                     if (!isFlowChild) newPos.x = snappedLeft;
                }
            }
            
            if (handle.includes('n')) {
                 const rawTop = initialRectRef.current.y + dy;
                 const snappedTop = snap(rawTop);
                 const diff = snappedTop - initialRectRef.current.y;
                 
                 if (initialRectRef.current.h - diff >= MIN_SIZE) {
                     newSize.height = initialRectRef.current.h - diff;
                     if (!isFlowChild) newPos.y = snappedTop;
                 }
            }

            setLocalSize(newSize);
            
            if (!isFlowChild && (handle.includes('w') || handle.includes('n'))) {
                setLocalPos(newPos);
            }
        }
    };

    const handleMouseUp = () => {
        if (isDragging && hasMovedRef.current && !isFlowChild) {
             onUpdate(id, { left: localPos.x, top: localPos.y });
        }
        
        if (isResizing) {
             const updatePayload: any = { 
                width: localSize.width, 
                height: localSize.height 
             };

             if (!isFlowChild) {
                 updatePayload.left = localPos.x;
                 updatePayload.top = localPos.y;
             }

             onUpdate(id, updatePayload);
        }

        setIsDragging(false);
        setIsResizing(false);
        activeHandleRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, zoom, localPos, localSize, id, onUpdate, projectSettings, isFlowChild]);

  // Extract explicit style props to avoid duplication/conflicts
  const { left, top, width, height, position, ...cssStyles } = initialStyle || {};
  
  // Normalize CSS properties from kebab-case to camelCase to fix React warnings
  const normalizedCssStyles = normalizeStyleProperties(cssStyles);
  
  // Construct Animation Style
  const animationStyle: React.CSSProperties = animation && animation.type !== 'none' ? {
      animationName: animation.type,
      animationDuration: `${animation.duration}s`,
      animationDelay: `${animation.delay}s`,
      animationIterationCount: animation.infinite ? 'infinite' : 1,
      animationTimingFunction: animation.ease,
      animationFillMode: 'both'
  } : {};

  const wrapperStyle: React.CSSProperties = {
      boxSizing: 'border-box', // CRITICAL: Fix for layout overlaps
      ...normalizedCssStyles,
      ...animationStyle,
      width: localSize.width,
      height: localSize.height,
      zIndex: isDragging || isResizing ? 50 : normalizedCssStyles.zIndex,
      // If it's a flow child, force relative (or sticky) to maintain context but allow clicks.
      // If explicitly positioned, allow 'absolute' or 'fixed'.
      position: isFlowChild 
        ? (position === 'sticky' ? 'sticky' : 'relative') 
        : (position || 'absolute'),
  };

  // Apply positioning transformations using Left/Top to allow transform-based animations to work
  if (!isFlowChild && typeof localPos.x === 'number' && typeof localPos.y === 'number') {
      wrapperStyle.left = localPos.x;
      wrapperStyle.top = localPos.y;
      // Removed transform translate to allow CSS animations to use transform
  } else if (!isFlowChild) {
      // Fallback: If localPos is string (e.g. "10%"), applied directly to left/top
      if (localPos.x !== undefined) wrapperStyle.left = localPos.x;
      if (localPos.y !== undefined) wrapperStyle.top = localPos.y;
  }
  // Note: if isFlowChild, we ignore left/top entirely for positioning (unless sticky uses top)

  return (
    <div
        ref={elementRef}
        data-element-id={id}
        className={`${className} group ${isDragging && hasMovedRef.current && !isFlowChild ? 'cursor-grabbing' : isLocked ? 'cursor-default' : 'cursor-default'}`}
        style={wrapperStyle}
        onClick={(e) => {
            // Only trigger selection if we haven't dragged significantly
            if (!hasMovedRef.current) {
                e.stopPropagation();
                onSelect(id);
            }
        }}
        onMouseDown={handleMouseDown}
    >
        {children}
        
        {isSelected && (
            <div 
                className={`absolute -inset-[1px] border ${isLocked ? 'border-red-500/50' : 'border-white'} pointer-events-none z-30`}
                data-html2canvas-ignore="true"
            >
                <div className={`absolute -top-6 left-0 ${isLocked ? 'bg-red-500' : 'bg-white'} ${isLocked ? 'text-white' : 'text-black'} text-[9px] px-1.5 py-0.5 rounded-sm font-bold flex items-center gap-1 uppercase tracking-wider shadow-sm pointer-events-auto select-none whitespace-nowrap`}>
                    <span className="material-icons text-[10px]">{isLocked ? 'lock' : 'drag_indicator'}</span> 
                    {name}
                    {!isLocked && (isDragging || isResizing) && (
                        <span className="text-slate-500 ml-1">
                            {Math.round(Number(elementRef.current?.offsetWidth))}x{Math.round(Number(elementRef.current?.offsetHeight))}
                        </span>
                    )}
                </div>

                {!isLocked && (
                    <>
                        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-black shadow-sm cursor-nw-resize pointer-events-auto z-40" onMouseDown={(e) => handleResizeStart(e, 'nw')}></div>
                        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-black shadow-sm cursor-ne-resize pointer-events-auto z-40" onMouseDown={(e) => handleResizeStart(e, 'ne')}></div>
                        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-black shadow-sm cursor-sw-resize pointer-events-auto z-40" onMouseDown={(e) => handleResizeStart(e, 'sw')}></div>
                        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-black shadow-sm cursor-se-resize pointer-events-auto z-40" onMouseDown={(e) => handleResizeStart(e, 'se')}></div>
                        
                        <div className="absolute top-1/2 -right-1.5 w-1.5 h-4 -translate-y-1/2 bg-white border border-black rounded-full cursor-e-resize pointer-events-auto shadow-sm" onMouseDown={(e) => handleResizeStart(e, 'e')}></div>
                        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-white border border-black rounded-full cursor-s-resize pointer-events-auto shadow-sm" onMouseDown={(e) => handleResizeStart(e, 's')}></div>
                        <div className="absolute top-1/2 -left-1.5 w-1.5 h-4 -translate-y-1/2 bg-white border border-black rounded-full cursor-w-resize pointer-events-auto shadow-sm" onMouseDown={(e) => handleResizeStart(e, 'w')}></div>
                        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-white border border-black rounded-full cursor-n-resize pointer-events-auto shadow-sm" onMouseDown={(e) => handleResizeStart(e, 'n')}></div>
                    </>
                )}
            </div>
        )}
        
        {!isSelected && (
            <div 
                className="absolute inset-0 border border-transparent group-hover:border-white/20 pointer-events-none transition-colors z-20 border-dashed"
                data-html2canvas-ignore="true"
            ></div>
        )}
    </div>
  );
};
