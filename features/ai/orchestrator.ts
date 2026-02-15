
import { ExpertMode, ProjectSettings } from '../../types';
import { AGENT_REGISTRY } from './agents';
import { SKILL_REGISTRY } from './skills';

// ============================================================
// ORCHESTRATOR - Master Controller for AI Generation
// ============================================================
// Handles: Agents, Skills, Sections, Theme, Local/Cloud Modes
// ============================================================

export interface OrchestratorConfig {
    expertMode: ExpertMode;
    projectSettings: ProjectSettings;
    isLocal: boolean;
    targetDimensions: { width: number; height: number };
    requiredSkillId?: string | null;
    layoutAdvice?: string;
    hardwareLevel?: string;
}

export interface SectionPrompt {
    name: string;
    instruction: string;
    agentId: string;
    agentName: string;
    isBackground?: boolean; // If true, this sets page background
}

interface AgentTheme {
    primary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    accent: string;
    border: string;
    font: string;
    radius: { small: number; medium: number; large: number };
}

// ============================================================
// AGENT THEMES - Consistent design per agent
// ============================================================
const AGENT_THEMES: Record<string, AgentTheme> = {
    'landing': {
        primary: '#3b82f6',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f8fafc',
        textSecondary: '#94a3b8',
        accent: '#8b5cf6',
        border: 'rgba(255,255,255,0.1)',
        font: 'Inter, system-ui, sans-serif',
        radius: { small: 8, medium: 12, large: 24 }
    },
    'full-stack': {
        primary: '#2563eb',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#0f172a',
        textSecondary: '#64748b',
        accent: '#0ea5e9',
        border: 'rgba(0,0,0,0.1)',
        font: 'Inter, system-ui, sans-serif',
        radius: { small: 6, medium: 8, large: 16 }
    },
    'hud': {
        primary: '#06b6d4',
        background: '#050505',
        surface: '#0a0a0a',
        text: '#00ff88',
        textSecondary: '#06b6d4',
        accent: '#f59e0b',
        border: 'rgba(6,182,212,0.3)',
        font: 'JetBrains Mono, monospace',
        radius: { small: 0, medium: 0, large: 0 }
    },
    'dashboard': {
        primary: '#10b981',
        background: '#f1f5f9',
        surface: '#ffffff',
        text: '#1e293b',
        textSecondary: '#64748b',
        accent: '#f59e0b',
        border: 'rgba(0,0,0,0.05)',
        font: 'Inter, system-ui, sans-serif',
        radius: { small: 6, medium: 8, large: 12 }
    },
    'os': {
        primary: '#6366f1',
        background: '#1e1e2e',
        surface: '#2d2d3d',
        text: '#cdd6f4',
        textSecondary: '#a6adc8',
        accent: '#cba6f7',
        border: 'rgba(255,255,255,0.1)',
        font: 'system-ui, sans-serif',
        radius: { small: 8, medium: 12, large: 16 }
    },
    'mobile': {
        primary: '#007aff',
        background: '#ffffff',
        surface: '#f2f2f7',
        text: '#000000',
        textSecondary: '#8e8e93',
        accent: '#34c759',
        border: 'rgba(0,0,0,0.1)',
        font: '-apple-system, BlinkMacSystemFont, sans-serif',
        radius: { small: 8, medium: 12, large: 20 }
    }
};

export class Orchestrator {
    
    // ============================================================
    // MAIN METHOD: Get section prompts for generation
    // ============================================================
    static getSectionPrompts(config: OrchestratorConfig): SectionPrompt[] {
        const { expertMode, projectSettings, isLocal, targetDimensions, requiredSkillId, layoutAdvice } = config;
        
        // Get agent
        const agent = AGENT_REGISTRY.find(a => a.id === expertMode) || AGENT_REGISTRY[0];
        const theme = AGENT_THEMES[expertMode] || AGENT_THEMES['landing'];
        
        console.log(`[Orchestrator] Agent: ${agent.name}, Skill: ${requiredSkillId || 'none'}, Local: ${isLocal}`);
        
        // If skill is selected, generate skill-specific sections
        if (requiredSkillId && requiredSkillId !== 'null') {
            return this.getSkillSections(agent.id, agent.name, theme, requiredSkillId, targetDimensions, isLocal);
        }
        
        // Default: generate standard landing page sections
        return this.getStandardSections(agent.id, agent.name, theme, targetDimensions, layoutAdvice, isLocal);
    }
    
