
import { SKILL_REGISTRY } from './skills';

export interface LocalModelConfig {
  maxTokens: number;
  temperature: number;
  topP: number;
  repeatPenalty: number;
  numCtx: number;
}

// Optimized configurations for different hardware levels
// INCREASED maxTokens to allow full template generation
export const LOCAL_MODEL_CONFIGS: Record<string, LocalModelConfig> = {
  // 1B models on 4GB RAM - Increased tokens for templates
  'ultra-light': {
    maxTokens: 4096,  // Increased from 2048 - need more for full templates
    temperature: 0.3,
    topP: 0.8,
    repeatPenalty: 1.1,
    numCtx: 4096  // Increased context
  },
  // 1.5B-2B models on 6GB RAM
  'light': {
    maxTokens: 5120,  // Increased from 2560 - need more for full templates
    temperature: 0.4,
    topP: 0.85,
    repeatPenalty: 1.15,
    numCtx: 4096
  },
  // 3B-4B models on 8GB RAM
  'balanced': {
    maxTokens: 6144,  // Increased from 3072 - need more for full templates
    temperature: 0.5,
    topP: 0.9,
    repeatPenalty: 1.2,
    numCtx: 8192
  },
  // 7B+ models on 12GB+ RAM
  'quality': {
    maxTokens: 8192,  // Increased from 4096 - can handle large outputs
    temperature: 0.6,
    topP: 0.95,
    repeatPenalty: 1.3,
    numCtx: 8192
  }
};

// Alias for backward compatibility
export const LOCAL_MODEL_OPTIMIZATIONS = LOCAL_MODEL_CONFIGS;

// Short prompt prefix to minimize token count
const SHORT_PREFIX = `You are a UI designer. Output ONLY valid JSON array. No text before or after.`;

// Minimal schema reminder
const MINIMAL_SCHEMA = `{type,name,props,style,children}`;

// Compact output format instruction
const COMPACT_FORMAT = `Output valid JSON array. No comments. No explanations.`;

// Get template cache for instant retrieval
const getTemplateCache = (): Record<string, any> => {
  const cache: Record<string, any> = {};
  SKILL_REGISTRY.forEach(skill => {
    cache[skill.id] = skill.structure;
  });
  return cache;
};

// Get local optimizations by hardware level
export const getLocalOptimizations = (
  hardwareLevel: string = 'ultra-light'
): { shortPrefix: string; minimalSchema: string; compactFormat: string; templateCache: Record<string, any>; config: LocalModelConfig; hardwareLevel: string } => {
  const config = LOCAL_MODEL_CONFIGS[hardwareLevel] || LOCAL_MODEL_CONFIGS['ultra-light'];
  
  return {
    shortPrefix: SHORT_PREFIX,
    minimalSchema: MINIMAL_SCHEMA,
    compactFormat: COMPACT_FORMAT,
    templateCache: getTemplateCache(),
    config,
    hardwareLevel
  };
};

// Direct template retrieval (no API call needed)
export const getTemplateStructure = (skillId: string): any => {
  const cache = getTemplateCache();
  return cache[skillId] || null;
};

// Generate ultra-minimal prompt for local models
export const generateMinimalPrompt = (
  request: string,
  skillId?: string | null,
  _hardwareLevel: string = 'light'
): string => {
  // More explicit JSON requirement
  let prompt = `You are a UI designer. Output ONLY valid JSON array. No explanations.\n`;
  prompt += `Output format: [{type,name,props,style,children}]\n`;
  prompt += `IMPORTANT: Use camelCase for ALL CSS properties (backgroundColor, justifyContent, flexDirection, etc). Never use kebab-case.\n`;
  prompt += `CRITICAL: Always close all brackets and braces. Incomplete JSON will be rejected.\n`;
  prompt += `Keep output concise - use minimal whitespace.\n`;
  prompt += `IMPORTANT: Output ONLY JSON. No text before or after.\n\n`;
  
  // Add template if specified
  if (skillId) {
    const template = getTemplateStructure(skillId);
    if (template) {
      // For bento-grid, add extra instructions about grid layout
      const extraInstructions = skillId === 'bento-grid' 
        ? `\nCRITICAL for bento-grid: Use display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', and gap:24 on the section container.`
        : '';
      
      prompt += `TEMPLATE (modify content only):\n${JSON.stringify(template, null, 0)}\n${extraInstructions}\n`;
    }
  }
  
  prompt += `USER REQUEST: ${request}\n`;
  prompt += `Respond with ONLY valid JSON array. Example: [{"type":"container","name":"Hero",...}]\n`;
  
  return prompt;
};

// Determine hardware level based on available info
export const detectHardwareLevel = (
  _modelSize?: string,
  availableRam?: number
): string => {
  // If RAM is specified
  if (availableRam) {
    if (availableRam <= 4) return 'ultra-light';
    if (availableRam <= 6) return 'light';
    if (availableRam <= 8) return 'balanced';
    return 'quality';
  }

  // Default to ultra-light for unknown hardware
  return 'ultra-light';
};
