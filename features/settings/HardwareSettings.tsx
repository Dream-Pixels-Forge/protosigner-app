
import React from 'react';
import { useEditor } from '../../context/EditorContext';
import { LOCAL_MODEL_CONFIGS } from '../ai/LocalModelOptimizer';

interface HardwareLevelOption {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const HARDWARE_LEVELS: HardwareLevelOption[] = [
  { 
    id: 'ultra-light', 
    name: 'Ultra Light (1B model, 4GB RAM)', 
    description: 'Maximum speed, minimal memory - for 4GB systems',
    icon: 'bolt'
  },
  { 
    id: 'light', 
    name: 'Light (1.5-2B model, 6GB RAM)', 
    description: 'Balanced speed and quality - for 6GB systems',
    icon: 'speed'
  },
  { 
    id: 'balanced', 
    name: 'Balanced (3-4B model, 8GB RAM)', 
    description: 'Good quality with decent speed - for 8GB systems',
    icon: 'tune'
  },
  { 
    id: 'quality', 
    name: 'Quality (7B+ model, 12GB+ RAM)', 
    description: 'Best quality, more memory - for 12GB+ systems',
    icon: 'high_quality'
  }
];

export const HardwareSettings: React.FC = () => {
  const { 
    projectSettings, 
    updateProjectSettings,
    activeModelProvider
  } = useEditor();
  
  // Only show for Ollama provider
  if (activeModelProvider !== 'Ollama') {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-white mb-3">
            Local Model Optimization
          </h3>
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="material-icons text-blue-400">info</span>
              <div>
                <p className="text-sm text-blue-200">
                  Hardware optimization settings are available when using Ollama local models.
                </p>
                <p className="text-xs text-blue-300/70 mt-1">
                  Switch to Ollama in the Models tab to access these settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const currentLevel = projectSettings.localHardwareLevel || 'ultra-light';
  const currentConfig = LOCAL_MODEL_CONFIGS[currentLevel] || LOCAL_MODEL_CONFIGS['ultra-light'];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-white mb-3">
          Local Model Optimization
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Select your hardware level to optimize AI responses for speed and compatibility
        </p>
        
        <div className="grid grid-cols-1 gap-2">
          {HARDWARE_LEVELS.map(level => (
            <button
              key={level.id}
              onClick={() => updateProjectSettings({ 
                localHardwareLevel: level.id 
              })}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                currentLevel === level.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-white/10 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <span className={`material-icons ${currentLevel === level.id ? 'text-blue-400' : 'text-slate-500'}`}>
                {level.icon}
              </span>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{level.name}</div>
                <div className="text-xs text-slate-400">{level.description}</div>
              </div>
              {currentLevel === level.id && (
                <span className="material-icons text-blue-400 text-sm">check_circle</span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Show current config */}
      <div className="p-3 bg-black/30 rounded-lg border border-white/5">
        <div className="text-xs text-slate-400 mb-2">Current Configuration:</div>
        <pre className="text-[10px] text-slate-500 font-mono overflow-x-auto">
{JSON.stringify(currentConfig, null, 2)}
        </pre>
      </div>
      
      {/* Performance tips */}
      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="material-icons text-green-400 text-sm">tips_and_updates</span>
          <div className="text-xs text-green-200/80">
            <p className="font-medium text-green-300 mb-1">Performance Tips:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Use shorter prompts for faster responses</li>
              <li>Select skills/templates to reduce generation time</li>
              <li>Ultra-light mode works best with 1B parameter models</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