    // ============================================================
    // SKILL-BASED SECTIONS
    // ============================================================
    private static getSkillSections(
        agentId: string,
        agentName: string,
        theme: AgentTheme,
        skillId: string,
        dimensions: { width: number; height: number },
        isLocal: boolean
    ): SectionPrompt[] {
        
        const { width, height } = dimensions;
        
        switch (skillId) {
            case 'hero-split':
                return [
                    { name: 'Page Background', instruction: this.buildPageBackgroundPrompt(agentName, theme, width, height, isLocal), agentId, agentName, isBackground: true },
                    { name: 'Hero Split', instruction: this.buildHeroSplitPrompt(agentName, theme, width, height, isLocal), agentId, agentName }
                ];
                
            case 'bento-grid':
                return [
                    { name: 'Page Background', instruction: this.buildPageBackgroundPrompt(agentName, theme, width, height, isLocal), agentId, agentName, isBackground: true },
                    { name: 'Bento Grid', instruction: this.buildBentoGridPrompt(agentName, theme, width, isLocal), agentId, agentName }
                ];
                
            case 'saas-pricing':
                return [
                    { name: 'Page Background', instruction: this.buildPageBackgroundPrompt(agentName, theme, width, height, isLocal), agentId, agentName, isBackground: true },
                    { name: 'Pricing', instruction: this.buildPricingPrompt(agentName, theme, width, isLocal), agentId, agentName }
                ];
                
            case 'center-splash':
                return [
                    { name: 'Page Background', instruction: this.buildPageBackgroundPrompt(agentName, theme, width, height, isLocal), agentId, agentName, isBackground: true },
                    { name: 'Hero Center', instruction: this.buildCenterSplashPrompt(agentName, theme, width, height, isLocal), agentId, agentName }
                ];
                
            case 'modular-grid':
                return [
                    { name: 'Page Background', instruction: this.buildPageBackgroundPrompt(agentName, theme, width, height, isLocal), agentId, agentName, isBackground: true },
                    { name: 'Modular Grid', instruction: this.buildModularGridPrompt(agentName, theme, width, isLocal), agentId, agentName }
                ];
                
            default:
                return this.getStandardSections(agentId, agentName, theme, dimensions, undefined, isLocal);
        }
    }
    
    // ============================================================
    // STANDARD SECTIONS (No skill selected)
    // ============================================================
    private static getStandardSections(
        agentId: string,
        agentName: string,
        theme: AgentTheme,
        dimensions: { width: number; height: number },
        layoutAdvice: string | undefined,
        isLocal: boolean
    ): SectionPrompt[] {
        const { width, height } = dimensions;
        
        return [
            { name: 'Page Background', instruction: this.buildPageBackgroundPrompt(agentName, theme, width, height, isLocal), agentId, agentName, isBackground: true },
            { name: 'Header/Nav', instruction: this.buildHeaderPrompt(agentName, theme, width, isLocal), agentId, agentName },
            { name: 'Hero Section', instruction: this.buildHeroPrompt(agentName, theme, width, height, isLocal), agentId, agentName },
            { name: 'Features', instruction: this.buildFeaturesPrompt(agentName, theme, width, isLocal), agentId, agentName },
            { name: 'Content', instruction: this.buildContentPrompt(agentName, theme, width, isLocal), agentId, agentName },
            { name: 'CTA/Footer', instruction: this.buildFooterPrompt(agentName, theme, width, isLocal), agentId, agentName }
        ];
    }
    
    // ============================================================
    // SECTION BUILDERS
    // ============================================================
    
