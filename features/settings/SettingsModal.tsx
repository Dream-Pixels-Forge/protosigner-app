
import React, { useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import { AIModel, AppSettings, AIProvider } from '../../types';
import { Toggle } from '../../components/ui/Toggle';

export const SettingsModal: React.FC = () => {
  const { 
      isSettingsModalOpen, toggleSettingsModal, 
      activeSettingsTab, setActiveSettingsTab,
      activeModelId, setActiveModelId, 
      activeModelProvider, setActiveModelProvider,
      googleApiKey,
      openRouterApiKey,
      ollamaServerUrl, setOllamaServerUrl,
      appSettings, updateAppSettings,
      user
  } = useEditor();

  const [modelSubTab, setModelSubTab] = useState<AIProvider>('Google');
  const [ollamaModels, setOllamaModels] = useState<AIModel[]>([]);
  const [openRouterModels, setOpenRouterModels] = useState<AIModel[]>([]);
  
  const [newServerUrl, setNewServerUrl] = useState('');
  const [newServerName, setNewServerName] = useState('');

  // Fetch Ollama models
  React.useEffect(() => {
    const fetchOllamaModels = async () => {
      if (!ollamaServerUrl) return;
      try {
        const res = await fetch(`${ollamaServerUrl}/api/tags`);
        if (res.ok) {
          const data = await res.json();
          const models = data.models?.map((m: any) => ({
            id: m.name,
            name: m.name.split(':')[0].charAt(0).toUpperCase() + m.name.split(':')[0].slice(1),
            provider: 'Ollama' as AIProvider,
            status: 'connected',
            latency: 'Local',
            tags: ['Local'],
            recommended: m.name.includes('llama')
          })) || [];
          setOllamaModels(models);
        }
      } catch (e) {
        console.error('Failed to fetch Ollama models', e);
      }
    };
    if (modelSubTab === 'Ollama') fetchOllamaModels();
  }, [ollamaServerUrl, modelSubTab]);

  // Fetch OpenRouter models
  React.useEffect(() => {
    const fetchOpenRouterModels = async () => {
      if (!openRouterApiKey) return;
      try {
        const res = await fetch('https://openrouter.ai/api/v1/models', {
          headers: { 'Authorization': `Bearer ${openRouterApiKey}` }
        });
        if (res.ok) {
          const data = await res.json();
          const models = data.data?.slice(0, 8).map((m: any) => ({
            id: m.id,
            name: m.name || m.id,
            provider: 'OpenRouter' as AIProvider,
            status: 'connected',
            latency: 'Cloud',
            tags: m.id.includes('claude') ? ['Coding'] : m.id.includes('gpt') ? ['Versatile'] : ['AI'],
            recommended: m.id.includes('claude-3.5-sonnet')
          })) || [];
          setOpenRouterModels(models);
        }
      } catch (e) {
        console.error('Failed to fetch OpenRouter models', e);
      }
    };
    if (modelSubTab === 'OpenRouter') fetchOpenRouterModels();
  }, [openRouterApiKey, modelSubTab]);

  // Sync sub-tab with active provider initially
  // FIXED: Moved useEffect BEFORE the conditional return to prevent Hook Error #310
  React.useEffect(() => {
      if (isSettingsModalOpen) {
          setModelSubTab(activeModelProvider);
      }
  }, [isSettingsModalOpen, activeModelProvider]);

  if (!isSettingsModalOpen) return null;

  // Handle Provider Switch
  const handleProviderSwitch = (provider: AIProvider) => {
      setModelSubTab(provider);
      if (activeModelProvider !== provider) {
          const defaultModel = MODELS_DATA[provider].find(m => m.recommended) || MODELS_DATA[provider][0];
          setActiveModelId(defaultModel.id);
          setActiveModelProvider(provider);
      }
  };

  const MODELS_DATA: Record<AIProvider, AIModel[]> = {
    Google: [
        { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', provider: 'Google', status: 'connected', latency: '120ms', tags: ['Fast', 'Multimodal'], recommended: true },
        { id: 'gemini-exp-1206', name: 'Gemini Exp 1206', provider: 'Google', status: 'connected', latency: '245ms', tags: ['Reasoning', 'Complex'] },
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', status: 'connected', latency: '100ms', tags: ['Legacy', 'Stable'] },
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', status: 'connected', latency: '180ms', tags: ['Advanced', 'Pro'] }
    ],
    OpenRouter: openRouterModels.length > 0 ? openRouterModels : [
        { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'OpenRouter', status: 'disconnected', latency: 'Medium', tags: ['Balanced', 'Coding'], recommended: true },
        { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'OpenRouter', status: 'disconnected', latency: 'Slow', tags: ['Top Tier', 'Reasoning'] },
        { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenRouter', status: 'disconnected', latency: 'Fast', tags: ['Versatile'] },
        { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenRouter', status: 'disconnected', latency: 'Fast', tags: ['Efficient'] },
        { id: 'google/gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', provider: 'OpenRouter', status: 'disconnected', latency: 'Fast', tags: ['Multimodal'] },
        { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', provider: 'OpenRouter', status: 'disconnected', latency: 'Fast', tags: ['Open Source'] },
        { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', provider: 'OpenRouter', status: 'disconnected', latency: 'Fast', tags: ['Reasoning'] },
        { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B', provider: 'OpenRouter', status: 'disconnected', latency: 'Medium', tags: ['Multilingual'] }
    ],
    Ollama: ollamaModels
  };

  const TABS = [
    { id: 'models', label: 'Models', icon: 'layers' },
    { id: 'connections', label: 'Connections', icon: 'hub' },
    { id: 'billing', label: 'Billing & Plans', icon: 'credit_card' },
    { id: 'sync', label: 'Sync Settings', icon: 'sync' },
    { id: 'advanced', label: 'Advanced', icon: 'tune' }
  ];

  const handleAddServer = () => {
      if(!newServerName || !newServerUrl) return;
      updateAppSettings({
          mcpServers: [...appSettings.mcpServers, {
              id: Math.random().toString(36).substr(2, 9),
              name: newServerName,
              url: newServerUrl,
              status: 'disconnected'
          }]
      });
      setNewServerName('');
      setNewServerUrl('');
  };

  const removeServer = (id: string) => {
      updateAppSettings({
          mcpServers: appSettings.mcpServers.filter(s => s.id !== id)
      });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={toggleSettingsModal}
      ></div>

      <div className="relative z-10 w-full max-w-5xl glass-high border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[750px] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center shadow-lg shadow-white/10">
              <span className="material-icons text-black text-lg">settings_input_component</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">System Configuration</h1>
              <p className="text-xs text-slate-400">Configure AI Engine, MCP, and Workspace</p>
            </div>
          </div>
          <button 
            onClick={toggleSettingsModal}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-64 bg-black/20 border-r border-white/5 p-4 space-y-2">
            <nav className="space-y-1">
              {TABS.map((tab) => (
                <button 
                    key={tab.id} 
                    onClick={() => setActiveSettingsTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer text-left ${activeSettingsTab === tab.id ? 'bg-white/10 text-white font-medium border border-white/5 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
                >
                  <span className={`material-icons text-xl ${activeSettingsTab === tab.id ? 'text-white' : 'text-slate-500'}`}>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {activeSettingsTab === tab.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>}
                </button>
              ))}
            </nav>

            <div className="pt-8 px-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">System Status</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">AI Engine</span>
                  <span className="flex items-center gap-1.5 text-green-400 font-medium">
                     {activeModelProvider}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">MCP Gateway</span>
                  <span className="flex items-center gap-1.5 text-green-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Active
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Panel */}
          <main className="flex-1 overflow-y-auto bg-black/40 p-8">
            
            {/* --- MODELS TAB --- */}
            {activeSettingsTab === 'models' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <header>
                        <h2 className="text-2xl font-bold mb-2 text-white">AI Provider</h2>
                        <p className="text-slate-400 text-sm">Select the generative model provider for UI generation.</p>
                    </header>
                    
                    {/* Provider Sub-Tabs */}
                    <div className="flex space-x-1 bg-black/20 p-1 rounded-lg border border-white/5 w-fit">
                        {(['Google', 'OpenRouter', 'Ollama'] as AIProvider[]).map((provider) => (
                            <button
                                key={provider}
                                onClick={() => handleProviderSwitch(provider)}
                                className={`
                                    px-4 py-2 rounded-md text-sm font-medium transition-all
                                    ${modelSubTab === provider 
                                        ? 'bg-white text-black shadow-sm' 
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'}
                                `}
                            >
                                {provider}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {MODELS_DATA[modelSubTab].map(model => (
                            <div 
                                key={model.id}
                                onClick={() => {
                                    setActiveModelId(model.id);
                                    setActiveModelProvider(modelSubTab);
                                }}
                                className={`relative group cursor-pointer transition-all duration-200 rounded-xl ${activeModelId === model.id && activeModelProvider === modelSubTab ? 'ring-1 ring-white' : 'hover:border-white/20'}`}
                            >
                                {activeModelId === model.id && activeModelProvider === modelSubTab && (
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-white to-slate-400 rounded-xl opacity-10 blur-sm"></div>
                                )}
                                <div className={`relative flex items-center p-4 rounded-xl border ${activeModelId === model.id && activeModelProvider === modelSubTab ? 'bg-white/[0.03] border-white/20' : 'bg-black/20 border-white/5'}`}>
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${activeModelId === model.id && activeModelProvider === modelSubTab ? 'bg-white text-black' : 'bg-white/5 text-slate-500'}`}>
                                        <span className={`material-icons text-2xl`}>
                                            {model.id.includes('gemini') ? 'auto_awesome' : model.provider === 'Ollama' ? 'terminal' : 'cloud'}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg text-white">{model.name}</h3>
                                            {model.recommended && <span className="px-2 py-0.5 text-[10px] font-bold bg-white text-black rounded-full uppercase tracking-wider">Recommended</span>}
                                        </div>
                                        <div className="flex gap-3 items-center">
                                            <span className="text-xs text-slate-400 flex items-center gap-1"><span className="material-icons text-sm">speed</span> {model.latency}</span>
                                            <div className="flex gap-1.5">
                                                {model.tags.map(tag => <span key={tag} className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-slate-400 font-medium border border-white/5">{tag}</span>)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${activeModelId === model.id && activeModelProvider === modelSubTab ? 'bg-white border-white' : 'border-slate-700'}`}>
                                        {activeModelId === model.id && activeModelProvider === modelSubTab && <span className="material-icons text-black text-sm font-bold">check</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <section className="border-t border-white/10 pt-8">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
                            <span className="material-icons text-white">vpn_key</span> Configuration ({modelSubTab})
                        </h3>
                        <div className="space-y-4 max-w-2xl">
                            {/* SECURITY UPGRADE: Removed insecure Input fields. Keys are strictly from ENV. */}
                            
                            {modelSubTab === 'Google' && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-4">
                                        <span className="material-icons text-blue-400 mt-0.5">security</span>
                                        <div>
                                            <div className="font-bold text-blue-100 text-sm mb-1">Zero-Code Storage Enforced</div>
                                            <p className="text-xs text-blue-300/80 leading-relaxed">
                                                API Keys must be injected via Environment Variables (<code className="bg-black/30 px-1 py-0.5 rounded text-white">process.env.API_KEY</code>). 
                                                Manual entry is disabled to prevent accidental commitment to version control.
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                                        <div>
                                            <div className="text-sm font-bold text-white">API Key Status</div>
                                            <div className="text-xs text-slate-500 mt-1">Checked at runtime</div>
                                        </div>
                                        <div>
                                            {googleApiKey ? (
                                                <span className="flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full border border-green-500/20 text-xs font-bold uppercase tracking-wider">
                                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2 bg-red-500/10 text-red-400 px-3 py-1.5 rounded-full border border-red-500/20 text-xs font-bold uppercase tracking-wider">
                                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                    Missing
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modelSubTab === 'OpenRouter' && (
                                 <div className="space-y-4">
                                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-start gap-3">
                                        <span className="material-icons text-slate-400 mt-0.5">lock</span>
                                        <div>
                                            <div className="font-bold text-white text-sm mb-1">Environment Variable Required</div>
                                            <p className="text-xs text-slate-400">
                                                Set <code className="text-slate-200">OPENROUTER_API_KEY</code> in your environment.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                                        <span className="text-sm font-bold text-white">Connection Status</span>
                                        {openRouterApiKey ? (
                                            <span className="text-xs font-bold text-green-400">Connected</span>
                                        ) : (
                                            <span className="text-xs font-bold text-slate-500">Not Configured</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {modelSubTab === 'Ollama' && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-400">Ollama Server URL</label>
                                    <input 
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-white focus:border-white outline-none transition-all placeholder-slate-700" 
                                        type="text" 
                                        value={ollamaServerUrl}
                                        onChange={(e) => setOllamaServerUrl(e.target.value)}
                                        placeholder="http://localhost:11434"
                                    />
                                    <p className="text-[11px] text-slate-500">Local URL allowed. Ensure OLLAMA_ORIGINS="*" is set.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            )}

            {/* --- CONNECTIONS TAB --- */}
            {activeSettingsTab === 'connections' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <header>
                        <h2 className="text-2xl font-bold mb-2 text-white">MCP Connections</h2>
                        <p className="text-slate-400 text-sm">Manage Model Context Protocol servers for external tool integration.</p>
                    </header>

                    <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white">Active Servers</h3>
                            <span className="text-xs text-slate-500">{appSettings.mcpServers.length} configured</span>
                        </div>
                        <div className="divide-y divide-white/5">
                            {appSettings.mcpServers.map(server => (
                                <div key={server.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-2 rounded-full ${server.status === 'connected' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-red-400'}`}></div>
                                        <div>
                                            <div className="text-sm font-bold text-white">{server.name}</div>
                                            <div className="text-xs text-slate-500 font-mono">{server.url}</div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => removeServer(server.id)}
                                        className="text-slate-500 hover:text-red-400 p-2 rounded hover:bg-white/5 transition-colors"
                                    >
                                        <span className="material-icons text-lg">delete</span>
                                    </button>
                                </div>
                            ))}
                            {appSettings.mcpServers.length === 0 && (
                                <div className="p-8 text-center text-slate-500 text-sm italic">No servers connected.</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-xl p-6">
                        <h3 className="text-sm font-bold text-white mb-4">Add New Server</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-1">
                                <label className="text-xs text-slate-400">Server Name</label>
                                <input 
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-white/40 outline-none"
                                    placeholder="e.g. Local Filesystem"
                                    value={newServerName}
                                    onChange={(e) => setNewServerName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-slate-400">WebSocket URL</label>
                                <input 
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-white/40 outline-none"
                                    placeholder="ws://localhost:3000"
                                    value={newServerUrl}
                                    onChange={(e) => setNewServerUrl(e.target.value)}
                                />
                            </div>
                        </div>
                        <button 
                            onClick={handleAddServer}
                            disabled={!newServerName || !newServerUrl}
                            className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Connect Server
                        </button>
                    </div>
                </div>
            )}

            {/* --- BILLING TAB --- */}
            {activeSettingsTab === 'billing' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <header>
                        <h2 className="text-2xl font-bold mb-2 text-white">Billing & Plans</h2>
                        <p className="text-slate-400 text-sm">Manage your subscription, billing details, and invoicing.</p>
                    </header>

                    {/* Operational Safeguards - Security Advisory */}
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-amber-400">
                            <span className="material-icons text-lg">warning_amber</span>
                            <h3 className="text-sm font-bold uppercase tracking-wider">Operational Safeguards</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <a 
                                href="https://console.cloud.google.com/billing" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-black/40 p-3 rounded-lg border border-amber-500/10 hover:border-amber-500/30 transition-colors group cursor-pointer"
                            >
                                <div className="text-xs font-bold text-white mb-1 group-hover:text-amber-300 transition-colors">Set Budget Alerts ↗</div>
                                <p className="text-[10px] text-slate-400 leading-tight">Configure budget thresholds to receive emails when spending exceeds expectations.</p>
                            </a>
                            <a 
                                href="https://console.cloud.google.com/billing" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-black/40 p-3 rounded-lg border border-amber-500/10 hover:border-amber-500/30 transition-colors group cursor-pointer"
                            >
                                <div className="text-xs font-bold text-white mb-1 group-hover:text-amber-300 transition-colors">Billing Anomalies ↗</div>
                                <p className="text-[10px] text-slate-400 leading-tight">Detect sudden spikes in API consumption that may indicate a security breach.</p>
                            </a>
                        </div>
                    </div>

                    {/* Current Plan */}
                    <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/10 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute right-0 top-0 p-32 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none"></div>
                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Current Subscription</div>
                                <h3 className="text-3xl font-bold text-white mb-2">{user.role}</h3>
                                <p className="text-sm text-slate-300">$29.00 / month • Renews on Dec 24, 2024</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 rounded-lg border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors">Downgrade</button>
                                <button className="px-4 py-2 rounded-lg bg-white text-black text-sm font-bold hover:bg-slate-200 transition-colors">Upgrade Plan</button>
                            </div>
                        </div>
                        
                        {/* Usage Meters */}
                        <div className="grid grid-cols-2 gap-8 mt-8">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">AI Generations</span>
                                    <span className="text-white font-mono">1,240 / 5,000</span>
                                </div>
                                <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-[24%] rounded-full"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Storage Used</span>
                                    <span className="text-white font-mono">2.4GB / 10GB</span>
                                </div>
                                <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 w-[24%] rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white">Payment Method</h3>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-8 bg-white rounded flex items-center justify-center">
                                    <span className="font-bold text-blue-800 italic">VISA</span>
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">Visa ending in 4242</div>
                                    <div className="text-xs text-slate-500">Expires 12/28</div>
                                </div>
                            </div>
                            <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300">Update</button>
                        </div>
                    </div>

                    {/* Invoice History */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white">Invoice History</h3>
                        <div className="border border-white/5 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 text-slate-400">
                                    <tr>
                                        <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Date</th>
                                        <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Amount</th>
                                        <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-right">Invoice</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {[
                                        { date: 'Nov 24, 2024', amount: '$29.00', status: 'Paid' },
                                        { date: 'Oct 24, 2024', amount: '$29.00', status: 'Paid' },
                                        { date: 'Sep 24, 2024', amount: '$29.00', status: 'Paid' },
                                    ].map((inv, i) => (
                                        <tr key={i} className="hover:bg-white/[0.02]">
                                            <td className="px-4 py-3 text-slate-300">{inv.date}</td>
                                            <td className="px-4 py-3 text-white font-mono">{inv.amount}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/20">
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button className="text-slate-500 hover:text-white transition-colors">
                                                    <span className="material-icons text-sm">download</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SYNC TAB --- */}
            {activeSettingsTab === 'sync' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <header>
                        <h2 className="text-2xl font-bold mb-2 text-white">Synchronization</h2>
                        <p className="text-slate-400 text-sm">Control how your project state is saved and synced.</p>
                    </header>

                    <div className="space-y-6 max-w-2xl">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                            <div>
                                <h3 className="text-white font-bold text-sm">Auto-Save</h3>
                                <p className="text-slate-400 text-xs mt-1">Automatically save changes to local storage.</p>
                            </div>
                            <Toggle checked={appSettings.autoSave} onChange={(v) => updateAppSettings({ autoSave: v })} />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                             <div>
                                <h3 className="text-white font-bold text-sm">Offline Mode</h3>
                                <p className="text-slate-400 text-xs mt-1">Disable all network requests and AI features.</p>
                            </div>
                            <Toggle checked={appSettings.offlineMode} onChange={(v) => updateAppSettings({ offlineMode: v })} />
                        </div>

                        <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4">
                            <div className="flex justify-between">
                                <h3 className="text-white font-bold text-sm">Sync Interval</h3>
                                <span className="text-xs font-mono text-slate-400">{appSettings.syncInterval}s</span>
                            </div>
                            <input 
                                type="range" 
                                min="5" max="300" step="5"
                                value={appSettings.syncInterval}
                                onChange={(e) => updateAppSettings({ syncInterval: Number(e.target.value) })}
                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                            />
                            <p className="text-[10px] text-slate-500">Frequency of background synchronization with cloud services.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ADVANCED TAB --- */}
            {activeSettingsTab === 'advanced' && (
                 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <header>
                        <h2 className="text-2xl font-bold mb-2 text-white">Advanced Settings</h2>
                        <p className="text-slate-400 text-sm">Developer tools and performance configurations.</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                            <div>
                                <h3 className="text-white font-bold text-sm">Debug Mode</h3>
                                <p className="text-slate-400 text-xs mt-1">Show verbose logs in console.</p>
                            </div>
                            <Toggle checked={appSettings.debugMode} onChange={(v) => updateAppSettings({ debugMode: v })} />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                            <div>
                                <h3 className="text-white font-bold text-sm">Show FPS Overlay</h3>
                                <p className="text-slate-400 text-xs mt-1">Monitor render performance.</p>
                            </div>
                            <Toggle checked={appSettings.showFps} onChange={(v) => updateAppSettings({ showFps: v })} />
                        </div>

                         <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                            <div>
                                <h3 className="text-white font-bold text-sm">Reduce Motion</h3>
                                <p className="text-slate-400 text-xs mt-1">Disable complex animations.</p>
                            </div>
                            <Toggle checked={appSettings.reduceMotion} onChange={(v) => updateAppSettings({ reduceMotion: v })} />
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/10">
                        <h3 className="text-sm font-bold text-white mb-4">Danger Zone</h3>
                        <div className="flex gap-4">
                            <button 
                                className="px-4 py-2 border border-red-500/30 text-red-400 rounded-lg text-sm hover:bg-red-500/10 transition-colors"
                                onClick={() => { if(confirm('Clear all local storage?')) localStorage.clear(); }}
                            >
                                Clear Local Cache
                            </button>
                             <button 
                                className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20 transition-colors"
                                onClick={() => window.location.reload()}
                            >
                                Force Reload
                            </button>
                        </div>
                    </div>
                 </div>
            )}

          </main>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="material-icons text-sm">info</span>
            Changes are applied immediately.
          </div>
          <div className="flex items-center gap-3">
            <button 
                onClick={toggleSettingsModal}
                className="px-6 py-2.5 rounded-lg text-slate-400 font-medium hover:bg-white/5 hover:text-white transition-colors"
            >
              Close
            </button>
            <button 
                onClick={toggleSettingsModal}
                className="px-8 py-2.5 rounded-lg bg-white text-black font-bold shadow-lg shadow-white/10 hover:bg-slate-200 transition-all hover:translate-y-[-1px]"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
