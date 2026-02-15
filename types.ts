
import React from 'react';

export interface AnimationSettings {
  type: 'none' | 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'zoomIn' | 'zoomOut' | 'bounce' | 'pulse' | 'spin';
  duration: number; // seconds
  delay: number; // seconds
  infinite: boolean;
  ease: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface UIElement {
  id: string;
  type: 'page' | 'section' | 'container' | 'text' | 'button' | 'grid' | 'rectangle' | 'circle' | 'box' | 'frame' | 'image';
  name: string;
  props: Record<string, any> & { animation?: AnimationSettings };
  style?: React.CSSProperties & {
    left?: number | string;
    top?: number | string;
    width?: number | string;
    height?: number | string;
    position?: 'absolute' | 'relative' | 'fixed' | 'sticky';
  };
  children?: UIElement[];
  isExpanded?: boolean;
  isLocked?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
}

export type AIProvider = 'Google' | 'OpenRouter' | 'Ollama';
export type SettingsTab = 'models' | 'connections' | 'sync' | 'advanced' | 'billing';

// New Expert Types
export type ExpertMode = 'landing' | 'full-stack' | 'hud' | 'dashboard' | 'os' | 'mobile' | 'grid-master';
export type EnvironmentMode = 'cloud' | 'local';
export type ComponentLibrary = 'html-tailwind' | 'shadcn' | 'radix' | 'chakra' | 'mui' | 'custom';

export interface SubAgent {
  id: ExpertMode;
  name: string;
  role: string;
  icon: string;
  description: string;
  defaultSkills: string[];
  styleGuide: string;
}

// Recursive partial type for skill structures (allows nested elements without ids)
export type SkillElement = Partial<Omit<UIElement, 'children'>> & {
  children?: SkillElement[];
};

export interface Skill {
  id: string;
  name: string;
  icon: string;
  description: string;
  instruction: string;
  structure: SkillElement;
}

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  status: 'connected' | 'disconnected';
  latency: string;
  tags: string[];
  recommended?: boolean;
  contextWindow?: string;
}

export interface BorderSettings {
    show: boolean;
    width: number;
    color: string;
    style: 'solid' | 'dashed' | 'dotted';
}

export interface GuideSettings {
    showFold: boolean;
    foldPosition: number; // px from top
    showSafeZone: boolean;
    safeZoneWidth: number; // px centered
    showColumnGrid: boolean;
    columns: number;
    gap: number;
    margin: number;
    color: string;
}

export interface ProjectSettings {
  darkMode: boolean;
  animateEntrance: boolean;
  fontFamily: string;
  pageSize: { width: number; height: number };
  viewportSize: { width: number; height: number };
  pageBorder: BorderSettings;
  viewportBorder: BorderSettings;
  guides: GuideSettings; // New Design Guides
  padding: { x: number; y: number };
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  componentLibrary: ComponentLibrary;
  enableGridMaster: boolean;
  autoSkillMode: boolean;
  // Local model optimization
  localHardwareLevel?: string;
}

export interface MCPServer {
  id: string;
  name: string;
  url: string;
  status: 'connected' | 'disconnected' | 'error';
}

export interface AppSettings {
  autoSave: boolean;
  syncInterval: number; // seconds
  offlineMode: boolean;
  debugMode: boolean;
  showFps: boolean;
  reduceMotion: boolean;
  mcpServers: MCPServer[];
}

export type MCPStatus = 'disconnected' | 'connecting' | 'connected' | 'syncing' | 'error';
export type ToolType = 'select' | 'hand';

export interface HistoryEntry {
  id: string;
  action: string;
  timestamp: number;
}

export interface EditorContextType {
  projectName: string;
  setProjectName: (name: string) => void;

  elements: UIElement[];
  
  // Selection
  selectedId: string | null; // Primary selection
  selectedIds: string[]; // Multi-selection
  selectElement: (id: string | null, multi?: boolean) => void;
  
  // Element Actions
  updateElementProps: (id: string, props: Partial<Record<string, any>>) => void;
  updateElementStyle: (id: string, style: Partial<NonNullable<UIElement['style']>>) => void;
  renameElement: (id: string, newName: string) => void;
  toggleElementLock: (id: string) => void;
  toggleElementExpand: (id: string) => void;
  toggleVisibility: (id: string) => void;
  addElement: (type: UIElement['type'], overrides?: Partial<Omit<UIElement, 'id'>>) => void;
  deleteElement: (id: string) => void;
  duplicateSelection: () => void;
  moveSelection: (dx: number, dy: number) => void;
  reorderElement: (dragId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
  newProject: () => void;
  
  // Settings
  projectSettings: ProjectSettings;
  updateProjectSettings: (settings: Partial<ProjectSettings>) => void;
  appSettings: AppSettings;
  updateAppSettings: (settings: Partial<AppSettings>) => void;

  // Modals
  isSettingsModalOpen: boolean;
  toggleSettingsModal: () => void;
  activeSettingsTab: SettingsTab;
  setActiveSettingsTab: (tab: SettingsTab) => void;

  isShortcutsModalOpen: boolean;
  toggleShortcutsModal: () => void;
  isHistoryModalOpen: boolean;
  toggleHistoryModal: () => void;
  
  // History
  history: HistoryEntry[];
  future: HistoryEntry[];
  restoreHistory: (index: number) => void;
  jumpToFuture: (index: number) => void;
  clearHistory: () => void;

  // User Profile
  user: UserProfile;
  updateUser: (profile: Partial<UserProfile>) => void;

  // PromptBar State
  isPromptBarVisible: boolean;
  togglePromptBar: () => void;
  showPromptBar: () => void;
  hidePromptBar: () => void;

  // AI & MCP
  activeModelId: string;
  setActiveModelId: (id: string) => void;
  activeModelProvider: AIProvider;
  setActiveModelProvider: (provider: AIProvider) => void;
  
  // Expert Mode
  expertMode: ExpertMode;
  setExpertMode: (mode: ExpertMode) => void;
  
  // Environment Mode
  environmentMode: EnvironmentMode;
  setEnvironmentMode: (mode: EnvironmentMode) => void;

  // Security Update: Keys are Read-Only from Env
  googleApiKey: string;
  openRouterApiKey: string;
  
  ollamaServerUrl: string;
  setOllamaServerUrl: (url: string) => void;

  isGenerating: boolean;
  generateContent: (prompt: string, targetId?: string, imageContext?: string, templateStructure?: any, createNewPage?: boolean) => Promise<void>;
  generateStyles: (prompt: string, targetId?: string, imageContext?: string) => Promise<void>;
  refineSelectionLayout: () => Promise<void>;
  mcpStatus: MCPStatus;
  
  // Canvas Tools
  zoom: number;
  setZoom: (scale: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToView: () => void;
  fitToPage: () => void;
  fitToViewport: () => void;
  fitToSelection: () => void;
  
  pan: { x: number; y: number };
  setPan: (pan: { x: number; y: number }) => void;
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;

  // Export
  isExportModalOpen: boolean;
  toggleExportModal: () => void;

  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}
