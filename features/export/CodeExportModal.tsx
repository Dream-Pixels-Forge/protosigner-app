
import React, { useEffect, useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import { CodeGenerator, FileMap } from '../../services/CodeGenerator';
import { AfterEffectsGenerator } from '../../services/AfterEffectsGenerator';
import JSZip from 'jszip';

export const CodeExportModal: React.FC = () => {
  const { isExportModalOpen, toggleExportModal, elements, projectSettings, projectName } = useEditor();
  const [files, setFiles] = useState<FileMap>({});
  const [activeFile, setActiveFile] = useState<string>('src/App.tsx');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [exportMode, setExportMode] = useState<'code' | 'ae'>('code');
  const [aeScript, setAeScript] = useState('');

  useEffect(() => {
    if (isExportModalOpen) {
      // React Export
      const generated = CodeGenerator.generateProject(elements, projectSettings);
      setFiles(generated);
      if (generated['src/App.tsx']) setActiveFile('src/App.tsx');
      
      // AE Export
      const script = AfterEffectsGenerator.generateScript(elements, projectSettings);
      setAeScript(script);
    }
  }, [isExportModalOpen, elements, projectSettings]);

  const handleCopy = () => {
    const textToCopy = exportMode === 'code' ? files[activeFile] : aeScript;
    if (textToCopy) {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    setIsZipping(true);
    try {
        if (exportMode === 'code') {
            const zip = new JSZip();
            Object.entries(files).forEach(([filePath, content]) => {
                zip.file(filePath, content);
            });
            const blob = await zip.generateAsync({ type: 'blob' });
            triggerDownload(blob, 'project.zip');
        } else {
            const blob = new Blob([aeScript], { type: 'text/javascript' });
            triggerDownload(blob, 'protosigner_hud_import.jsx');
        }
    } catch (e) {
        console.error("Export failed", e);
        alert("Failed to export.");
    } finally {
        setIsZipping(false);
    }
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const safeName = (projectName || 'protosigner').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const finalName = filename === 'project.zip' ? `${safeName}.zip` : `${safeName}_ae.jsx`;
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper to render file tree
  const renderTree = () => {
    const fileList = Object.keys(files).sort();
    return fileList.map(fileName => (
        <div 
            key={fileName}
            onClick={() => setActiveFile(fileName)}
            className={`
                px-3 py-1.5 text-xs font-mono cursor-pointer flex items-center gap-2 truncate
                ${activeFile === fileName ? 'bg-blue-500/20 text-blue-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'}
            `}
        >
            <span className="material-icons text-[14px]">
                {fileName.endsWith('.json') ? 'data_object' : 
                 fileName.endsWith('.tsx') ? 'code' : 
                 fileName.endsWith('.css') ? 'style' : 'description'}
            </span>
            {fileName}
        </div>
    ));
  };

  if (!isExportModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={toggleExportModal}></div>
      <div className="relative z-10 w-full max-w-5xl bg-[#1e1e1e] border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[700px] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-[#252526]">
          <div className="flex items-center gap-3">
             <div className={`p-1.5 rounded ${exportMode === 'code' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                <span className="material-icons text-lg">{exportMode === 'code' ? 'folder_zip' : 'movie_filter'}</span>
             </div>
             <div>
                <h2 className="text-white font-bold text-sm">Export Project</h2>
                <p className="text-xs text-slate-400">{exportMode === 'code' ? 'React + Vite + Tailwind' : 'Adobe After Effects Script (.jsx)'}</p>
             </div>
          </div>
          
          <div className="flex bg-black/40 p-1 rounded-lg border border-white/5 mx-auto">
             <button
                onClick={() => setExportMode('code')}
                className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-2 transition-all ${exportMode === 'code' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
             >
                 <span className="material-icons text-sm">code</span> React
             </button>
             <button
                onClick={() => setExportMode('ae')}
                className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-2 transition-all ${exportMode === 'ae' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
             >
                 <span className="material-icons text-sm">movie</span> After Effects
             </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
                onClick={handleCopy}
                className={`text-xs px-3 py-1.5 rounded flex items-center gap-2 transition-colors ${copied ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
            >
                <span className="material-icons text-sm">{copied ? 'check' : 'content_copy'}</span>
                {copied ? 'Copied' : 'Copy'}
            </button>
            <button onClick={toggleExportModal} className="text-slate-400 hover:text-white p-1">
                <span className="material-icons">close</span>
            </button>
          </div>
        </div>

        {/* Editor Layout */}
        <div className="flex flex-1 overflow-hidden">
            {exportMode === 'code' && (
                <div className="w-64 bg-[#181818] border-r border-slate-700 overflow-y-auto py-2">
                    <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Explorer</div>
                    {renderTree()}
                </div>
            )}

            {/* Code View */}
            <div className="flex-1 overflow-auto bg-[#1e1e1e] flex flex-col">
                <div className="sticky top-0 bg-[#1e1e1e] border-b border-white/5 px-4 py-2 text-xs text-slate-500 flex justify-between">
                    <span>{exportMode === 'code' ? activeFile : 'Adobe ExtendScript'}</span>
                    <span>{(exportMode === 'code' ? files[activeFile] : aeScript)?.length || 0} chars</span>
                </div>
                <div className="p-4">
                    <pre className="font-mono text-sm text-slate-300 leading-relaxed">
                        <code>{exportMode === 'code' ? files[activeFile] : aeScript}</code>
                    </pre>
                </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 border-t border-slate-700 bg-[#252526] flex justify-end gap-3">
             <button className="text-xs text-slate-400 hover:text-white transition-colors" onClick={toggleExportModal}>Cancel</button>
             <button 
                onClick={handleDownload}
                disabled={isZipping}
                className={`
                    ${exportMode === 'code' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20' : 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20'}
                    text-white px-4 py-1.5 rounded text-xs font-bold shadow-lg flex items-center gap-2 transition-all 
                    ${isZipping ? 'opacity-70 cursor-wait' : ''}
                `}
            >
                {isZipping ? (
                    <span className="material-icons text-sm animate-spin">sync</span>
                ) : (
                    <span className="material-icons text-sm">download</span>
                )}
                {isZipping ? 'Processing...' : exportMode === 'code' ? 'Download React ZIP' : 'Download .JSX Script'}
             </button>
        </div>
      </div>
    </div>
  );
};