    private static buildPageBackgroundPrompt(agentName: string, theme: AgentTheme, width: number, height: number, isLocal: boolean): string {
        const t = theme;
        return `You are ${agentName}.
OUTPUT: ONLY valid JSON object (not array). No text before or after.

THEME (MUST USE):
- Background: ${t.background}
- Surface: ${t.surface}

CONTEXT: Generate page background for ${width}x${height}px.
Return a JSON object with page background settings:
{
  "backgroundColor": "${t.background}",
  "color": "${t.text}",
  "minHeight": ${height}
}

RULES:
- Use camelCase CSS
- Numbers only (no "px")
- Valid JSON object only
`;
    }
    
    private static buildHeaderPrompt(agentName: string, theme: AgentTheme, width: number, isLocal: boolean): string {
        const t = theme;
        return `You are ${agentName}.
OUTPUT: ONLY valid JSON array. No text before or after.

THEME (MUST USE):
- Primary: ${t.primary}
- Background: ${t.background}
- Surface: ${t.surface}
- Text: ${t.text}
- Border: ${t.border}
- Radius: ${t.radius.small}px

CONTEXT: Header/nav for ${width}px.
- Logo left, nav right
- display:flex, justifyContent:space-between, alignItems:center
- Height: 80px, Width: 100%
- Use ONLY theme colors.

RULES:
- camelCase CSS (backgroundColor, justifyContent)
- Numbers only (no "px")
- Valid JSON array
- Close all brackets {}
`;
    }
    
    private static buildHeroPrompt(agentName: string, theme: AgentTheme, width: number, height: number, isLocal: boolean): string {
        const t = theme;
        return `You are ${agentName}.
OUTPUT: ONLY valid JSON array. No text before or after.

THEME (MUST USE):
- Primary: ${t.primary}
- Background: ${t.background}
- Surface: ${t.surface}
- Text: ${t.text}
- Text Secondary: ${t.textSecondary}
- Accent: ${t.accent}
- Font: ${t.font}

CONTEXT: Hero for ${width}x${height}.
- Big title (48-64px), subtitle, 2 buttons
- display:flex, flexDirection:column, alignItems:center, textAlign:center
- MinHeight: 500px, MaxWidth: 800px
- Use ONLY theme colors.

RULES:
- camelCase CSS
- Numbers only
- Valid JSON array
`;
    }
    
    private static buildHeroSplitPrompt(agentName: string, theme: AgentTheme, width: number, height: number, isLocal: boolean): string {
        const t = theme;
        return `You are ${agentName}.
OUTPUT: ONLY valid JSON array. No text before or after.

THEME (MUST USE):
- Primary: ${t.primary}
- Background: ${t.background}
- Surface: ${t.surface}
- Text: ${t.text}
- Text Secondary: ${t.textSecondary}
- Border: ${t.border}

CONTEXT: SPLIT HERO ${width}x${height}.
LAYOUT: Left text, Right visual
- Left: Badge, Headline, Subtext, 2 Buttons
- Right: Visual container
- display:flex, flexDirection:row, justifyContent:space-between
- MinHeight: 600px, Gap: 60px
- Use ONLY theme colors.

RULES:
- camelCase CSS
- Numbers only
- Valid JSON array
`;
    }
    
    private static buildFeaturesPrompt(agentName: string, theme: AgentTheme, width: number, isLocal: boolean): string {
        const t = theme;
        return `You are ${agentName}.
OUTPUT: ONLY valid JSON array. No text before or after.

THEME (MUST USE):
- Primary: ${t.primary}
- Background: ${t.background}
- Surface: ${t.surface}
- Text: ${t.text}
- Text Secondary: ${t.textSecondary}
- Border: ${t.border}
- Radius: ${t.radius.medium}px

CONTEXT: Features section ${width}px.
- 3-4 cards in row
- display:flex gap:24 OR display:grid
- Each card: emoji, title, description
- Card bg: ${t.surface}
- Use ONLY theme colors.

RULES:
- camelCase CSS
- Numbers only
- Valid JSON array
`;
    }
    
