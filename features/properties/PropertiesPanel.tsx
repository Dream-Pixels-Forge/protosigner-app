
import React, { useMemo, useRef } from 'react';
import { useEditor } from '../../context/EditorContext';
import { Toggle } from '../../components/ui/Toggle';
import { UIElement, AnimationSettings } from '../../types';
import { Viewport } from './Viewport';
import { PageSize } from './PageSize';
import { 
    PropertySection, Row, Label, NumberInput, SliderInput, 
    ColorInput, SelectInput, ButtonTabs, IconButton, AlignmentMatrix 
} from './PropertyInputs';

// --- Main Panel ---

export const PropertiesPanel: React.FC = () => {
  const { 
    selectedId, 
    elements, 
    projectSettings, 
    updateProjectSettings, 
    updateElementProps, 
    updateElementStyle, 
    toggleElementLock, 
    renameElement,
    refineSelectionLayout, // New Hook Function
    isGenerating
  } = useEditor();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedElement = useMemo(() => {
      if (!selectedId) return null;
      const findEl = (list: UIElement[]): UIElement | null => {
        for (const el of list) {
          if (el.id === selectedId) return el;
          if (el.children) {
            const found = findEl(el.children);
            if (found) return found;
          }
        }
        return null;
      };
      return findEl(elements);
  }, [elements, selectedId]);

  // Helper to safely get/set style
  const getStyle = (prop: keyof React.CSSProperties) => selectedElement?.style?.[prop];
  const setStyle = (prop: keyof React.CSSProperties, val: any) => {
    if (selectedId) updateElementStyle(selectedId, { [prop]: val } as any);
  };
  
  const updateStyles = (styles: Partial<React.CSSProperties>) => {
      if (selectedId) updateElementStyle(selectedId, styles as any);
  };

  // Helper for Animation
  const getAnimation = (): AnimationSettings => selectedElement?.props.animation || { type: 'none', duration: 1, delay: 0, infinite: false, ease: 'ease' };
  const updateAnimation = (updates: Partial<AnimationSettings>) => {
      if (selectedId) {
          const current = getAnimation();
          updateElementProps(selectedId, { animation: { ...current, ...updates } });
      }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedId) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (ev.target?.result) {
                updateElementProps(selectedId, { src: ev.target.result as string });
            }
        };
        reader.readAsDataURL(file);
    }
  };

  // Render Canvas Settings if no element selected
  if (!selectedElement) {
    return (
      <aside className="w-96 glass-right flex flex-col shrink-0 overflow-y-auto custom-scrollbar z-20">
        <div className="p-4 border-b border-white/5 bg-white/5">
           <h2 className="text-sm font-bold text-white flex items-center gap-2">
             <span className="material-icons text-white">art_track</span>
             Canvas Settings
           </h2>
        </div>
        <div className="p-4 space-y-2">
            
            <PropertySection title="Dimensions" icon="aspect_ratio">
                <Viewport />
                <PageSize />
            </PropertySection>

            <PropertySection title="AI Intelligence" icon="psychology">
                <div className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                             <Label icon="grid_4x4">Grid Master (GM)</Label>
                             <Toggle 
                                checked={projectSettings.enableGridMaster} 
                                onChange={(v) => updateProjectSettings({ enableGridMaster: v })} 
                             />
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight">
                            Enables a 2-step generation process where the GM pre-calculates strict layout math before the agent builds components.
                        </p>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                             <Label icon="auto_fix_high">Auto-Skill Mode</Label>
                             <Toggle 
                                checked={projectSettings.autoSkillMode} 
                                onChange={(v) => updateProjectSettings({ autoSkillMode: v })} 
                             />
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight">
                            Automatically selects the best component skill/template based on your prompt, overriding manual selections if better.
                        </p>
                    </div>
                </div>
            </PropertySection>

            <PropertySection title="Design System" icon="palette">
                <div className="space-y-2">
                    <Label>Component Library</Label>
                    <SelectInput
                        value={projectSettings.componentLibrary || 'html-tailwind'}
                        options={[
                            { label: 'HTML + Tailwind (Standard)', value: 'html-tailwind' },
                            { label: 'Shadcn UI (Zinc/Inter)', value: 'shadcn' },
                            { label: 'Radix UI (Primitives)', value: 'radix' },
                            { label: 'Chakra UI (Teal/Gray)', value: 'chakra' },
                            { label: 'Material UI (MUI)', value: 'mui' },
                            { label: 'Custom System', value: 'custom' },
                            { label: 'Sci-Fi HUD', value: 'hud' },
                        ]}
                        onChange={(v) => updateProjectSettings({ componentLibrary: v as any })}
                    />
                    <p className="text-[10px] text-slate-500">
                        Helps the AI model choose the right aesthetic, borders, shadows, and typography.
                    </p>
                </div>
            </PropertySection>

            <PropertySection title="Guides & Borders" icon="border_style">
                <div className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                             <Label>Viewport Line</Label>
                             <Toggle 
                                checked={projectSettings.viewportBorder.show} 
                                onChange={(v) => updateProjectSettings({ viewportBorder: { ...projectSettings.viewportBorder, show: v } })} 
                             />
                        </div>
                        {projectSettings.viewportBorder.show && (
                            <div className="pl-2 border-l border-white/5 space-y-2">
                                <Row>
                                    <ColorInput 
                                        value={projectSettings.viewportBorder.color} 
                                        onChange={(v) => updateProjectSettings({ viewportBorder: { ...projectSettings.viewportBorder, color: v } })} 
                                    />
                                    <NumberInput 
                                        value={projectSettings.viewportBorder.width} 
                                        onChange={(v) => updateProjectSettings({ viewportBorder: { ...projectSettings.viewportBorder, width: Number(v) } })} 
                                        unit="px"
                                    />
                                </Row>
                                <Row>
                                    <SelectInput 
                                        value={projectSettings.viewportBorder.style}
                                        options={[
                                            { label: 'Solid', value: 'solid' },
                                            { label: 'Dashed', value: 'dashed' },
                                            { label: 'Dotted', value: 'dotted' }
                                        ]}
                                        onChange={(v) => updateProjectSettings({ viewportBorder: { ...projectSettings.viewportBorder, style: v as any } })}
                                    />
                                </Row>
                            </div>
                        )}
                    </div>

                    <div className="pt-2 border-t border-white/5">
                        <div className="flex items-center justify-between mb-2">
                             <Label>Page Border</Label>
                             <Toggle 
                                checked={projectSettings.pageBorder.show} 
                                onChange={(v) => updateProjectSettings({ pageBorder: { ...projectSettings.pageBorder, show: v } })} 
                             />
                        </div>
                        {projectSettings.pageBorder.show && (
                            <div className="pl-2 border-l border-white/5 space-y-2">
                                <Row>
                                    <ColorInput 
                                        value={projectSettings.pageBorder.color} 
                                        onChange={(v) => updateProjectSettings({ pageBorder: { ...projectSettings.pageBorder, color: v } })} 
                                    />
                                    <NumberInput 
                                        value={projectSettings.pageBorder.width} 
                                        onChange={(v) => updateProjectSettings({ pageBorder: { ...projectSettings.pageBorder, width: Number(v) } })} 
                                        unit="px"
                                    />
                                </Row>
                            </div>
                        )}
                    </div>
                </div>
            </PropertySection>

        </div>
      </aside>
    );
  }
  
  const isFlex = getStyle('display') === 'flex';
  const flexDirection = (getStyle('flexDirection') as string) || 'row';
  const isRow = flexDirection.includes('row');
  const isAbsolute = getStyle('position') === 'absolute';
  
  const anim = getAnimation();

  return (
    <aside className="w-96 glass-right flex flex-col shrink-0 overflow-hidden z-20">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{selectedElement.type}</span>
          <div className="flex items-center gap-2">
             <button 
                onClick={() => toggleElementLock(selectedElement.id)}
                className={`p-1 rounded hover:bg-white/10 transition-colors ${selectedElement.isLocked ? 'text-red-400' : 'text-slate-500 hover:text-white'}`}
                title={selectedElement.isLocked ? "Unlock" : "Lock"}
             >
                <span className="material-icons text-[14px]">{selectedElement.isLocked ? 'lock' : 'lock_open'}</span>
             </button>
             <span className="text-[10px] bg-white/10 text-slate-300 px-1.5 py-0.5 rounded font-mono border border-white/5">ID: {selectedElement.id.substr(0,4)}</span>
          </div>
        </div>
        <input 
            className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder-slate-600 focus:bg-white/5 rounded px-1 -ml-1 transition-colors"
            value={selectedElement.name}
            onChange={(e) => renameElement(selectedElement.id, e.target.value)} 
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
        
        {/* --- Content Editor --- */}
        {selectedElement.type === 'text' && (
             <PropertySection title="Content" icon="text_fields">
                <div className="space-y-2">
                    <Label>Text Content</Label>
                    <textarea 
                        className="w-full bg-black/20 border border-white/10 rounded p-2 text-xs text-slate-200 outline-none focus:border-white/40 resize-y min-h-[80px]"
                        value={selectedElement.props.text || ''}
                        onChange={(e) => updateElementProps(selectedElement.id, { text: e.target.value })}
                    />
                </div>
             </PropertySection>
        )}
        
        {selectedElement.type === 'button' && (
             <PropertySection title="Button Content" icon="smart_button">
                <Row>
                    <div className="flex-1">
                        <Label>Label</Label>
                        <input 
                            className="w-full bg-black/20 border border-white/10 rounded px-2 py-1.5 text-xs text-slate-200 outline-none"
                            value={selectedElement.props.label || 'Button'}
                            onChange={(e) => updateElementProps(selectedElement.id, { label: e.target.value })}
                        />
                    </div>
                </Row>
             </PropertySection>
        )}

        {selectedElement.type === 'image' && (
             <PropertySection title="Image Settings" icon="image">
                <div className="space-y-3">
                    <div className="space-y-1">
                        <Label>Source</Label>
                        <div className="flex gap-2">
                            <input 
                                className="flex-1 bg-black/20 border border-white/10 rounded px-2 py-1.5 text-xs text-slate-200 outline-none"
                                value={selectedElement.props.src || ''}
                                onChange={(e) => updateElementProps(selectedElement.id, { src: e.target.value })}
                                placeholder="https://..."
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/10 rounded transition-colors"
                                title="Upload from Device"
                            >
                                <span className="material-icons text-sm text-slate-300">upload</span>
                            </button>
                            <input 
                                ref={fileInputRef} 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label>Alt Text</Label>
                        <input 
                            className="w-full bg-black/20 border border-white/10 rounded px-2 py-1.5 text-xs text-slate-200 outline-none"
                            value={selectedElement.props.alt || ''}
                            onChange={(e) => updateElementProps(selectedElement.id, { alt: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Fit Mode</Label>
                         <SelectInput 
                            value={getStyle('objectFit') as any || 'cover'}
                            options={[
                                { label: 'Cover', value: 'cover' },
                                { label: 'Contain', value: 'contain' },
                                { label: 'Fill', value: 'fill' },
                                { label: 'None', value: 'none' }
                            ]}
                            onChange={(v) => setStyle('objectFit', v)}
                         />
                    </div>
                </div>
             </PropertySection>
        )}

        {/* --- Animation Section --- */}
        <PropertySection title="Animation" icon="play_circle">
            <div className="space-y-3">
                <Row>
                    <SelectInput
                        label="Type"
                        value={anim.type}
                        options={[
                            { label: 'None', value: 'none' },
                            { label: 'Fade In', value: 'fadeIn' },
                            { label: 'Slide Up', value: 'slideUp' },
                            { label: 'Slide Down', value: 'slideDown' },
                            { label: 'Slide Left', value: 'slideLeft' },
                            { label: 'Slide Right', value: 'slideRight' },
                            { label: 'Zoom In', value: 'zoomIn' },
                            { label: 'Zoom Out', value: 'zoomOut' },
                            { label: 'Bounce', value: 'bounce' },
                            { label: 'Pulse', value: 'pulse' },
                            { label: 'Spin', value: 'spin' }
                        ]}
                        onChange={(v) => updateAnimation({ type: v as any })}
                    />
                </Row>
                
                {anim.type !== 'none' && (
                    <div className="animate-in slide-in-from-top-2 duration-200 space-y-3">
                        <Row>
                            <NumberInput label="Duration (s)" value={anim.duration} onChange={(v) => updateAnimation({ duration: Number(v) })} step={0.1} />
                            <NumberInput label="Delay (s)" value={anim.delay} onChange={(v) => updateAnimation({ delay: Number(v) })} step={0.1} />
                        </Row>
                        <Row>
                            <SelectInput 
                                label="Easing"
                                value={anim.ease}
                                options={[
                                    { label: 'Ease', value: 'ease' },
                                    { label: 'Linear', value: 'linear' },
                                    { label: 'Ease In', value: 'ease-in' },
                                    { label: 'Ease Out', value: 'ease-out' },
                                    { label: 'Ease In Out', value: 'ease-in-out' }
                                ]}
                                onChange={(v) => updateAnimation({ ease: v as any })}
                            />
                            <div className="flex-1">
                                <Label>Loop</Label>
                                <div className="h-8 flex items-center">
                                    <Toggle checked={anim.infinite} onChange={(v) => updateAnimation({ infinite: v })} />
                                </div>
                            </div>
                        </Row>
                    </div>
                )}
            </div>
        </PropertySection>

        {/* --- Layout Section --- */}
        <PropertySection title="Layout System" icon="dashboard">
            <div className="flex items-center justify-between mb-4 bg-white/5 p-2 rounded border border-white/5">
                <Label>Auto Layout</Label>
                <Toggle 
                    checked={isFlex} 
                    onChange={(v) => {
                        if (v) {
                            updateStyles({
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                gap: 16,
                                padding: 20
                            });
                        } else {
                            updateStyles({ display: 'block' });
                        }
                    }}
                />
            </div>

            {/* AI AUTO LAYOUT OPTIMIZER BUTTON */}
            <button
                onClick={refineSelectionLayout}
                disabled={isGenerating}
                className={`w-full flex items-center justify-center gap-2 py-2 mb-4 rounded-lg text-xs font-bold transition-all border ${isGenerating ? 'opacity-50 cursor-wait bg-slate-700 border-transparent text-slate-400' : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 hover:text-white'}`}
            >
                <span className={`material-icons text-[14px] ${isGenerating ? 'animate-spin' : ''}`}>auto_fix_high</span>
                {isGenerating ? 'Optimizing...' : 'AI Auto-Layout (GM)'}
            </button>

            {isFlex && (
                <div className="space-y-4 animate-in slide-in-from-left-2 duration-200">
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                             <Label>Direction</Label>
                             <div className="flex gap-1">
                                 <IconButton 
                                    icon="arrow_downward" 
                                    active={!isRow} 
                                    onClick={() => setStyle('flexDirection', 'column')} 
                                    title="Vertical"
                                    className="flex-1"
                                 />
                                 <IconButton 
                                    icon="arrow_forward" 
                                    active={isRow} 
                                    onClick={() => setStyle('flexDirection', 'row')} 
                                    title="Horizontal"
                                    className="flex-1"
                                 />
                                 <IconButton 
                                    icon="wrap_text" 
                                    active={getStyle('flexWrap') === 'wrap'} 
                                    onClick={() => setStyle('flexWrap', getStyle('flexWrap') === 'wrap' ? 'nowrap' : 'wrap')} 
                                    title="Wrap"
                                 />
                             </div>
                        </div>
                        <div>
                             <Label>Alignment</Label>
                             <AlignmentMatrix 
                                justify={(getStyle('justifyContent') as string) || 'flex-start'}
                                align={(getStyle('alignItems') as string) || 'flex-start'}
                                direction={isRow ? 'row' : 'column'}
                                onChange={(j, a) => updateStyles({ justifyContent: j, alignItems: a })}
                             />
                        </div>
                    </div>

                    <Row>
                        <NumberInput label="Gap" icon="space_bar" value={getStyle('gap')} onChange={(v) => setStyle('gap', v)} unit="px" />
                        <NumberInput label="Padding" icon="padding" value={getStyle('padding')} onChange={(v) => setStyle('padding', v)} unit="px" />
                    </Row>
                    
                    <div className="pt-2 border-t border-white/5">
                        <Label>Distribution</Label>
                         <ButtonTabs 
                            value={getStyle('justifyContent') as any || 'flex-start'}
                            onChange={(v) => setStyle('justifyContent', v)}
                            options={[
                                { icon: 'align_horizontal_left', value: 'flex-start', title: 'Start' },
                                { icon: 'align_horizontal_center', value: 'center', title: 'Center' },
                                { icon: 'align_horizontal_right', value: 'flex-end', title: 'End' },
                                { icon: 'space_bar', value: 'space-between', title: 'Between' }
                            ]}
                         />
                    </div>
                </div>
            )}
        </PropertySection>

        {/* --- Position & Transform --- */}
        <PropertySection title="Position & Transform" icon="control_camera">
            <Row className="mb-3">
                <SelectInput 
                    label="Type"
                    value={getStyle('position') as any || 'relative'}
                    options={[
                        { label: 'Relative', value: 'relative' },
                        { label: 'Absolute', value: 'absolute' },
                        { label: 'Fixed', value: 'fixed' },
                        { label: 'Sticky', value: 'sticky' }
                    ]}
                    onChange={(v) => setStyle('position', v)}
                />
                <NumberInput label="Z-Index" value={getStyle('zIndex')} onChange={(v) => setStyle('zIndex', v)} placeholder="Auto" />
            </Row>

            {isAbsolute && (
                <div className="grid grid-cols-2 gap-2 mb-3 bg-white/5 p-2 rounded border border-white/5">
                    <NumberInput label="Left (X)" value={getStyle('left')} onChange={(v) => setStyle('left', v)} unit="px" />
                    <NumberInput label="Top (Y)" value={getStyle('top')} onChange={(v) => setStyle('top', v)} unit="px" />
                    <NumberInput label="Right" value={getStyle('right')} onChange={(v) => setStyle('right', v)} unit="px" />
                    <NumberInput label="Bottom" value={getStyle('bottom')} onChange={(v) => setStyle('bottom', v)} unit="px" />
                </div>
            )}
            
            <Row>
                <div className="flex-1">
                    <Label>Rotation</Label>
                    <div className="flex items-center gap-2">
                         <span className="material-icons text-slate-500 text-[14px]">rotate_right</span>
                         <input 
                            type="range" min="0" max="360" 
                            value={parseInt(String(getStyle('rotate') || 0)) || 0}
                            onChange={(e) => setStyle('rotate', `${e.target.value}deg`)}
                            className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                         />
                         <span className="text-[10px] w-8 text-right font-mono">{getStyle('rotate') || '0deg'}</span>
                    </div>
                </div>
                <div className="w-1/3">
                    <Label>Overflow</Label>
                    <SelectInput 
                        value={getStyle('overflow') as any || 'visible'}
                        options={[
                            { label: 'Visible', value: 'visible' },
                            { label: 'Hidden', value: 'hidden' },
                            { label: 'Scroll', value: 'scroll' },
                            { label: 'Auto', value: 'auto' }
                        ]}
                        onChange={(v) => setStyle('overflow', v)}
                    />
                </div>
            </Row>
        </PropertySection>

        {/* --- Sizing Section --- */}
        <PropertySection title="Geometry" icon="straighten">
             <div className="space-y-3">
                 <Row>
                    <div className="flex-1">
                        <Label>Width</Label>
                        <div className="flex gap-1 mb-1">
                            <NumberInput value={getStyle('width')} onChange={(v) => setStyle('width', v)} unit="px" placeholder="Auto" />
                            <select 
                                className="w-6 bg-black/20 border border-white/10 rounded text-[10px] text-slate-400 outline-none"
                                onChange={(e) => setStyle('width', e.target.value)}
                                value={getStyle('width') === '100%' ? '100%' : getStyle('width') === 'max-content' ? 'max-content' : 'px'}
                            >
                                <option value="px">px</option>
                                <option value="100%">%</option>
                                <option value="max-content">Hug</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex-1">
                        <Label>Height</Label>
                        <div className="flex gap-1 mb-1">
                            <NumberInput value={getStyle('height')} onChange={(v) => setStyle('height', v)} unit="px" placeholder="Auto" />
                            <select 
                                className="w-6 bg-black/20 border border-white/10 rounded text-[10px] text-slate-400 outline-none"
                                onChange={(e) => setStyle('height', e.target.value)}
                                value={getStyle('height') === '100%' ? '100%' : getStyle('height') === 'max-content' ? 'max-content' : 'px'}
                            >
                                <option value="px">px</option>
                                <option value="100%">%</option>
                                <option value="max-content">Hug</option>
                            </select>
                        </div>
                    </div>
                 </Row>

                 <Row>
                    <NumberInput label="Margin" value={getStyle('margin')} onChange={(v) => setStyle('margin', v)} unit="px" />
                    <NumberInput label="Radius" value={getStyle('borderRadius')} onChange={(v) => setStyle('borderRadius', v)} unit="px" />
                 </Row>

                 <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2">
                    <NumberInput label="Min W" value={getStyle('minWidth')} onChange={(v) => setStyle('minWidth', v)} unit="px" />
                    <NumberInput label="Max W" value={getStyle('maxWidth')} onChange={(v) => setStyle('maxWidth', v)} unit="px" />
                    <NumberInput label="Min H" value={getStyle('minHeight')} onChange={(v) => setStyle('minHeight', v)} unit="px" />
                    <NumberInput label="Max H" value={getStyle('maxHeight')} onChange={(v) => setStyle('maxHeight', v)} unit="px" />
                 </div>
             </div>
        </PropertySection>

        {/* --- Typography Section --- */}
        <PropertySection title="Typography" icon="text_fields">
            <Row>
                <SelectInput 
                    label="Font Family"
                    value={getStyle('fontFamily') as any || 'inherit'}
                    options={[
                        { label: 'Inherit', value: 'inherit' },
                        { label: 'Space Grotesk', value: 'Space Grotesk' },
                        { label: 'Inter', value: 'Inter' },
                        { label: 'Roboto', value: 'Roboto' },
                        { label: 'Playfair Display', value: 'Playfair Display' },
                        { label: 'Monospace', value: 'monospace' },
                        { label: 'Sans-Serif', value: 'sans-serif' },
                        { label: 'Serif', value: 'serif' }
                    ]}
                    onChange={(v) => setStyle('fontFamily', v)}
                />
            </Row>
            <Row>
                <NumberInput label="Size" value={getStyle('fontSize')} onChange={(v) => setStyle('fontSize', v)} unit="px" />
                <SelectInput 
                    label="Weight"
                    value={getStyle('fontWeight') as any || 'normal'}
                    options={[
                        { label: 'Thin (100)', value: '100' },
                        { label: 'Light (300)', value: '300' },
                        { label: 'Normal (400)', value: '400' },
                        { label: 'Medium (500)', value: '500' },
                        { label: 'SemiBold (600)', value: '600' },
                        { label: 'Bold (700)', value: '700' },
                        { label: 'Black (900)', value: '900' }
                    ]}
                    onChange={(v) => setStyle('fontWeight', v)}
                />
            </Row>
            
            <Row>
                <NumberInput label="Line Height" value={getStyle('lineHeight')} onChange={(v) => setStyle('lineHeight', v)} placeholder="1.5" />
                <NumberInput label="Letter Spacing" value={getStyle('letterSpacing')} onChange={(v) => setStyle('letterSpacing', v)} unit="px" step={0.1} />
            </Row>

            <Row>
                <ColorInput label="Color" value={getStyle('color') as string} onChange={(v) => setStyle('color', v)} />
            </Row>

            <div className="pt-2 border-t border-white/5 space-y-2">
                <Label>Alignment & Decoration</Label>
                <ButtonTabs 
                    value={getStyle('textAlign') as any || 'left'}
                    onChange={(v) => setStyle('textAlign', v)}
                    options={[
                        { icon: 'format_align_left', value: 'left', title: 'Left' },
                        { icon: 'format_align_center', value: 'center', title: 'Center' },
                        { icon: 'format_align_right', value: 'right', title: 'Right' },
                        { icon: 'format_align_justify', value: 'justify', title: 'Justify' }
                    ]}
                />
                <ButtonTabs 
                    value={getStyle('textTransform') as any || 'none'}
                    onChange={(v) => setStyle('textTransform', v)}
                    options={[
                        { label: 'Aa', value: 'none', title: 'Normal' },
                        { label: 'AA', value: 'uppercase', title: 'Uppercase' },
                        { label: 'aa', value: 'lowercase', title: 'Lowercase' },
                        { label: 'Aa', value: 'capitalize', title: 'Capitalize' }
                    ]}
                />
                <ButtonTabs 
                    value={getStyle('textDecoration') as any || 'none'}
                    onChange={(v) => setStyle('textDecoration', v)}
                    options={[
                        { icon: 'title', value: 'none', title: 'None' },
                        { icon: 'format_underlined', value: 'underline', title: 'Underline' },
                        { icon: 'format_strikethrough', value: 'line-through', title: 'Strike' }
                    ]}
                />
            </div>
        </PropertySection>

        {/* --- Appearance Section --- */}
        <PropertySection title="Fill & Stroke" icon="palette">
            <div className="space-y-3">
                <ColorInput label="Background" value={getStyle('backgroundColor') as string} onChange={(v) => setStyle('backgroundColor', v)} />
                
                <div className="pt-2 border-t border-white/5">
                    <Label>Border</Label>
                    <Row>
                        <NumberInput value={getStyle('borderWidth')} onChange={(v) => setStyle('borderWidth', v)} unit="px" />
                        <SelectInput 
                            value={getStyle('borderStyle') as any || 'none'}
                            options={[
                                { label: 'None', value: 'none' },
                                { label: 'Solid', value: 'solid' },
                                { label: 'Dashed', value: 'dashed' },
                                { label: 'Dotted', value: 'dotted' }
                            ]}
                            onChange={(v) => setStyle('borderStyle', v)}
                        />
                    </Row>
                    <div className="mt-2">
                        <ColorInput value={getStyle('borderColor') as string} onChange={(v) => setStyle('borderColor', v)} />
                    </div>
                </div>
            </div>
        </PropertySection>

        <PropertySection title="Effects" icon="auto_fix_high">
            <div className="space-y-3">
                 <SliderInput 
                    label="Opacity" 
                    value={Math.round((Number(getStyle('opacity')) || 1) * 100)} 
                    onChange={(v) => setStyle('opacity', v / 100)} 
                />
                 
                 <div className="pt-2 border-t border-white/5">
                    <Label>Shadow</Label>
                    <SelectInput 
                        value={getStyle('boxShadow') as any || 'none'}
                        options={[
                            { label: 'None', value: 'none' },
                            { label: 'Subtle', value: '0 1px 2px 0 rgba(0,0,0,0.5)' },
                            { label: 'Medium', value: '0 4px 6px -1px rgba(0,0,0,0.5)' },
                            { label: 'Large', value: '0 10px 15px -3px rgba(0,0,0,0.5)' },
                            { label: 'X-Large', value: '0 20px 25px -5px rgba(0,0,0,0.5)' },
                            { label: 'Inner', value: 'inset 0 2px 4px 0 rgba(0,0,0,0.5)' },
                            { label: 'White Glow', value: '0 0 15px rgba(255, 255, 255, 0.2)' }
                        ]}
                        onChange={(v) => setStyle('boxShadow', v)}
                     />
                 </div>

                 <div className="pt-2 border-t border-white/5">
                     <Label>Cursor</Label>
                     <SelectInput 
                        value={getStyle('cursor') as any || 'auto'}
                        options={[
                            { label: 'Auto', value: 'auto' },
                            { label: 'Pointer', value: 'pointer' },
                            { label: 'Text', value: 'text' },
                            { label: 'Move', value: 'move' },
                            { label: 'Not Allowed', value: 'not-allowed' }
                        ]}
                        onChange={(v) => setStyle('cursor', v)}
                     />
                 </div>
            </div>
        </PropertySection>

      </div>

      {/* Footer Info */}
      <div className="mt-auto p-3 border-t border-white/5 bg-white/[0.02] flex items-center justify-between text-[10px] text-slate-600">
         <span>{selectedElement.type}.tsx</span>
         <span>v2.5</span>
      </div>
    </aside>
  );
};
