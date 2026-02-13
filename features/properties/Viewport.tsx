
import React from 'react';
import { useEditor } from '../../context/EditorContext';
import { Label, NumberInput, Row, IconButton } from './PropertyInputs';
import { Toggle } from '../../components/ui/Toggle';

const VIEWPORT_PRESETS = [
    { category: 'Mobile', label: 'iPhone SE (375x667)', w: 375, h: 667 },
    { category: 'Mobile', label: 'iPhone 13/14 (390x844)', w: 390, h: 844 },
    { category: 'Mobile', label: 'iPhone 14/15 Pro (393x852)', w: 393, h: 852 },
    { category: 'Mobile', label: 'iPhone 14/15 Pro Max (430x932)', w: 430, h: 932 },
    { category: 'Mobile', label: 'Pixel 7 (412x915)', w: 412, h: 915 },
    { category: 'Mobile', label: 'Android Small (360x640)', w: 360, h: 640 },

    { category: 'Tablet', label: 'iPad Mini (744x1133)', w: 744, h: 1133 },
    { category: 'Tablet', label: 'iPad Air (820x1180)', w: 820, h: 1180 },
    { category: 'Tablet', label: 'iPad Pro 11" (834x1194)', w: 834, h: 1194 },
    { category: 'Tablet', label: 'iPad Pro 12.9" (1024x1366)', w: 1024, h: 1366 },
    { category: 'Tablet', label: 'Surface Pro 8 (912x1368)', w: 912, h: 1368 },

    { category: 'Desktop', label: 'Laptop (1366x768)', w: 1366, h: 768 },
    { category: 'Desktop', label: 'MacBook Air (1280x832)', w: 1280, h: 832 },
    { category: 'Desktop', label: 'MacBook Pro 14 (1512x982)', w: 1512, h: 982 },
    { category: 'Desktop', label: 'Desktop 1080p (1920x1080)', w: 1920, h: 1080 },
    { category: 'Desktop', label: 'Desktop 1440p (2560x1440)', w: 2560, h: 1440 },
    { category: 'Desktop', label: '4K Ultra HD (3840x2160)', w: 3840, h: 2160 }
];

// Helper to group presets
const groupedPresets = VIEWPORT_PRESETS.reduce((acc, preset) => {
    if (!acc[preset.category]) acc[preset.category] = [];
    acc[preset.category].push(preset);
    return acc;
}, {} as Record<string, typeof VIEWPORT_PRESETS>);

