
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { UIElement, ProjectSettings, AIProvider, ExpertMode } from '../types';
import { sleep, insertNodeIntoParent, updateElementRecursively } from './utils';
import { Orchestrator } from '../features/ai/orchestrator';
import { ensureImageSource } from './imageUtils';

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
    expertMode
}: UseAIProps) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const buildUITree = async (parentId: string, nodes: any[]) => {
        const nodeList = Array.isArray(nodes) ? nodes : [nodes];
        
        for (const node of nodeList) {
            const newId = Math.random().toString(36).substr(2, 9);
            const { type, name, props, style, children } = node;
            
            // Force strict defaults for visibility
            const safeStyle = {
                boxSizing: 'border-box', // Crucial for 1:1 sizing
                ...style,
                opacity: 0, 
                transition: 'opacity 0.5s ease-out'
            };

            // Ensure image elements have a source
            const processedProps = type === 'image' && (!props || !props.src) 
                ? { ...props, src: `/assets/1 (${Math.floor(Math.random() * 10) + 1}).jpg`, alt: props?.alt || 'Image' }
                : props || {};

            const newElement: UIElement = {
                id: newId, 
                type: type || 'container', 
                name: name || 'AI Component', 
                props: processedProps,
                style: safeStyle, 
                children: [], 
                isExpanded: true, 
                isLocked: false
            };
            setElements(prev => insertNodeIntoParent(prev, parentId, newElement));
            await sleep(80);
            setElements(prev => updateElementRecursively(prev, newId, (el) => ({ ...el, style: { ...el.style, opacity: 1 } })));
            
            // Process children with image fallback
            if (children && children.length > 0) {
                // Ensure all children images have sources
                const processedChildren = children.map((child: any) => {
                    if (child.type === 'image' && (!child.props || !child.props.src)) {
                        return {
                            ...child,
                            props: {
                                ...child.props,
                                src: `/assets/1 (${Math.floor(Math.random() * 10) + 1}).jpg`,
                                alt: child.props?.alt || 'Image'
                            }
                        };
                    }
                    return child;
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
            return data.choices?.[0]?.message?.content || data.message?.content || '';
        }
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
        const fixElement = (el: any): any => {
            const fixed = { ...el };
            
            // Fix string pixels to numbers
            if (fixed.style) {
                ['width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight', 'fontSize', 'gap', 'padding', 'margin'].forEach(prop => {
                    if (typeof fixed.style[prop] === 'string' && fixed.style[prop].includes('px')) {
                        const num = parseInt(fixed.style[prop]);
                        if (!isNaN(num)) fixed.style[prop] = num;
                    }
                });
                
                // Fix percentage strings that should be numbers
                if (typeof fixed.style.width === 'string' && fixed.style.width.includes('%')) {
                    // Keep percentage as string, that's valid
                }
            }
            
            // Fix children recursively
            if (fixed.children && Array.isArray(fixed.children)) {
                fixed.children = fixed.children.map(fixElement);
            }
            
            return fixed;
        };
        
        if (Array.isArray(data)) {
            return data.map(fixElement);
        }
        return fixElement(data);
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
                         const parsedGM = JSON.parse(gmResponse.replace(/```json/g, '').replace(/```/g, '').trim());
                         
                         if (parsedGM.agentId) gmPlan.agentId = parsedGM.agentId;
                         if (parsedGM.skillId) gmPlan.skillId = parsedGM.skillId;
                         if (parsedGM.layoutAdvice) gmPlan.layoutAdvice = parsedGM.layoutAdvice;
                         
                         console.log("[GM] Plan:", gmPlan);
                     } catch (e) {
                         console.warn("[GM] Planning failed, proceeding with defaults.", e);
                     }
                 } else {
                     console.log("[GM] Grid Master disabled. Using direct execution.");
                 }

                 // ============================================================
                 // STEP 2: ORCHESTRATED EXECUTION
                 // ============================================================
                 const systemInstruction = Orchestrator.generateSystemPrompt(
                    gmPlan.agentId as ExpertMode, 
                    projectSettings, 
                    isLocal, 
                    targetDimensions, 
                    gmPlan.skillId,
                    gmPlan.layoutAdvice // Inject GM's math (if available)
                 );
                 
                 responseText = await queryAI(systemInstruction, `User Request: "${prompt}"`, imageContext, true);

                  if (responseText) {
                     try {
                         const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
                         let parsed = JSON.parse(cleanJson);
                         if (!Array.isArray(parsed) && parsed.children) parsed = [parsed];
                         if (!Array.isArray(parsed) && parsed.type) parsed = [parsed];
                         
                         // VALIDATE RESPONSE
                         const validation = validateAIResponse(parsed);
                         if (!validation.valid) {
                             console.error('[AI Validation Failed]', validation.errors);
                             // Try to fix common issues
                             parsed = fixCommonIssues(parsed);
                         }
                         
                         await buildUITree(effectiveId, parsed);
                     } catch (e) {
                         console.error("Failed to parse AI response", e);
                     }
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
                        const styleToUpdate = data.style;
                        if (propsToUpdate) updateElementProps(effectiveId, propsToUpdate);
                        if (styleToUpdate) updateElementStyle(effectiveId, styleToUpdate);
                    } catch (e) { console.error("Failed to parse AI response", e); }
                }
            }
        } catch (e) { 
            console.error("AI Generation failed", e); 
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
                // 1. Update Parent Style
                updateElementStyle(selectedId, result.style);
                
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
        } catch (e) {
            console.error("GM Refine failed", e);
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
                updateElementStyle(effectiveId, styles);
            }
        } catch (e) { console.error("AI Style failed", e); } finally { setIsGenerating(false); }
    }, [queryAI, updateElementStyle, saveToHistory, selectedId, elements]);

    return { isGenerating, generateContent, generateStyles, refineSelectionLayout };
};
