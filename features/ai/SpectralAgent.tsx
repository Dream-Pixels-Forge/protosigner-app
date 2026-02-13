
import React, { useEffect } from 'react';
import { useEditor } from '../../context/EditorContext';

// --- REACT COMPONENT COORDINATOR ---

export const SpectralAgent: React.FC = () => {
    const { 
        environmentMode, 
        activeModelProvider, 
        setActiveModelProvider, 
        setActiveModelId,
        ollamaServerUrl
    } = useEditor();

    // Environment Watcher
    useEffect(() => {
        const coordinateSystem = async () => {
            if (environmentMode === 'local') {
                // Switch to Local Provider if not already
                if (activeModelProvider !== 'Ollama') {
                    console.log('[Spectral] Switching to Local Environment...');
                    setActiveModelProvider('Ollama');
                    setActiveModelId('llama3'); // Default local model
                }
            } else {
                // Switch to Cloud Provider if not already
                if (activeModelProvider === 'Ollama') {
                    console.log('[Spectral] Switching to Cloud Environment...');
                    setActiveModelProvider('Google');
                    setActiveModelId('gemini-3-flash-preview');
                }
            }
        };

        coordinateSystem();
    }, [environmentMode, setActiveModelProvider, setActiveModelId, activeModelProvider]);

    return null; // Headless Agent
};
