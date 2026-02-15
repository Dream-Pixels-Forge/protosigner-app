
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { UIElement, ProjectSettings, AIProvider, ExpertMode } from '../types';
import { sleep, insertNodeIntoParent, updateElementRecursively, normalizeStyleProperties } from './utils';
import { Orchestrator } from '../features/ai/orchestrator';
import { ensureImageSource } from './imageUtils';
import { getLocalOptimizations, LOCAL_MODEL_CONFIGS } from '../features/ai/LocalModelOptimizer';

interface UseAIProps {
    elements: UIElement[];
    setElements: React.Dispatch<React.SetStateAction<UIElement[]>>;
    selectedId: string | null;
    selectElement: (id: string | null, multi?: boolean) => void;
    googleApiKey: string;
    openRouterApiKey: string;
    ollamaServerUrl: string;
    activeModelId: string;
    activeModelProvider: AIProvider;
    saveToHistory: (action: string) => void;
    updateElementProps: (id: string, props: Partial<Record<string, any>>) => void;
    updateElementStyle: (id: string, style: Partial<NonNullable<UIElement['style']>>) => void;
    projectSettings: ProjectSettings;
    updateProjectSettings: (settings: Partial<ProjectSettings>) => void;
    expertMode: ExpertMode;
}

export const useAI = ({ 
    elements, 
    setElements, 
    selectedId, 
    selectElement,
    googleApiKey,
    openRouterApiKey,
    ollamaServerUrl,
    activeModelId,
    activeModelProvider,
    saveToHistory, 
    updateElementProps, 
    updateElementStyle,
    projectSettings,
    updateProjectSettings,
    expertMode
}: UseAIProps) => {
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Hardware level for local model optimization (default: ultra-light)
    // Use 'light' level by default for better template generation
    const hardwareLevel = 'light';

    const buildUITree = async (parentId: string, nodes: any[]) => {
        const nodeList = Array.isArray(nodes) ? nodes : [nodes];
        
        for (let i = 0; i < nodeList.length; i++) {
            const node = nodeList[i];
            const newId = Math.random().toString(36).substr(2, 9);
            
            // Apply fixes BEFORE destructuring - fix type and name first
            const fixedNode = fixCommonIssues(node);
            
            const { type, name, props, style, children } = fixedNode;
            
            // INFER TYPE if still missing - analyze structure
            let inferredType = type;
            if (!inferredType || typeof inferredType !== 'string') {
                if (props?.text || props?.label || props?.innerText) {
                    inferredType = 'text';
                } else if (props?.src && (props.src.includes('.jpg') || props.src.includes('.png') || props.src.includes('http'))) {
                    inferredType = 'image';
                } else if (props?.label && (props.label.length < 30)) {
                    inferredType = 'button';
                } else if (children && Array.isArray(children) && children.length > 0) {
                    inferredType = 'container';
                } else {
                    inferredType = 'container';
                }
            }
            
            // Ensure name exists
            const finalName = name || `AI Component ${i}`;
            
            // Force strict defaults for visibility - preserve AI's display (flex/grid) and layout properties
            const containerTypes = ['section', 'container', 'box', 'frame', 'grid', 'page'];
            const isContainer = containerTypes.includes(inferredType);
            
            // Start with AI response style
            const baseStyle = { ...style } || {};
            
            // Apply defaults only for container elements without layout properties
            const defaultStyle = {
                boxSizing: 'border-box',
                opacity: 0, 
                transition: 'opacity 0.5s ease-out'
            };
            
            // For containers, ensure layout defaults if missing
            if (isContainer) {
                if (!baseStyle.display) baseStyle.display = 'flex';
                if (baseStyle.display === 'flex') {
                    if (!baseStyle.flexDirection) baseStyle.flexDirection = 'row';
                    if (!baseStyle.alignItems) baseStyle.alignItems = 'center';
                }
                if (baseStyle.display === 'grid') {
                    if (!baseStyle.gridTemplateColumns) {
                        baseStyle.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
                    }
                    if (!baseStyle.gap) baseStyle.gap = 24;
                }
                if (!baseStyle.width) baseStyle.width = '100%';
            }
            
            const safeStyle = { ...defaultStyle, ...baseStyle };

            // Ensure image elements have a source
            const processedProps = inferredType === 'image' && (!props || !props.src) 
                ? { ...props, src: `/assets/1 (${Math.floor(Math.random() * 10) + 1}).jpg`, alt: props?.alt || 'Image' }
                : (props || {});

            const newElement: UIElement = {
                id: newId, 
                type: inferredType as any, 
                name: finalName, 
                props: processedProps,
                style: safeStyle, 
                children: [], 
                isExpanded: true, 
                isLocked: false
            };
            setElements(prev => insertNodeIntoParent(prev, parentId, newElement));
            await sleep(80);
            setElements(prev => updateElementRecursively(prev, newId, (el) => ({ ...el, style: { ...el.style, opacity: 1 } })));
            
            // Process children with image fallback - also fix them first
            if (children && children.length > 0) {
                // Ensure all children images have sources and are fixed
                const processedChildren = children.map((child: any, idx: number) => {
                    const fixedChild = fixCommonIssues(child);
                    if (fixedChild.type === 'image' && (!fixedChild.props || !fixedChild.props.src)) {
                        return {
                            ...fixedChild,
                            props: {
                                ...fixedChild.props,
                                src: `/assets/1 (${Math.floor(Math.random() * 10) + 1}).jpg`,
                                alt: fixedChild.props?.alt || 'Image'
                            }
                        };
                    }
                    return fixedChild;
                });
                await buildUITree(newId, processedChildren);
            }
            await sleep(40);
        }
    };

    // --- CENTRALIZED AI QUERY HANDLER ---
    const queryAI = async (
        systemPrompt: string, 
        userPrompt: string, 
        imageContext?: string,
        forceJson: boolean = false
    ): Promise<string> => {
        
        // 1. Google GenAI
        if (activeModelProvider === 'Google') {
            const ai = new GoogleGenAI({ apiKey: googleApiKey });
            
            let contentsPayload: any = userPrompt;
            if (imageContext) {
                contentsPayload = {
                    parts: [
                        { text: userPrompt },
                        { inlineData: { mimeType: 'image/png', data: imageContext.split(',')[1] } }
                    ]
                };
            }

            const response = await ai.models.generateContent({
                model: activeModelId, 
                contents: contentsPayload,
                config: { 
                    systemInstruction: systemPrompt,
                    responseMimeType: forceJson ? 'application/json' : undefined 
                }
            });
            return response.text || '';
        } 
        
        // 2. OpenAI Compatible (OpenRouter / Ollama)
        else {
            let url = '';
            let key = '';
            
            if (activeModelProvider === 'OpenRouter') {
                url = 'https://openrouter.ai/api/v1/chat/completions';
                key = openRouterApiKey;
            } else {
                url = `${ollamaServerUrl}/api/chat`;
                key = ''; // No key for local Ollama
            }

            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (key) headers['Authorization'] = `Bearer ${key}`;
            if (activeModelProvider === 'OpenRouter') {
                 headers['HTTP-Referer'] = 'https://protosigner-pro.app';
                 headers['X-Title'] = 'ProtoSigner';
            }

            let userContent: any = userPrompt;
            if (imageContext) {
                userContent = [
                    { type: "text", text: userPrompt },
                    { type: "image_url", image_url: { url: imageContext } }
                ];
            }

            const body: any = {
                model: activeModelId,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userContent }
                ],
                stream: false
            };

            // OPTIMIZATION: Apply local model optimizations for Ollama
            if (activeModelProvider === 'Ollama') {
                const optimizations = getLocalOptimizations(hardwareLevel);
                body.options = {
                    temperature: optimizations.config.temperature,
                    top_p: optimizations.config.topP,
                    num_ctx: optimizations.config.numCtx,
                    repeat_penalty: optimizations.config.repeatPenalty,
                    num_predict: optimizations.config.maxTokens
                };
            }

            if (forceJson) {
                 if (activeModelProvider === 'Ollama') {
                     body.format = 'json';
                 } else {
                     if (activeModelId.includes('gpt') || activeModelId.includes('claude')) {
                         body.response_format = { type: 'json_object' };
                     }
                 }
            }

            const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
            if (!res.ok) {
                const err = await res.text();
                throw new Error(`AI Provider Error: ${err}`);
            }
            const data = await res.json();
            
            // Debug: Log response structure
            console.log("[QueryAI] Response keys:", Object.keys(data));
            
            // Check if response was truncated
            if (data.done_reason) {
                console.log("[QueryAI] Done reason:", data.done_reason);
                if (data.done_reason === 'length') {
                    console.warn("[QueryAI] WARNING: Response was truncated due to max token limit!");
                }
            }
            
            const content = data.choices?.[0]?.message?.content || data.message?.content || '';
            console.log("[QueryAI] Content:", content?.substring(0, 200)); // Log first 200 chars
            console.log("[QueryAI] Content length:", content?.length || 0);
            return content;
        }
    };

    // --- SECTION-BY-SECTION GENERATION WITH RETRIES ---
    const MAX_RETRIES = 3;
    const SECTION_DELAY_MS = 500; // Delay between sections
    
    // Generate a single section with retry logic
    const generateSingleSection = async (
        sectionName: string,
        systemInstruction: string,
        userPrompt: string,
        imageContext?: string
    ): Promise<UIElement[] | null> => {
        console.log(`[SectionGen] Generating: ${sectionName}`);
        
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                console.log(`[SectionGen] ${sectionName} - Attempt ${attempt}/${MAX_RETRIES}`);
                
                const responseText = await queryAI(systemInstruction, userPrompt, imageContext, true);
                
                if (!responseText || responseText.length < 10) {
                    console.warn(`[SectionGen] ${sectionName} - Empty response, retrying...`);
                    if (attempt < MAX_RETRIES) {
                        await sleep(1000 * attempt); // Increasing delay
                        continue;
                    }
                    return null;
                }
                
                // Clean and parse JSON
                let cleanJson = responseText
                    .replace(/```json/g, '')
                    .replace(/```/g, '')
                    .replace(/^```/g, '')
                    .replace(/```$/g, '')
                    .trim();
                
                // Handle escaped JSON
                if (cleanJson.startsWith('"') && cleanJson.endsWith('"')) {
                    cleanJson = cleanJson.slice(1, -1);
                    cleanJson = cleanJson.replace(/\\n/g, '\n').replace(/\\"/g, '"');
                }
                
                // Try to parse with fallback
                let parsed: any;
                try {
                    parsed = JSON.parse(cleanJson);
                } catch (parseError: any) {
                    // Try to fix truncated JSON
                    const lastBrace = cleanJson.lastIndexOf('}');
                    const lastBracket = cleanJson.lastIndexOf(']');
                    const lastComplete = Math.max(lastBrace, lastBracket);
                    
                    if (lastComplete > 10) {
                        const fixedJson = cleanJson.substring(0, lastComplete + 1);
                        try {
                            parsed = JSON.parse(fixedJson);
                            console.log(`[SectionGen] ${sectionName} - Fixed truncated JSON`);
                        } catch {
                            console.warn(`[SectionGen] ${sectionName} - Failed to parse, attempt ${attempt}`);
                            if (attempt < MAX_RETRIES) {
                                await sleep(1000 * attempt);
                                continue;
                            }
                            return null;
                        }
                    } else {
                        console.warn(`[SectionGen] ${sectionName} - Parse failed, attempt ${attempt}`);
                        if (attempt < MAX_RETRIES) {
                            await sleep(1000 * attempt);
                            continue;
                        }
                        return null;
                    }
                }
                
                // Normalize to array
                if (!Array.isArray(parsed)) {
                    if (parsed.children) {
                        parsed = [parsed];
                    } else if (parsed.type) {
                        parsed = [parsed];
                    } else {
                        console.warn(`[SectionGen] ${sectionName} - Unexpected format`);
                        if (attempt < MAX_RETRIES) {
                            await sleep(1000 * attempt);
                            continue;
                        }
                        return null;
                    }
                }
                
                // Apply fixes
                parsed = fixCommonIssues(parsed);
                
                // Validate
                const validation = validateAIResponse(parsed);
                if (!validation.valid) {
                    console.warn(`[SectionGen] ${sectionName} - Validation errors:`, validation.errors.slice(0, 3));
                    // Continue anyway if we have valid data
                }
                
                console.log(`[SectionGen] ✓ ${sectionName} - Success! (${parsed.length} elements)`);
                return parsed;
                
            } catch (error: any) {
                console.warn(`[SectionGen] ${sectionName} - Error: ${error.message}`);
                if (attempt < MAX_RETRIES) {
                    await sleep(1000 * attempt);
                }
            }
        }
        
        console.error(`[SectionGen] ✗ ${sectionName} - Failed after ${MAX_RETRIES} attempts`);
        return null;
    };

    // Generate sections one by one for local models (prevents truncation)
    const generateSectionsSequentially = async (
        sections: { name: string; instruction: string; isBackground?: boolean }[],
        parentId: string,
        onProgress?: (completed: number, total: number) => void
    ): Promise<UIElement[]> => {
        const allElements: UIElement[] = [];
        
        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            console.log(`[SectionGen] Progress: ${i + 1}/${sections.length} - ${section.name}`);
            
            if (onProgress) {
                onProgress(i, sections.length);
            }
            
            // Handle page background specially
            if (section.isBackground) {
                try {
                    const response = await queryAI(section.instruction, "Generate page background settings", undefined, true);
                    const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();
                    const bgSettings = JSON.parse(cleaned);
                    
                    if (bgSettings.backgroundColor || bgSettings.color) {
                        console.log(`[SectionGen] Applying page background:`, bgSettings);
                        // Update the page element with background settings
                        updateElementStyle(parentId, {
                            backgroundColor: bgSettings.backgroundColor,
                            color: bgSettings.color,
                            minHeight: bgSettings.minHeight || '100%'
                        } as any);
                    }
                } catch (bgErr) {
                    console.warn(`[SectionGen] Failed to set page background:`, bgErr);
                }
                continue; // Skip adding background as element
            }
            
            const result = await generateSingleSection(
                section.name,
                section.instruction,
                `Generate this section: ${section.name}`,
                undefined
            );
            
            if (result && result.length > 0) {
                // Add each element to the parent
                for (const element of result) {
                    const newId = Math.random().toString(36).substr(2, 9);
                    const newElement: UIElement = {
                        ...element,
                        id: newId,
                        children: element.children || []
                    };
                    
                    setElements(prev => insertNodeIntoParent(prev, parentId, newElement));
                    await sleep(100);
                    allElements.push(newElement);
                }
            } else {
                // Create fallback element for failed section
                console.warn(`[SectionGen] Creating fallback for: ${section.name}`);
                const fallbackId = Math.random().toString(36).substr(2, 9);
                const fallbackElement: UIElement = {
                    id: fallbackId,
                    type: 'container',
                    name: section.name,
                    props: {},
                    style: {
                        display: 'flex',
                        width: '100%',
                        height: 200,
                        padding: 20,
                        backgroundColor: '#1e293b'
                    },
                    children: [],
                    isExpanded: true,
                    isLocked: false
                };
                
                setElements(prev => insertNodeIntoParent(prev, parentId, fallbackElement));
                await sleep(100);
                allElements.push(fallbackElement);
            }
            
            // Delay between sections
            if (i < sections.length - 1) {
                await sleep(SECTION_DELAY_MS);
            }
        }
        
        if (onProgress) {
            onProgress(sections.length, sections.length);
        }
        
        console.log(`[SectionGen] Complete! Generated ${allElements.length} elements`);
        return allElements;
    };

    // --- RESPONSE VALIDATION ---
    const validateAIResponse = (data: any): { valid: boolean; errors: string[] } => {
        const errors: string[] = [];
        
        if (!data) {
            errors.push('Response is empty');
            return { valid: false, errors };
        }
        
        const elements = Array.isArray(data) ? data : [data];
        
        elements.forEach((el, idx) => {
            // Check required fields
            if (!el.type) errors.push(`Element ${idx}: Missing 'type'`);
            if (!el.name) errors.push(`Element ${idx}: Missing 'name'`);
            
            // Check style object
            if (el.style) {
                // Height/Width must be numbers or valid strings
                if (el.style.height && typeof el.style.height === 'string' && el.style.height.includes('px')) {
                    errors.push(`Element ${idx} (${el.name}): Height '${el.style.height}' should be number, not string with 'px'`);
                }
                if (el.style.width && typeof el.style.width === 'string' && el.style.width.includes('px')) {
                    errors.push(`Element ${idx} (${el.name}): Width '${el.style.width}' should be number, not string with 'px'`);
                }
                
                // FontSize must be number
                if (el.style.fontSize && typeof el.style.fontSize === 'string') {
                    errors.push(`Element ${idx} (${el.name}): fontSize should be number`);
                }
                
                // Validate display property for containers
                const containerTypes = ['section', 'container', 'box', 'frame', 'grid', 'page'];
                if (containerTypes.includes(el.type) && el.style.display && !['flex', 'grid', 'block'].includes(el.style.display)) {
                    errors.push(`Element ${idx} (${el.name}): Invalid display '${el.style.display}'`);
                }
            }
            
            // Recursively validate children
            if (el.children && Array.isArray(el.children)) {
                el.children.forEach((child: any, cidx: number) => {
                    const childValidation = validateAIResponse(child);
                    errors.push(...childValidation.errors.map(e => `Element ${idx} > Child ${cidx}: ${e}`));
                });
            }
        });
        
        return { valid: errors.length === 0, errors };
    };

    // --- AUTO-FIX COMMON ISSUES ---
    const fixCommonIssues = (data: any): any => {
        // Helper: Convert kebab-case CSS to camelCase
        const normalizeStyle = (style: any): any => {
            if (!style || typeof style !== 'object') return style;
            
            const normalized: any = {};
            const kebabToCamel: Record<string, string> = {
                'align-items': 'alignItems',
                'justify-content': 'justifyContent',
                'background-color': 'backgroundColor',
                'background-image': 'backgroundImage',
                'background-size': 'backgroundSize',
                'border-radius': 'borderRadius',
                'border-width': 'borderWidth',
                'border-color': 'borderColor',
                'border-style': 'borderStyle',
                'box-shadow': 'boxShadow',
                'flex-direction': 'flexDirection',
                'flex-wrap': 'flexWrap',
                'font-size': 'fontSize',
                'font-weight': 'fontWeight',
                'font-family': 'fontFamily',
                'line-height': 'lineHeight',
                'letter-spacing': 'letterSpacing',
                'text-align': 'textAlign',
                'text-color': 'textColor',
                'margin-top': 'marginTop',
                'margin-bottom': 'marginBottom',
                'margin-left': 'marginLeft',
                'margin-right': 'marginRight',
                'padding-top': 'paddingTop',
                'padding-bottom': 'paddingBottom',
                'padding-left': 'paddingLeft',
                'padding-right': 'paddingRight',
                'max-width': 'maxWidth',
                'min-width': 'minWidth',
                'max-height': 'maxHeight',
                'min-height': 'minHeight',
                'z-index': 'zIndex',
                'object-fit': 'objectFit',
                'overflow-x': 'overflowX',
                'overflow-y': 'overflowY',
                'transition-duration': 'transitionDuration',
                'transition-delay': 'transitionDelay',
                'animation-name': 'animationName',
                'animation-duration': 'animationDuration',
                'animation-delay': 'animationDelay',
                'animation-iteration-count': 'animationIterationCount',
                'animation-timing-function': 'animationTimingFunction',
                'animation-fill-mode': 'animationFillMode'
            };
            
            for (const [key, value] of Object.entries(style)) {
                if (kebabToCamel[key]) {
                    normalized[kebabToCamel[key]] = value;
                } else {
                    normalized[key] = value;
                }
            }
            return normalized;
        };

        const fixElement = (el: any, index: number = 0): any => {
            const fixed = { ...el };
            
            // FIX: Normalize type - convert "div" to "container"
            if (fixed.type === 'div' || fixed.type === 'span' || fixed.type === 'section') {
                fixed.type = 'container';
            }
            
            // FIX: Add default 'type' if missing - infer from structure
            if (!fixed.type) {
                // Try to infer type from properties or structure
                if (fixed.props?.text || fixed.props?.label) {
                    fixed.type = 'text'; // Has text content
                } else if (fixed.props?.src) {
                    fixed.type = 'image'; // Has image source
                } else if (fixed.children && Array.isArray(fixed.children) && fixed.children.length > 0) {
                    fixed.type = 'container'; // Has children = container
                } else if (fixed.style?.borderRadius && fixed.style?.width === fixed.style?.height) {
                    fixed.type = 'circle';
                } else {
                    fixed.type = 'container'; // Default to container
                }
            }
            
            // FIX: Add default 'name' if missing
            if (!fixed.name) {
                fixed.name = `AI Element ${index}`;
            }
            
            // Fix string pixels to numbers - BEFORE normalization
            if (fixed.style) {
                // First, normalize any kebab-case keys that might have "px" values
                const styleKeys = Object.keys(fixed.style);
                styleKeys.forEach(key => {
                    const value = fixed.style[key];
                    if (typeof value === 'string') {
                        // Handle "24px" strings
                        if (value.includes('px')) {
                            const num = parseInt(value);
                            if (!isNaN(num)) {
                                fixed.style[key] = num;
                            }
                        }
                        // Handle numeric strings like "100"
                        else if (!isNaN(Number(value)) && key !== 'width' && key !== 'height') {
                            fixed.style[key] = Number(value);
                        }
                    }
                });
                
                // Fix specific properties that should be numbers
                ['width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight', 'fontSize', 'gap', 'padding', 'margin', 'top', 'left', 'right', 'bottom', 'borderRadius', 'zIndex', 'flex', 'flexGrow', 'flexShrink'].forEach(prop => {
                    if (fixed.style[prop] !== undefined && fixed.style[prop] !== null) {
                        const val = fixed.style[prop];
                        if (typeof val === 'string') {
                            // Handle '100px' strings
                            if (val.includes('px')) {
                                const num = parseInt(val);
                                if (!isNaN(num)) fixed.style[prop] = num;
                            }
                            // Handle numeric strings like "100"
                            else if (!isNaN(Number(val))) {
                                fixed.style[prop] = Number(val);
                            }
                        }
                    }
                });
                
                // Fix percentage strings that should be numbers (but keep valid percentages)
                if (typeof fixed.style.width === 'string' && fixed.style.width.includes('%')) {
                    // Keep percentage as string, that's valid
                }
            }
            
            // Ensure required fields for UIElement
            if (!fixed.props) fixed.props = {};
            if (!fixed.style) fixed.style = {};
            
            // FIX: Normalize CSS properties from kebab-case to camelCase
            // This fixes AI outputting "background-color" instead of "backgroundColor"
            fixed.style = normalizeStyle(fixed.style);
            
            if (fixed.children === undefined) fixed.children = [];
            if (fixed.isExpanded === undefined) fixed.isExpanded = true;
            if (fixed.isLocked === undefined) fixed.isLocked = false;
            
            // FIX: Ensure proper layout for container/section elements
            const containerTypes = ['section', 'container', 'box', 'frame', 'grid', 'page'];
            if (containerTypes.includes(fixed.type)) {
                // Default to flex row if no display specified
                if (!fixed.style.display) {
                    fixed.style.display = 'flex';
                }
                // Add default flex properties if flex is used
                if (fixed.style.display === 'flex') {
                    if (!fixed.style.flexDirection) fixed.style.flexDirection = 'row';
                    if (!fixed.style.alignItems) fixed.style.alignItems = 'center';
                    if (!fixed.style.justifyContent) fixed.style.justifyContent = 'flex-start';
                }
                // Add default grid properties if grid is used
                if (fixed.style.display === 'grid') {
                    if (!fixed.style.gridTemplateColumns) {
                        // Default to responsive grid
                        fixed.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
                    }
                    if (!fixed.style.gap) fixed.style.gap = 24;
                }
                // Ensure width is set
                if (!fixed.style.width) fixed.style.width = '100%';
            }
            
            // FIX: Ensure children have proper positioning
            if (fixed.children && fixed.children.length > 0 && fixed.style.display === 'flex') {
                // If flex and has children, ensure gap is set for spacing
                if (!fixed.style.gap && fixed.style.flexWrap !== 'wrap') {
                    // Add default gap for better spacing
                }
            }
            
            // Fix children recursively
            if (fixed.children && Array.isArray(fixed.children)) {
                fixed.children = fixed.children.map((child: any, idx: number) => fixElement(child, idx));
            }
            
            return fixed;
        };
        
        if (Array.isArray(data)) {
            return data.map((el: any, idx: number) => fixElement(el, idx));
        }
        return fixElement(data, 0);
    };

    const generateContent = useCallback(async (prompt: string, targetId?: string, imageContext?: string, templateSkillId?: string, createNewPage: boolean = false) => {
        setIsGenerating(true);
        saveToHistory(createNewPage ? 'AI Generate New Page' : 'AI Generate');
        
        let effectiveId = targetId || selectedId;
        
        // If no selection and not creating new page, fallback to active page or root
        if (!effectiveId && !createNewPage) {
             const activePage = elements.find(el => el.type === 'page' && el.style?.display !== 'none') || elements[0];
             effectiveId = activePage?.id;
        }

        let targetEl: UIElement | null = null;

        // --- NEW PAGE LOGIC ---
        if (createNewPage) {
            const newPageId = Math.random().toString(36).substr(2, 9);
            const newPage: UIElement = {
                id: newPageId,
                type: 'page',
                name: 'AI Generated Page',
                props: {},
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: projectSettings.darkMode ? '#000000' : '#ffffff',
                    color: projectSettings.darkMode ? '#ffffff' : '#000000',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '100%',
                    minHeight: '100%',
                    fontFamily: projectSettings.fontFamily,
                    alignItems: 'center'
                },
                children: [],
                isExpanded: true,
                isLocked: false
            };

            setElements(prev => {
                const hiddenPrev = prev.map(el => el.type === 'page' ? { ...el, style: { ...el.style, display: 'none' } } : el);
                return [...hiddenPrev, newPage];
            });
            
            selectElement(newPageId);
            effectiveId = newPageId;
            targetEl = newPage;
            await sleep(50);
        } else {
            const findEl = (list: UIElement[]): UIElement | null => {
                for (const el of list) {
                    if (el.id === effectiveId) return el;
                    if (el.children) { const found = findEl(el.children); if (found) return found; }
                }
                return null;
            };
            targetEl = findEl(elements);
        }

        if (!targetEl || !effectiveId) {
            setIsGenerating(false);
            return;
        }

        // --- CALCULATE DIMENSIONS FOR CONTEXT ---
        const getDims = (el: UIElement): { width: number, height: number } => {
            const wStr = String(el.style?.width || projectSettings.pageSize.width);
            const hStr = String(el.style?.height || projectSettings.pageSize.height);
            const w = wStr.includes('%') ? projectSettings.pageSize.width : (parseFloat(wStr) || projectSettings.pageSize.width);
            const h = hStr.includes('%') ? projectSettings.pageSize.height : (parseFloat(hStr) || projectSettings.pageSize.height);
            return { width: w, height: h };
        };
        const targetDimensions = getDims(targetEl);

        const contextData = {
            id: targetEl.id,
            type: targetEl.type,
            name: targetEl.name,
            currentProps: targetEl.props,
            currentStyle: targetEl.style,
            dimensions: targetDimensions
        };
        const contextStr = JSON.stringify(contextData);
        
        try {
            // --- IMAGE GENERATION SHORTCUT ---
            if (targetEl.type === 'image' && !imageContext && activeModelProvider === 'Google') {
                const responseText = await queryAI('', prompt, undefined, false); // Using raw text for images logic not implemented here fully, reusing existing flow
                // Re-implementing image logic using direct Google call as it's specialized
                const ai = new GoogleGenAI({ apiKey: googleApiKey });
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image', 
                    contents: { parts: [{ text: prompt }] },
                    config: { imageConfig: { aspectRatio: "1:1" } }
                });
                // ... extract image logic ...
                if (response.candidates?.[0]?.content?.parts) {
                    for (const part of response.candidates[0].content.parts) {
                        if (part.inlineData) {
                            const base64EncodeString = part.inlineData.data;
                            updateElementProps(effectiveId, { src: `data:${part.inlineData.mimeType};base64,${base64EncodeString}`, alt: prompt });
                            break;
                        }
                    }
                }
                setIsGenerating(false);
                return;
            }

            // --- MAIN GENERATION ---
            const isContainer = ['page', 'section', 'container', 'box', 'frame', 'grid'].includes(targetEl.type);
            const isLocal = activeModelProvider === 'Ollama';
            let responseText = '';
            
            if (isContainer) {
                 let gmPlan = { 
                     agentId: expertMode, 
                     skillId: templateSkillId || null, 
                     layoutAdvice: '' 
                 };

                 // ============================================================
                 // STEP 1: GRID MASTER (GM) PLANNING
                 // ============================================================
                 // Only run planning if Grid Master is enabled in project settings.
                 
                 if (projectSettings.enableGridMaster) {
                     const pageW = projectSettings.pageSize.width;
                     const pageH = projectSettings.pageSize.height;

                     const gmSystemPrompt = `You are the Grid Master (GM), a highly precise Layout Mathematician.
                     
                     CONTEXT:
                     - Canvas Size: ${pageW}px width x ${pageH}px height.
                     - User Request: "${prompt}"
                     - Auto Skill Mode: ${projectSettings.autoSkillMode ? 'ENABLED' : 'DISABLED'}
                     - Manual Skill Selection: ${templateSkillId || 'None'}
                     
                     AVAILABLE AGENTS:
                     - landing (High conversion, aesthetic)
                     - full-stack (Functional, SaaS, dashboards)
                     - hud (Sci-Fi, data-dense)
                     - dashboard (Analytics, charts)
                     - os (Desktop metaphors)
                     - mobile (App interfaces)
                     
                     AVAILABLE SKILLS:
                     - hero-split, bento-grid, saas-pricing, center-splash, modular-grid.
                     
                     TASK:
                     1. Calculate the optimal Grid Layout (Columns, Gaps, Margins) for the given ${pageW}px width.
                     1.1. Calculate the optimal Sections distribution (Header, Hero, Features, Testimony, etc) for the given ${pageH}px Height
                     2. Choose the best Expert Agent for this request.
                     3. SELECT SKILL:
                        - IF Auto Skill Mode is ENABLED: Choose the most appropriate skill from the list, or null if custom layout is better.
                        - IF Auto Skill Mode is DISABLED: YOU MUST RETURN the 'Manual Skill Selection' value (which is "${templateSkillId || 'null'}"). Do not override the user.
                     
                     OUTPUT JSON ONLY:
                     {
                        "agentId": "string (one of available agents)",
                        "skillId": "string (one of available skills or null)",
                        "layoutAdvice": "string (Strict CSS instructions. E.g. 'Use grid-template-columns: repeat(12, 1fr) with 24px gap. Main container max-width: 1200px.')"
                     }`;

                      try {
                          console.log("[GM] Consulting Grid Master...");
                          const gmResponse = await queryAI(gmSystemPrompt, "Analyze and Plan.", undefined, true);
                          
                          // Safe JSON parsing for GM response
                          let parsedGM: any = {};
                          try {
                              const cleanGmJson = gmResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                              parsedGM = JSON.parse(cleanGmJson);
                          } catch (parseErr: any) {
                              console.warn("[GM] Failed to parse GM response, using defaults:", parseErr.message);
                              // Try to extract just the agentId using regex as fallback
                              const agentMatch = gmResponse.match(/"agentId"\s*:\s*"([^"]+)"/);
                              if (agentMatch) parsedGM.agentId = agentMatch[1];
                          }
                          
                          if (parsedGM.agentId) gmPlan.agentId = parsedGM.agentId;
                          if (parsedGM.skillId) gmPlan.skillId = parsedGM.skillId;
                          if (parsedGM.layoutAdvice) gmPlan.layoutAdvice = parsedGM.layoutAdvice;
                          
                          console.log("[GM] Plan:", gmPlan);
                          
                          // ============================================================
                          // AUTO-ADJUST PAGE SIZE BASED ON AGENT TYPE
                          // ============================================================
                          // If GM selects a device-specific agent, adjust page size automatically
                          const agentId = gmPlan.agentId || parsedGM.agentId;
                          
                          if (agentId === 'hud' || agentId === 'mobile' || agentId === 'os' || agentId === 'dashboard') {
                              // Define appropriate page sizes for different device types
                              const devicePageSizes: Record<string, { width: number; height: number; name: string }> = {
                                  // HUD / Sci-Fi interfaces - typically wider aspect ratio
                                  'hud': { width: 1920, height: 1080, name: 'HUD Display' },
                                  // Mobile - tall portrait ratio
                                  'mobile': { width: 375, height: 812, name: 'Mobile Screen' },
                                  // OS / Desktop - standard desktop ratio  
                                  'os': { width: 1920, height: 1080, name: 'Desktop' },
                                  // Dashboard - data-heavy, wider
                                  'dashboard': { width: 1440, height: 900, name: 'Dashboard' }
                              };
                              
                              const newSize = devicePageSizes[agentId];
                              if (newSize && (projectSettings.pageSize.width !== newSize.width || projectSettings.pageSize.height !== newSize.height)) {
                                  console.log(`[GM] Auto-adjusting page size for ${newSize.name}: ${newSize.width}x${newSize.height}`);
                                  updateProjectSettings({
                                      pageSize: { width: newSize.width, height: newSize.height },
                                      viewportSize: { width: Math.min(newSize.width, 1200), height: Math.min(newSize.height, 800) }
                                  });
                                  
                                  // Update layout advice to reflect new dimensions
                                  gmPlan.layoutAdvice = `${newSize.name} optimized (${newSize.width}x${newSize.height}). ` + (gmPlan.layoutAdvice || '');
                              }
                          }
                      } catch (e) {
                          console.warn("[GM] Planning failed, proceeding with defaults.", e);
                      }
                 } else {
                     console.log("[GM] Grid Master disabled. Using direct execution.");
                 }

                   // ============================================================
                   // STEP 2: ORCHESTRATED EXECUTION
                   // ============================================================
                   let systemInstruction: string;
                   
                   if (isLocal) {
                     // ============================================================
                     // LOCAL MODEL: Use section-by-section generation (prevents truncation)
                      // ============================================================
                      console.log("[AI] Using section-by-section generation for local model...");
                      console.log("[AI] Skill:", gmPlan.skillId || "none");
                      
                      // Use Orchestrator to get proper section prompts with theme coherency
                      const sectionPrompts = Orchestrator.getSectionPrompts({
                          expertMode: expertMode,
                          projectSettings: projectSettings,
                          isLocal: true,
                          targetDimensions: targetDimensions,
                          requiredSkillId: gmPlan.skillId,
                          layoutAdvice: gmPlan.layoutAdvice,
                          hardwareLevel: hardwareLevel
                      });
                      
                      // Convert to format expected by generateSectionsSequentially
                      const sections = sectionPrompts.map(s => ({ 
                          name: s.name, 
                          instruction: s.instruction,
                          isBackground: s.isBackground 
                      }));
                      
                      try {
                         await generateSectionsSequentially(sections, effectiveId);
                         console.log("[AI] Section-by-section generation complete!");
                         setIsGenerating(false);
                         return;
                      } catch (sectionErr: any) {
                         console.warn("[AI] Section generation failed, falling back to single generation:", sectionErr.message);
                         // Fall through to single generation if sequential fails
                      }
                    } 
                    
                    // Cloud models or fallback: Use single generation
                    if (isLocal) {
                        // For fallback, use orchestrator's cloud prompt (simpler for local fallback)
                        systemInstruction = Orchestrator.generateSystemPrompt(
                            expertMode, 
                            projectSettings, 
                            true, 
                            targetDimensions, 
                            gmPlan.skillId,
                            gmPlan.layoutAdvice
                        );
                    } else {
                      // Full prompt for cloud models
                      systemInstruction = Orchestrator.generateSystemPrompt(
                        gmPlan.agentId as ExpertMode, 
                        projectSettings, 
                        isLocal, 
                        targetDimensions, 
                        gmPlan.skillId,
                        gmPlan.layoutAdvice // Inject GM's math (if available)
                      );
                    }
                  
                   console.log("[AI] Calling model with prompt...");
                   
                   try {
                       responseText = await queryAI(systemInstruction, `User Request: "${prompt}"`, imageContext, true);
                   } catch (queryErr: any) {
                       console.error("[AI] Query failed:", queryErr.message);
                       responseText = '';
                   }
                   
                   console.log("[AI] Response received, length:", responseText?.length || 0);

                   if (responseText && responseText.length > 0) {
                       try {
                           // Clean and parse JSON
                           let cleanJson = responseText
                               .replace(/```json/g, '')
                               .replace(/```/g, '')
                               .replace(/^```/g, '')
                               .replace(/```$/g, '')
                               .trim();
                           
                           // Handle cases where AI wraps JSON in quotes
                           if (cleanJson.startsWith('"') && cleanJson.endsWith('"')) {
                               cleanJson = cleanJson.slice(1, -1);
                               // Unescape JSON
                               cleanJson = cleanJson.replace(/\\n/g, '\n').replace(/\\"/g, '"');
                           }
                           
                            // FIX: Handle unterminated strings and incomplete JSON
                            let parsed: any;
                            try {
                                parsed = JSON.parse(cleanJson);
                            } catch (parseError: any) {
                                // Try to fix unterminated strings by finding the last complete object
                                console.warn('[AI] JSON parse issue, attempting to fix:', parseError.message);
                                
                                // Try to extract valid JSON array or object
                                let lastBrace = cleanJson.lastIndexOf('}');
                                let lastBracket = cleanJson.lastIndexOf(']');
                                let lastComplete = Math.max(lastBrace, lastBracket);
                                
                                // If response ends abruptly (no closing bracket), try harder
                                if (lastComplete < cleanJson.length - 10) {
                                    // Find the last complete top-level object by counting braces
                                    let braceCount = 0;
                                    let inString = false;
                                    let escape = false;
                                    for (let i = cleanJson.length - 1; i >= 0; i--) {
                                        const char = cleanJson[i];
                                        if (escape) {
                                            escape = false;
                                            continue;
                                        }
                                        if (char === '\\') {
                                            escape = true;
                                            continue;
                                        }
                                        if (char === '"') {
                                            inString = !inString;
                                            continue;
                                        }
                                        if (inString) continue;
                                        
                                        if (char === '}') braceCount++;
                                        if (char === '{') braceCount--;
                                        if (char === ']') braceCount++;
                                        if (char === '[') braceCount--;
                                        
                                        if (braceCount === 0 && (char === '}' || char === ']')) {
                                            lastComplete = i;
                                            break;
                                        }
                                    }
                                }
                                
                                if (lastComplete > 0) {
                                    const fixedJson = cleanJson.substring(0, lastComplete + 1);
                                    try {
                                        parsed = JSON.parse(fixedJson);
                                        console.warn('[AI] Fixed incomplete JSON by trimming');
                                    } catch {
                                        // If that fails, try to find the first complete object in array
                                        const arrayMatch = cleanJson.match(/\[[\s\S]*\{[\s\S]*\}[\s\S]*\]/);
                                        if (arrayMatch) {
                                            try {
                                                parsed = JSON.parse(arrayMatch[0]);
                                                console.warn('[AI] Extracted partial array from response');
                                            } catch {
                                                throw new Error('Unable to parse JSON');
                                            }
                                        } else {
                                            throw new Error('Unable to fix incomplete JSON');
                                        }
                                    }
                                } else {
                                    throw new Error('Unable to parse JSON');
                                }
                            }
                           
                           // Handle various response formats
                           if (!Array.isArray(parsed)) {
                               if (parsed.children) {
                                   parsed = [parsed];
                               } else if (parsed.type) {
                                   parsed = [parsed];
                               } else if (parsed.elements) {
                                   parsed = parsed.elements;
                               } else if (parsed.result) {
                                   parsed = parsed.result;
                               } else {
                                   // Wrap single object in array
                                   parsed = [parsed];
                               }
                           }
                           
                           // Ensure we have an array
                           if (!Array.isArray(parsed)) {
                               parsed = [parsed];
                           }
                           
                            // Apply fixes ALWAYS - don't log pre-fix validation (we know AI makes mistakes)
                            const beforeFix = JSON.stringify(parsed).slice(0, 100);
                            parsed = fixCommonIssues(parsed);
                            const afterFix = JSON.stringify(parsed).slice(0, 100);
                            
                            // Debug: log if fix was applied
                            if (beforeFix !== afterFix) {
                                console.log('[AI] Applied auto-fixes to response');
                            }
                            
                            // Only log if there are STILL issues after fixing
                            const revalidation = validateAIResponse(parsed);
                            if (!revalidation.valid) {
                                console.warn('[AI] Some issues remain after auto-fix:', revalidation.errors);
                            }
                           
                           await buildUITree(effectiveId, parsed);
                       } catch (e: any) {
                           console.warn("Failed to parse AI response:", e.message);
                           // Try emergency fallback - create a simple container
                          console.warn('[AI] Creating fallback element due to parse failure');
                          const fallbackElement = [{
                              type: 'container',
                              name: 'AI Generated',
                              props: {},
                              style: { display: 'flex', width: 200, height: 100, padding: 20 },
                              children: []
                          }];
                          await buildUITree(effectiveId, fallbackElement);
                       }
                  } else {
                      // Empty response - create fallback element
                      console.warn('[AI] Empty response from model, creating fallback');
                      const fallbackElement = [{
                          type: 'container',
                          name: 'AI Generated',
                          props: {},
                          style: { display: 'flex', width: 200, height: 100, padding: 20 },
                          children: []
                      }];
                      await buildUITree(effectiveId, fallbackElement);
                  }

            } else {
                // Leaf Node Update (Simple)
                const systemInstruction = `You are a UI Component Specialist.
                Current Component Context: ${contextStr}.
                Task: Update the 'props' and 'style'. Return JSON object with keys 'props' and 'style'.
                `;
                responseText = await queryAI(systemInstruction, `User Request: "${prompt}"`, imageContext, true);

                if (responseText) {
                    try {
                        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
                        const data = JSON.parse(cleanJson);
                        const propsToUpdate = data.props || (data.style ? undefined : data);
                        // Normalize CSS properties from kebab-case to camelCase
                        const styleToUpdate = data.style ? normalizeStyleProperties(data.style) as any : undefined;
                        if (propsToUpdate) updateElementProps(effectiveId, propsToUpdate);
                        if (styleToUpdate) updateElementStyle(effectiveId, styleToUpdate);
                    } catch (e: any) { console.warn("Failed to parse AI response:", e.message); }
                }
            }
        } catch (e: any) { 
            console.warn("AI Generation failed:", e.message); 
        } finally { 
            setIsGenerating(false); 
        }
    }, [googleApiKey, openRouterApiKey, ollamaServerUrl, activeModelId, activeModelProvider, elements, saveToHistory, updateElementProps, updateElementStyle, projectSettings, expertMode, selectElement]);

    // --- REFINED LAYOUT (GRID MASTER) ---
    const refineSelectionLayout = useCallback(async () => {
        if (!selectedId) return;
        setIsGenerating(true);
        saveToHistory('GM Refine Layout');

        const findEl = (list: UIElement[]): UIElement | null => {
            for (const el of list) {
                if (el.id === selectedId) return el;
                if (el.children) { const found = findEl(el.children); if (found) return found; }
            }
            return null;
        };
        const targetEl = findEl(elements);
        if (!targetEl || !targetEl.children || targetEl.children.length === 0) {
            setIsGenerating(false);
            return;
        }

        const childAnalysis = targetEl.children.map(c => ({
            type: c.type,
            name: c.name,
            currentStyle: c.style
        }));

        const systemInstruction = `You are the Grid Master (GM).
        
        TASK:
        Analyze the children of the selected container and determine the BEST Flexbox or Grid properties to organize them cleanly.
        
        INPUT:
        - Children Count: ${targetEl.children.length}
        - Children Data: ${JSON.stringify(childAnalysis)}
        - Parent Current Style: ${JSON.stringify(targetEl.style)}
        
        OUTPUT RULES:
        1. Return a JSON object with a single key "style" containing React CSS properties for the PARENT CONTAINER.
        2. MANDATORY: Set 'display': 'flex' or 'grid'.
        3. MANDATORY: Set 'flexDirection', 'alignItems', 'justifyContent', and 'gap'.
        4. MANDATORY: If children have 'position: absolute', assume they are messy and you should REMOVE that by setting the parent to flex.
        5. DO NOT return children updates, only the parent style.
        
        EXAMPLE OUTPUT:
        { "style": { "display": "flex", "flexDirection": "row", "alignItems": "center", "justifyContent": "space-between", "gap": 24, "padding": 30 } }
        `;

        try {
            const responseText = await queryAI(systemInstruction, "Optimize this layout structure.", undefined, true);
            const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const result = JSON.parse(cleanJson);
            
            if (result.style) {
                // 1. Update Parent Style (with normalized CSS properties)
                updateElementStyle(selectedId, normalizeStyleProperties(result.style) as any);
                
                // 2. Clean Children (Remove absolute positioning to let Flexbox work)
                // We do this manually to ensure immediate effect
                targetEl.children.forEach(child => {
                    const cleanStyle: any = { ...child.style };
                    delete cleanStyle.position;
                    delete cleanStyle.left;
                    delete cleanStyle.top;
                    delete cleanStyle.right;
                    delete cleanStyle.bottom;
                    delete cleanStyle.transform; // Remove transform drags
                    
                    updateElementStyle(child.id, { 
                        position: 'relative', 
                        left: undefined, 
                        top: undefined, 
                        transform: undefined,
                        // Reset margins that might interfere
                        margin: 0
                    });
                });
            }
        } catch (e: any) {
            console.warn("GM Refine failed:", e.message);
        } finally {
            setIsGenerating(false);
        }

    }, [selectedId, elements, queryAI, updateElementStyle, saveToHistory]);

    const generateStyles = useCallback(async (prompt: string, targetId?: string, imageContext?: string) => {
        const activePage = elements.find(el => el.type === 'page' && el.style?.display !== 'none') || elements[0];
        const effectiveId = targetId || selectedId || activePage.id;
        if (!effectiveId) return;
        setIsGenerating(true);
        saveToHistory('AI Styles');
        
        const findEl = (list: UIElement[]): UIElement | null => {
            for (const el of list) {
                if (el.id === effectiveId) return el;
                if (el.children) { const found = findEl(el.children); if (found) return found; }
            }
            return null;
        };
        const targetEl = findEl(elements);
        const currentStyleStr = targetEl ? JSON.stringify(targetEl.style) : "{}";

        try {
            const systemInstruction = `You are a CSS / Design System Expert.
            Current Styles: ${currentStyleStr}.
            Task: output a JSON object of React CSS properties (camelCase) to apply/merge.
            `;
            
            const responseText = await queryAI(systemInstruction, `User Request: "${prompt}"`, imageContext, true);
            
            if (responseText) {
                const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
                const styles = JSON.parse(cleanJson);
                // Normalize CSS properties from kebab-case to camelCase
                updateElementStyle(effectiveId, normalizeStyleProperties(styles) as any);
            }
        } catch (e: any) { console.warn("AI Style failed:", e.message); } finally { setIsGenerating(false); }
    }, [queryAI, updateElementStyle, saveToHistory, selectedId, elements]);

    return { isGenerating, generateContent, generateStyles, refineSelectionLayout };
};
