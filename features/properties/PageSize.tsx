
import React from 'react';
import { useEditor } from '../../context/EditorContext';
import { Label, NumberInput, Row } from './PropertyInputs';

export const PageSize: React.FC = () => {
    const { projectSettings, updateProjectSettings } = useEditor();

    const isMatch = projectSettings.pageSize.width === projectSettings.viewportSize.width && 
                    projectSettings.pageSize.height === projectSettings.viewportSize.height;

    const handleSync = () => {
        updateProjectSettings({
            pageSize: { 
                width: projectSettings.viewportSize.width,
                height: projectSettings.viewportSize.height
            }
        });
    };

    return (
        <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
                <Label>Page Size (Scrollable)</Label>
                {!isMatch && (
                    <button 
                        onClick={handleSync}
                        className="text-[9px] font-bold text-blue-400 hover:text-blue-300 border border-blue-500/30 rounded px-1.5 py-0.5 bg-blue-500/10 transition-colors"
                        title="Match Viewport Dimensions"
                    >
                        Sync Viewport
                    </button>
                )}
            </div>
            <Row>
                <NumberInput 
                    value={projectSettings.pageSize.width} 
                    onChange={(v) => updateProjectSettings({ 
                        pageSize: { ...projectSettings.pageSize, width: Number(v) }
                    })} 
                    unit="W" 
                />
                <NumberInput 
                    value={projectSettings.pageSize.height} 
                    onChange={(v) => updateProjectSettings({ 
                        pageSize: { ...projectSettings.pageSize, height: Number(v) }
                    })} 
                    unit="H" 
                />
            </Row>
            <div className="mt-1 text-[9px] text-slate-500">
                {projectSettings.pageSize.height > projectSettings.viewportSize.height ? 
                    `Scrolls ${projectSettings.pageSize.height - projectSettings.viewportSize.height}px` : 
                    'Fits in viewport'}
            </div>
        </div>
    );
};
