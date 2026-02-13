
import React from 'react';
import { GuideSettings } from '../../types';

interface DesignGuideOverlayProps {
  settings: GuideSettings;
  width: number;
  height: number;
}

export const DesignGuideOverlay: React.FC<DesignGuideOverlayProps> = ({ settings, width, height }) => {
  const { showFold, foldPosition, showSafeZone, safeZoneWidth, showColumnGrid, columns, gap, color } = settings;

  return (
    <div className="absolute inset-0 pointer-events-none z-[60] overflow-hidden">
        {/* --- 1. The Fold Line --- */}
        {showFold && (
            <div 
                className="absolute left-0 right-0 border-b-2 border-dashed border-red-500/50 flex items-end justify-end px-2"
                style={{ top: foldPosition }}
            >
                <span className="text-[10px] text-red-500 font-bold bg-black/50 px-1 rounded-t -mb-[2px]">
                    AVERAGE FOLD ({foldPosition}px)
                </span>
            </div>
        )}

        {/* --- 2. Safe Zone (Center Container) --- */}
        {showSafeZone && (
            <div className="absolute inset-0 flex items-center justify-center">
                <div 
                    className="h-full border-x border-dashed border-cyan-400/40 bg-cyan-400/[0.02]"
                    style={{ width: safeZoneWidth }}
                >
                    <div className="w-full h-4 border-b border-cyan-400/20 flex items-center justify-center">
                         <span className="text-[9px] text-cyan-400 font-mono tracking-widest uppercase">Safe Zone: {safeZoneWidth}px</span>
                    </div>
                </div>
            </div>
        )}

        {/* --- 3. Column Grid --- */}
        {showColumnGrid && (
            <div className="absolute inset-0 flex items-center justify-center">
                <div 
                    className="h-full w-full grid"
                    style={{ 
                        maxWidth: safeZoneWidth || '100%', 
                        gridTemplateColumns: `repeat(${columns}, 1fr)`,
                        gap: gap,
                        paddingLeft: settings.margin,
                        paddingRight: settings.margin
                    }}
                >
                    {Array.from({ length: columns }).map((_, i) => (
                        <div 
                            key={i} 
                            className="h-full bg-red-500/10 flex items-start justify-center pt-2"
                        >
                             <span className="text-[8px] text-red-500/50">{i + 1}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};