    private static buildBentoGridPrompt(agentName: string, theme: AgentTheme, width: number, isLocal: boolean): string {
        const t = theme;
        return `You are ${agentName}.
OUTPUT: ONLY valid JSON array. No text before or after.

THEME (MUST USE):
- Primary: ${t.primary}
- Background: ${t.background}
- Surface: ${t.surface}
- Text: ${t.text}
- Text Secondary: ${t.textSecondary}
- Border: ${t.border}

CONTEXT: BENTO GRID ${width}px.
- display:grid, gridTemplateColumns:repeat(2,1fr), gap:24
- 4 cards (mix sizes)
- Card bg: ${t.surface}
- Radius: ${t.radius.large}px
- Use ONLY theme colors.

RULES:
- camelCase CSS (gridTemplateColumns, backgroundColor)
- Numbers only
- Valid JSON array
`;
    }
    
    private static buildPricingPrompt(agentName: string, theme: AgentTheme, width: number, isLocal: boolean): string {
        const t = theme;
        return `You are ${agentName}.
OUTPUT: ONLY valid JSON array. No text before or after.

THEME (MUST USE):
- Primary: ${t.primary}
- Background: ${t.background}
- Surface: ${t.surface}
- Text: ${t.text}
- Text Secondary: ${t.textSecondary}
- Accent: ${t.accent}
- Border: ${t.border}

CONTEXT: PRICING section ${width}px.
- 3 cards: Basic, Pro, Enterprise
- display:flex, gap:32, justifyContent:center
- Pro card: larger, ${t.primary} border, "Popular" badge
- Card bg: ${t.surface}
- Use ONLY theme colors.

RULES:
- camelCase CSS
- Numbers only
- Valid JSON array
`;
    }
    
    private static buildCenterSplashPrompt(agentName: string, theme: AgentTheme, width: number, height: number, isLocal: boolean): string {
        const t = theme;
        return `You are ${agentName}.
OUTPUT: ONLY valid JSON array. No text before or after.

THEME (MUST USE):
- Primary: ${t.primary}
- Background: ${t.background}
- Text: ${t.text}
- Accent: ${t.accent}

CONTEXT: CENTER SPLASH ${width}x${height}.
- display:flex, flexDirection:column, alignItems:center, textAlign:center
- MinHeight: 700px
- Title: 64-80px, fontWeight:900
- Subtitle: 20-24px, maxWidth:700px
- CTA button
- Use ONLY theme colors.

RULES:
- camelCase CSS
- Numbers only
- Valid JSON array
`;
    }
    
    private static buildModularGridPrompt(agentName: string, theme: AgentTheme, width: number, isLocal: boolean): string {
        const t = theme;
        return `You are ${agentName}.
OUTPUT: ONLY valid JSON array. No text before or after.

THEME (MUST USE):
- Primary: ${t.primary}
- Background: ${t.background}
- Surface: ${t.surface}
- Text: ${t.text}
- Border: ${t.border}

CONTEXT: MODULAR GRID ${width}px.
- display:grid, gridTemplateColumns:repeat(12,1fr), gap:20
- Mix of spans (4, 6, 8 cols)
- Module bg: ${t.surface}
- Radius: 12px
- Use ONLY theme colors.

RULES:
- camelCase CSS (gridTemplateColumns, gridColumn)
- Numbers only
- Valid JSON array
`;
    }
    
    private static buildContentPrompt(agentName: string, theme: AgentTheme, width: number, isLocal: boolean): string {
        const t = theme;
        return `You are ${agentName}.
OUTPUT: ONLY valid JSON array. No text before or after.

THEME (MUST USE):
- Primary: ${t.primary}
- Background: ${t.background}
- Surface: ${t.surface}
- Text: ${t.text}
- Text Secondary: ${t.textSecondary}
- Border: ${t.border}

CONTEXT: Content section ${width}px.
- display:flex, flexDirection:column, alignItems:center
- Heading + paragraph
- MaxWidth: 800px
- MinHeight: 300px
- Use ONLY theme colors.

RULES:
- camelCase CSS
- Numbers only
- Valid JSON array
`;
    }
    
