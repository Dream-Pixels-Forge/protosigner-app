import { useEffect } from 'react';
import { AIProvider, EnvironmentMode } from '../../types';

interface UseSpectralAgentProps {
    environmentMode: EnvironmentMode;
    activeModelProvider: AIProvider;
    setActiveModelProvider: (provider: AIProvider) => void;
    setActiveModelId: (id: string) => void;
}

// --- SPECTRAL AGENT HOOK ---
export const useSpectralAgent = ({
    environmentMode,
    activeModelProvider,
    setActiveModelProvider,
    setActiveModelId
}: UseSpectralAgentProps) => {
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
};
