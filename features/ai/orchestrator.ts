
import { ExpertMode, ProjectSettings } from '../../types';
import { AGENT_REGISTRY } from './agents';
import { SKILL_REGISTRY } from './skills';

export class Orchestrator {
    
    static generateSystemPrompt(
        expertMode: ExpertMode,
        projectSettings: ProjectSettings,
        isLocal: boolean,
        targetDimensions?: { width: number; height: number },
        requiredSkillId?: string | null,
        layoutAdvice?: string // Received from Grid Master
    ): string {
        
        // 1. Load the Sub-Agent
        const agent = AGENT_REGISTRY.find(a => a.id === expertMode) || AGENT_REGISTRY[0];
        
        // 2. Determine Context
        const width = targetDimensions?.width || projectSettings.pageSize.width;
        const height = targetDimensions?.height || projectSettings.pageSize.height;
        const lib = projectSettings.componentLibrary || 'html-tailwind';

        // 3. Construct Base Identity
        let instruction = `You are ${agent.name}, a ${agent.role}.
        
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

        // 4. Inject Environment Constraints
        if (isLocal) {
            instruction += `\n[ENV: LOCAL] Optimize for minimal token usage. Standard HTML/CSS only.`;
        } else {
            instruction += `\n[ENV: CLOUD] Use advanced CSS (gradients, backdrop-filter, absolute positioning) for high fidelity.`;
        }

        // 5. Inject Design System
        instruction += `\n[DESIGN SYSTEM: ${lib.toUpperCase()}]`;
        if (lib === 'shadcn') instruction += ` Use 1px borders (#E4E4E7), 6px radius, Inter font.`;
        if (lib === 'html-tailwind' && expertMode === 'hud') instruction += ` Use 1px borders, 0px radius, Monospace font for HUD style.`;

        // 6. Inject Grid Master Advice (The "Brain" of the operation)
        if (layoutAdvice) {
            instruction += `\n\n[>>> GRID MASTER PROTOCOL ACTIVE <<<]
            The Grid Master has pre-calculated the optimal layout mathematics for this ${width}x${height} canvas.
            YOU MUST FOLLOW THESE STRUCTURAL RULES:
            
            ${layoutAdvice}
            
            Apply these grid/flex values strictly to your main containers.
            `;
        }

        // 7. Inject Requested Skill (if any)
        if (requiredSkillId) {
            const skill = SKILL_REGISTRY.find(s => s.id === requiredSkillId);
            if (skill) {
                instruction += `\n\n[REQUIRED SKILL: ${skill.name.toUpperCase()}]
                Description: ${skill.description}
                INSTRUCTION: ${skill.instruction}
                
                IMPORTANT: Use the following JSON Skeleton as the strict basis for your response. Populate content within it.
                SKELETON: ${JSON.stringify(skill.structure)}
                `;
            }
        }

        // 8. Add Strict Validation Rules
        instruction += `

## STRICT VALIDATION RULES
1. ALL numeric style values must be integers (NOT strings like '100px')
2. ALL color values must be valid hex (#FFFFFF) or rgba() format
3. Container elements MUST have: display, width, height
4. Text elements MUST have: fontSize (number), color
5. NO undefined or null values in output
6. Element types MUST be one of: page, section, container, text, button, grid, rectangle, circle, box, frame, image
`;

        // 9. Output Schema Reminder - EXACT TYPE MATCH
        instruction += `

## EXACT OUTPUT SCHEMA - MUST MATCH UIElement INTERFACE

Generate a JSON Array of UIElement objects with these EXACT properties:

interface UIElement {
  type: 'page' | 'section' | 'container' | 'text' | 'button' | 'grid' | 'rectangle' | 'circle' | 'box' | 'frame' | 'image';
  name: string; // Descriptive name (e.g., "Hero Section", "Primary Button")
  props: {
    // For 'text' type: { text: "content" }
    // For 'button' type: { label: "Click Me" }
    // For 'image' type: { src: "url", alt: "description" }
    animation?: {
      type: 'none' | 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'zoomIn' | 'zoomOut' | 'bounce' | 'pulse' | 'spin';
      duration: number; // seconds (e.g., 0.5)
      delay: number; // seconds (e.g., 0)
      infinite: boolean; // true/false
      ease: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
    }
  };
  style: {
    // Layout
    display?: 'flex' | 'grid' | 'block' | 'none';
    flexDirection?: 'row' | 'column';
    flexWrap?: 'wrap' | 'nowrap';
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
    alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
    gap?: number; // pixels (e.g., 24)

    // Position & Size (USE NUMBERS, NOT STRINGS WITH 'px')
    position?: 'absolute' | 'relative' | 'fixed' | 'sticky';
    left?: number; // pixels
    top?: number; // pixels
    right?: number; // pixels
    bottom?: number; // pixels
    width?: number | string; // pixels OR '100%' | 'auto' | 'max-content'
    height?: number | string; // pixels OR '100%' | 'auto'
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;

    // Spacing (USE NUMBERS)
    padding?: number; // pixels
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    margin?: number; // pixels
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    marginLeft?: number;

    // Appearance
    backgroundColor?: string; // hex (#1a1a1a) or rgba
    color?: string; // text color
    opacity?: number; // 0-1

    // Border
    border?: string; // e.g., "1px solid rgba(255,255,255,0.1)"
    borderRadius?: number; // pixels
    borderWidth?: number;
    borderColor?: string;
    borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';

    // Typography (USE NUMBERS FOR SIZES)
    fontSize?: number; // pixels (e.g., 16)
    fontWeight?: number | string; // 400, 600, 'bold'
    fontFamily?: string;
    lineHeight?: number | string; // 1.5 or '24px'
    letterSpacing?: number | string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    textDecoration?: 'none' | 'underline' | 'line-through';

    // Effects
    boxShadow?: string;
    backdropFilter?: string;
    filter?: string;
    transform?: string;

    // Layout extras
    overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
    zIndex?: number;
    cursor?: string;
    boxSizing?: 'border-box' | 'content-box';

    // Grid (if display: 'grid')
    gridTemplateColumns?: string; // e.g., "repeat(12, 1fr)"
    gridTemplateRows?: string;
    gridColumn?: string; // e.g., "span 2"
    gridRow?: string;
  };
  children?: UIElement[]; // Nested elements
  isExpanded?: boolean; // true for containers with children
  isLocked?: boolean; // false by default
}

## TYPE-SPECIFIC REQUIREMENTS

### 'text' elements MUST have:
- props.text: "actual text content"
- style.fontSize: number (e.g., 16)
- style.color: string (e.g., "#ffffff")

### 'button' elements MUST have:
- props.label: "Button Text"
- style.padding: number
- style.backgroundColor: string
- style.borderRadius: number

### 'image' elements MUST have:
- props.src: "image-url-or-placeholder"
- props.alt: "description"
- style.objectFit: 'cover' | 'contain' | 'fill'

### 'section' | 'container' | 'box' | 'frame' elements MUST have:
- style.display: 'flex' or 'grid'
- style.width: number or '100%'
- style.height: number or 'auto'
- style.boxSizing: 'border-box'

### 'circle' elements:
- style.borderRadius: 9999 (or large number for perfect circle)
- style.width and style.height should be equal

## CRITICAL RULES
1. NO 'px' suffixes on numbers - use 100, not "100px"
2. ALL style properties must use camelCase (backgroundColor, not background-color)
3. Colors must be valid: hex (#ffffff) or rgba/rgb strings
4. Booleans must be true/false (not "true"/"false" strings)
5. Arrays must be actual arrays [], not objects {}
6. Children must be UIElement objects following this same schema
`;

        return instruction;
    }
}