    private static buildFooterPrompt(agentName: string, theme: AgentTheme, width: number, isLocal: boolean): string {
        const t = theme;
        return `You are ${agentName}.
OUTPUT: ONLY valid JSON array. No text before or after.

THEME (MUST USE):
- Primary: ${t.primary}
- Background: ${t.background}
- Surface: ${t.surface}
- Text: ${t.text}
- Text Secondary: ${t.textSecondary}
- Border: ${t.border}

CONTEXT: CTA + Footer ${width}px.
- CTA: centered text + button
- Footer: copyright
- Use ONLY theme colors.

RULES:
- camelCase CSS
- Numbers only
- Valid JSON array
`;
    }
    
    // ============================================================
    // CLOUD PROMPTS (Full orchestrator for non-local)
    // ============================================================
    static generateSystemPrompt(
        expertMode: ExpertMode,
        projectSettings: ProjectSettings,
        isLocal: boolean,
        targetDimensions?: { width: number; height: number },
        requiredSkillId?: string | null,
        layoutAdvice?: string
    ): string {
        
        const agent = AGENT_REGISTRY.find(a => a.id === expertMode) || AGENT_REGISTRY[0];
        const width = targetDimensions?.width || projectSettings.pageSize.width;
        const height = targetDimensions?.height || projectSettings.pageSize.height;
        const lib = projectSettings.componentLibrary || 'html-tailwind';
        
        let instruction = `You are ${agent.name}, ${agent.role}.
        
MISSION:
Generate a UI structure matching your persona inside a container (W:${width}px, H:${height}px).

YOUR STYLE GUIDE:
${agent.styleGuide}

CORE CONSTRAINTS:
- Output format: JSON Array of UIElement objects only.
- Use 'display: flex' for layout by default, unless Grid is advised.
- Text: 'word-break: break-word'.
- No invisible elements.
`;
        
        // Add theme info
        const theme = AGENT_THEMES[expertMode] || AGENT_THEMES['landing'];
        instruction += `
THEME COLORS:
- Primary: ${theme.primary}
- Background: ${theme.background}
- Surface: ${theme.surface}
- Text: ${theme.text}
- Accent: ${theme.accent}
`;
        
        if (isLocal) {
            instruction += `
[ENV: LOCAL - OLLAMA MODE]
CRITICAL: You are running on a LOCAL model. Follow these STRICT rules:
1. Use EXACT template if skill specified
2. SIMPLE layouts only
3. Numbers only (no "px" suffixes)
4. Max 3 nesting levels
5. Valid JSON array output
`;
        } else {
            instruction += `\n[ENV: CLOUD] Use advanced CSS (gradients, backdrop-filter) for high fidelity.`;
        }
        
        // Design System
        instruction += `\n[DESIGN SYSTEM: ${lib.toUpperCase()}]`;
        
        // Grid Master
        if (layoutAdvice) {
            instruction += `\n\n[>>> GRID MASTER PROTOCOL <<<]\n${layoutAdvice}\n`;
        }
        
        // Skill
        if (requiredSkillId) {
            const skill = SKILL_REGISTRY.find(s => s.id === requiredSkillId);
            if (skill) {
                instruction += `\n[REQUIRED SKILL: ${skill.name.toUpperCase()}]\n${skill.instruction}\n`;
            }
        }
        
        // Validation Rules
        instruction += `
## STRICT VALIDATION RULES
1. ALL CSS properties MUST use camelCase
2. ALL numeric style values must be integers (NOT strings like '100px')
3. ALL color values must be valid hex (#FFFFFF) or rgba() format
4. Container elements MUST have: display, width, height
5. NO undefined or null values in output
6. Element types MUST be one of: page, section, container, text, button, grid, rectangle, circle, box, frame, image

## OUTPUT SCHEMA
Generate JSON Array of UIElement objects.
`;
        
        return instruction;
    }
}