export const Viewport: React.FC = () => {
    const { projectSettings, updateProjectSettings } = useEditor();
    
    // Detect if current dimensions match a preset
    const currentW = projectSettings.viewportSize.width;
    const currentH = projectSettings.viewportSize.height;
    
    const isLandscape = currentW > currentH;

    const currentPreset = VIEWPORT_PRESETS.find(
        p => (p.w === currentW && p.h === currentH) || (p.w === currentH && p.h === currentW)
    );

    const handlePresetChange = (jsonStr: string) => {
        if (jsonStr === 'custom') return;
        const { w, h } = JSON.parse(jsonStr);
        // Ensure page height is at least viewport height, but keep existing page height if it's larger
        // (preserves long scrolling pages when switching devices if applicable, though usually a reset is safer for 1:1 match)
        // For "High Accurate" results, we reset page height to viewport height to ensure 1:1 starting point,
        // user can then extend. Or better: use Math.max
        const newPageH = Math.max(h, projectSettings.pageSize.height);
        
        // --- Smart Guide Calculation ---
        let cols = 12;
        let gap = 24;
        let margin = 0;
        let safeZone = w;

        if (w < 600) {
            // Mobile Pattern
            cols = 4;
            gap = 16;
            margin = 16;
            safeZone = w - (margin * 2);
        } else if (w < 900) {
            // Tablet Pattern
            cols = 8;
            gap = 20;
            margin = 32;
            safeZone = w - (margin * 2);
        } else {
            // Desktop Pattern (Bootstrap-aligned)
            cols = 12;
            gap = 24;
            if (w >= 1400) safeZone = 1320;
            else if (w >= 1200) safeZone = 1140;
            else if (w >= 992) safeZone = 960;
            else safeZone = Math.max(w - 64, w * 0.9); // Dynamic fallback
            
            margin = (w - safeZone) / 2;
        }

        updateProjectSettings({ 
            viewportSize: { width: w, height: h },
            pageSize: { width: w, height: newPageH },
            guides: {
                ...projectSettings.guides,
                foldPosition: h,
                safeZoneWidth: Math.floor(safeZone),
                columns: cols,
                gap: gap,
                margin: Math.floor(margin),
                // Auto-enable grid/safe zone if not set? Let's respect user choice but update values.
            }
        });
    };

    const toggleOrientation = () => {
        const newW = currentH;
        const newH = currentW;
        
        const newPageH = Math.max(newH, projectSettings.pageSize.height);

        // Recalculate margins for new orientation
        // Reuse logic by calling handlePresetChange? No, direct update safer to avoid recursion issues or parsing
        // We'll just do a simple update here, smart guides might need manual refresh or we duplicate logic.
        // For simplicity, just swap dims.
        updateProjectSettings({
            viewportSize: { width: newW, height: newH },
            pageSize: { width: newW, height: newPageH }
        });
    };

    return (
        <>
            <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                    <Label>Device Preset</Label>
                    <IconButton 
                        icon={isLandscape ? 'crop_landscape' : 'crop_portrait'} 
                        onClick={toggleOrientation}
                        title={`Switch to ${isLandscape ? 'Portrait' : 'Landscape'}`}
                        className="w-6 h-6 bg-white/5 border-white/5"
                    />
                </div>
                <div className="relative">
                    <select
                        className="w-full bg-black/20 border border-white/10 rounded px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-white/40 appearance-none cursor-pointer"
                        value={currentPreset ? JSON.stringify({ w: currentPreset.w, h: currentPreset.h }) : 'custom'}
                        onChange={(e) => handlePresetChange(e.target.value)}
                    >
                        <option value="custom">Custom Size</option>
                        {Object.entries(groupedPresets).map(([category, presets]) => (
                            <optgroup key={category} label={category} className="bg-[#1e1e1e] text-slate-500 font-bold">
                                {presets.map(p => (
                                    <option key={p.label} value={JSON.stringify({ w: p.w, h: p.h })} className="text-slate-200 font-normal">
                                        {p.label}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                    <span className="material-icons absolute right-2 top-1.5 text-[14px] text-slate-500 pointer-events-none">expand_more</span>
                </div>
            </div>

            <div>
                <Label>Viewport (Above Fold)</Label>
                <Row>
                    <NumberInput 
                        value={projectSettings.viewportSize.width} 
                        onChange={(v) => updateProjectSettings({ 
                            viewportSize: { ...projectSettings.viewportSize, width: Number(v) },
                            pageSize: { ...projectSettings.pageSize, width: Number(v) } // Sync page width
                        })} 
                        unit="W" 
                    />
                    <NumberInput 
                        value={projectSettings.viewportSize.height} 
                        onChange={(v) => updateProjectSettings({ viewportSize: { ...projectSettings.viewportSize, height: Number(v) }})} 
                        unit="H" 
                    />
                </Row>
            </div>

            {/* DESIGN GUIDES TOGGLES */}
            <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-1 mb-2">
                    <span className="material-icons text-[12px] text-slate-400">ruler</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Design Guides</span>
                </div>
                
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                         <span className="text-xs text-slate-300">Show Average Fold</span>
                         <Toggle 
                            checked={projectSettings.guides.showFold}
                            onChange={(v) => updateProjectSettings({ guides: { ...projectSettings.guides, showFold: v } })}
                         />
                    </div>
                    {projectSettings.guides.showFold && (
                        <div className="pl-2 mb-2">
                            <NumberInput 
                                label="Fold Y"
                                value={projectSettings.guides.foldPosition}
                                onChange={(v) => updateProjectSettings({ guides: { ...projectSettings.guides, foldPosition: Number(v) } })}
                                unit="px"
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                         <span className="text-xs text-slate-300">Safe Zone</span>
                         <Toggle 
                            checked={projectSettings.guides.showSafeZone}
                            onChange={(v) => updateProjectSettings({ guides: { ...projectSettings.guides, showSafeZone: v } })}
                         />
                    </div>
                     {projectSettings.guides.showSafeZone && (
                        <div className="pl-2 mb-2">
                            <NumberInput 
                                label="Max Width"
                                value={projectSettings.guides.safeZoneWidth}
                                onChange={(v) => updateProjectSettings({ guides: { ...projectSettings.guides, safeZoneWidth: Number(v) } })}
                                unit="px"
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                         <span className="text-xs text-slate-300">Grid Layout</span>
                         <Toggle 
                            checked={projectSettings.guides.showColumnGrid}
                            onChange={(v) => updateProjectSettings({ guides: { ...projectSettings.guides, showColumnGrid: v } })}
                         />
                    </div>
                    {projectSettings.guides.showColumnGrid && (
                        <div className="pl-2 space-y-2">
                            <Row>
                                 <NumberInput 
                                    label="Cols"
                                    value={projectSettings.guides.columns}
                                    onChange={(v) => updateProjectSettings({ guides: { ...projectSettings.guides, columns: Number(v) } })}
                                />
                                 <NumberInput 
                                    label="Gap"
                                    value={projectSettings.guides.gap}
                                    onChange={(v) => updateProjectSettings({ guides: { ...projectSettings.guides, gap: Number(v) } })}
                                    unit="px"
                                />
                            </Row>
                            <Row>
                                <NumberInput 
                                    label="Margin (X)"
                                    value={projectSettings.guides.margin}
                                    onChange={(v) => updateProjectSettings({ guides: { ...projectSettings.guides, margin: Number(v) } })}
                                    unit="px"
                                />
                            </Row>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
