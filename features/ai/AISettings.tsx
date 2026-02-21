import { useState, useEffect } from 'react';
import type { AIProvider, GenerationConfig } from '@/services/api/aiService';
import { DEFAULT_PROVIDERS, DEFAULT_CONFIG } from '@/services/api/aiService';

interface AISettingsProps {
  onClose: () => void;
}

export function AISettings({ onClose }: AISettingsProps) {
  const [providers, setProviders] = useState<AIProvider[]>(DEFAULT_PROVIDERS);
  const [config, setConfig] = useState<GenerationConfig>(DEFAULT_CONFIG);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'providers' | 'settings'>('providers');

  useEffect(() => {
    // Load saved settings
    const saved = localStorage.getItem('ai_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.providers) setProviders(parsed.providers);
      if (parsed.config) setConfig(parsed.config);
    }
    
    // Load API keys (never expose in real app - use secure storage)
    const savedKeys = localStorage.getItem('ai_api_keys');
    if (savedKeys) {
      setApiKeys(JSON.parse(savedKeys));
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('ai_settings', JSON.stringify({ providers, config }));
      localStorage.setItem('ai_api_keys', JSON.stringify(apiKeys));
      onClose();
    } catch (error) {
      console.error('Failed to save AI settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleProvider = (providerId: string) => {
    setProviders(prev =>
      prev.map(p =>
        p.id === providerId ? { ...p, enabled: !p.enabled } : p
      )
    );
  };

  const updateApiKey = (providerId: string, key: string) => {
    setApiKeys(prev => ({ ...prev, [providerId]: key }));
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">AI Settings</h2>
            <p className="text-sm text-gray-400">Configure AI providers and generation settings</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span className="material-icons text-gray-400">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab('providers')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'providers'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Providers
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Generation Settings
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'providers' ? (
            <div className="space-y-4">
              {providers.map(provider => (
                <div
                  key={provider.id}
                  className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        provider.enabled ? 'bg-blue-500/20' : 'bg-gray-700'
                      }`}>
                        <span className="material-icons text-sm text-white">
                          {provider.id === 'gemini' ? 'smart_toy' : 
                           provider.id === 'openrouter' ? 'dns' : 'cloud'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{provider.name}</h3>
                        <p className="text-xs text-gray-400">{provider.model}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={provider.enabled}
                        onChange={() => toggleProvider(provider.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                  
                  {provider.enabled && (
                    <div className="mt-3">
                      <label className="block text-xs text-gray-400 mb-1">API Key</label>
                      <input
                        type="password"
                        value={apiKeys[provider.id] || ''}
                        onChange={(e) => updateApiKey(provider.id, e.target.value)}
                        placeholder={`Enter your ${provider.name} API key`}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Temperature */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white">Temperature</label>
                  <span className="text-sm text-gray-400">{config.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Higher = more creative, Lower = more focused
                </p>
              </div>

              {/* Max Tokens */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white">Max Tokens</label>
                  <span className="text-sm text-gray-400">{config.maxTokens}</span>
                </div>
                <input
                  type="range"
                  min="512"
                  max="8192"
                  step="256"
                  value={config.maxTokens}
                  onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum length of the generated response
                </p>
              </div>

              {/* Top P */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white">Top P (Nucleus Sampling)</label>
                  <span className="text-sm text-gray-400">{config.topP}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.topP}
                  onChange={(e) => setConfig({ ...config, topP: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Controls diversity via nucleus sampling
                </p>
              </div>

              {/* Frequency Penalty */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white">Frequency Penalty</label>
                  <span className="text-sm text-gray-400">{config.frequencyPenalty}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.frequencyPenalty}
                  onChange={(e) => setConfig({ ...config, frequencyPenalty: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Reduces repetition of same lines
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800 bg-gray-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
