
import React, { useState } from 'react';
import { EditorProvider, useEditor } from './context/EditorContext';
import { ConsoleLogProvider, useConsoleLog } from './context/ConsoleLogContext';
import { AuthProvider } from './context/AuthContext';
import { AppWrapper } from './context/AppWrapper';
import { Header } from './features/layout/Header';
import { LayersPanel } from './features/layers/LayersPanel';
import { PropertiesPanel } from './features/properties/PropertiesPanel';
import { Canvas } from './features/canvas/Canvas';
import { SettingsModal } from './features/settings/SettingsModal';
import { CodeExportModal } from './features/export/CodeExportModal';
import { ShortcutsModal } from './features/help/ShortcutsModal';
import { HistoryModal } from './features/history/HistoryModal';
import { SplashScreen } from './features/layout/SplashScreen';

// Separated Footer to consume Context
const Footer: React.FC = () => {
    const { 
        zoom, zoomIn, zoomOut, setZoom, 
        projectSettings, updateProjectSettings, 
        pan, 
        toggleSettingsModal,
        toggleShortcutsModal
    } = useEditor();
    
    const { getRecentLogs, logs, clearLogs } = useConsoleLog();
    const [showLogPanel, setShowLogPanel] = useState(false);
    const recentLog = getRecentLogs(1)[0];
    
    return (
        <footer className="h-8 bg-panel-dark border-t border-white/5 px-4 flex items-center justify-between text-[10px] text-slate-500 shrink-0 z-40 relative bg-black">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 min-w-[100px]">
                    <span className="material-icons text-xs">gps_fixed</span>
                    <span>X: {Math.round(pan.x)} Y: {Math.round(pan.y)}</span>
                </div>
                
                {/* Zoom Controls */}
                <div className="flex items-center gap-2 bg-white/5 rounded px-2 py-0.5 border border-white/5">
                    <button onClick={zoomOut} className="hover:text-white transition-colors flex items-center"><span className="material-icons text-[12px]">remove</span></button>
                    <span 
                        className="cursor-pointer min-w-[30px] text-center font-mono hover:text-white"
                        onClick={() => setZoom(1.0)} 
                        title="Reset Zoom"
                    >
                        {Math.round(zoom * 100)}%
                    </span>
                    <button onClick={zoomIn} className="hover:text-white transition-colors flex items-center"><span className="material-icons text-[12px]">add</span></button>
                </div>
                
                {/* Grid Controls */}
                <div className="flex items-center gap-3 border-l border-white/10 pl-3">
                    <button 
                        onClick={() => updateProjectSettings({ showGrid: !projectSettings.showGrid })}
                        className={`flex items-center gap-1 transition-colors ${projectSettings.showGrid ? 'text-white' : 'text-slate-600'}`}
                        title="Toggle Grid"
                    >
                        <span className="material-icons text-[12px]">{projectSettings.showGrid ? 'grid_on' : 'grid_off'}</span>
                    </button>
                    
                    <button 
                        onClick={() => updateProjectSettings({ snapToGrid: !projectSettings.snapToGrid })}
                        className={`flex items-center gap-1 transition-colors ${projectSettings.snapToGrid ? 'text-white' : 'text-slate-600'}`}
                        title="Toggle Snap"
                    >
                        <span className="material-icons text-[12px]">magnet_alt</span>
                        <span>Snap</span>
                    </button>
                    
                    <button 
                        onClick={() => updateProjectSettings({ 
                            viewportBorder: { ...projectSettings.viewportBorder, show: !projectSettings.viewportBorder.show } 
                        })}
                        className={`flex items-center gap-1 transition-colors ${projectSettings.viewportBorder.show ? 'text-white' : 'text-slate-600'}`}
                        title="Toggle Viewport Overlay"
                    >
                        <span className="material-icons text-[12px]">view_quilt</span>
                        <span>Viewport</span>
                    </button>
                    
                    <select 
                        className="bg-transparent border-none text-[10px] text-slate-400 focus:text-white outline-none cursor-pointer py-0 pl-1"
                        value={projectSettings.gridSize}
                        onChange={(e) => updateProjectSettings({ gridSize: Number(e.target.value) })}
                        aria-label="Grid size"
                    >
                        <option value="8" className="bg-black">8px</option>
                        <option value="10" className="bg-black">10px</option>
                        <option value="16" className="bg-black">16px</option>
                        <option value="20" className="bg-black">20px</option>
                    </select>
                </div>
            </div>
            
            {/* Console Logs Display */}
            <div className="flex-1 mx-4 min-w-0">
                <div 
                    className="flex items-center gap-2 bg-black/30 rounded px-3 py-1 border border-white/5 cursor-pointer hover:bg-black/50 transition-colors"
                    onClick={() => setShowLogPanel(!showLogPanel)}
                    title="Click to toggle log panel"
                >
                    <span className="material-icons text-[10px] text-slate-400">terminal</span>
                    {recentLog ? (
                        <span className={`truncate font-mono text-[10px] ${
                            recentLog.level === 'error' ? 'text-red-400' :
                            recentLog.level === 'warn' ? 'text-yellow-400' :
                            recentLog.level === 'info' ? 'text-blue-400' :
                            'text-slate-400'
                        }`}>
                            {recentLog.source && `[${recentLog.source}] `}
                            {recentLog.message}
                        </span>
                    ) : (
                        <span className="text-slate-600 text-[10px]">No recent logs</span>
                    )}
                    {logs.length > 0 && (
                        <span className="text-[9px] text-slate-600 ml-1">({logs.length})</span>
                    )}
                </div>
                
                {/* Expandable Log Panel */}
                {showLogPanel && (
                    <div className="absolute bottom-8 right-4 left-4 bg-black/95 border border-white/10 rounded-lg shadow-2xl max-h-48 overflow-y-auto z-50">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/5">
                            <span className="text-[10px] font-bold text-white">Console Logs</span>
                            <button 
                                onClick={(e) => { e.stopPropagation(); clearLogs(); }}
                                className="text-[10px] text-red-400 hover:text-red-300"
                            >
                                Clear
                            </button>
                        </div>
                        <div className="p-2 space-y-1">
                            {logs.length === 0 ? (
                                <span className="text-[10px] text-slate-600 italic">No logs</span>
                            ) : (
                                logs.slice(0, 20).map((log) => (
                                    <div key={log.id} className="text-[9px] font-mono flex items-start gap-2">
                                        <span className="text-slate-600 whitespace-nowrap">
                                            {log.timestamp.toLocaleTimeString()}
                                        </span>
                                        <span className={`${
                                            log.level === 'error' ? 'text-red-400' :
                                            log.level === 'warn' ? 'text-yellow-400' :
                                            log.level === 'info' ? 'text-blue-400' :
                                            'text-slate-300'
                                        }`}>
                                            {log.source && `[${log.source}] `}
                                            {log.message}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={toggleShortcutsModal}
                    className="hover:text-white cursor-pointer transition-colors flex items-center gap-1"
                >
                    <span className="material-icons text-[10px]">keyboard</span>
                    Documentation
                </button>
                <button 
                    onClick={toggleSettingsModal}
                    className="hover:text-white cursor-pointer transition-colors"
                >
                    API Keys
                </button>
                <div className="flex items-center gap-1 text-slate-300">
                    <span className="material-icons text-xs">terminal</span>
                    <span className="font-bold">CLI v2.4.1</span>
                </div>
            </div>
        </footer>
    );
}

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <SplashScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <AuthProvider>
      <AppWrapper>
        <EditorProvider>
          <ConsoleLogProvider>
            <div className="h-full flex flex-col overflow-hidden bg-background-light dark:bg-canvas-dark animate-in fade-in duration-500">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <LayersPanel />
                <Canvas />
                <PropertiesPanel />
              </div>
              <Footer />
              <SettingsModal />
              <CodeExportModal />
              <ShortcutsModal />
              <HistoryModal />
            </div>
          </ConsoleLogProvider>
        </EditorProvider>
      </AppWrapper>
    </AuthProvider>
  );
};

export default App;
