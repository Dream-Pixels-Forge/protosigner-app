
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { UIElement, ProjectSettings, AIProvider, ExpertMode } from '../types';
import { sleep, insertNodeIntoParent, updateElementRecursively } from './utils';
import { getSpectralSystemInstruction } from '../features/ai/prompts';

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

            const newElement: UIElement = {
                id: newId, 
                type: type || 'container', 
                name: name || 'AI Component', 
                props: props || {},
                style: safeStyle, 
                children: [], 
                isExpanded: true, 
                isLocked: false
            };
            setElements(prev => insertNodeIntoParent(prev, parentId, newElement));
            await sleep(80);
            setElements(prev => updateElementRecursively(prev, newId, (el) => ({ ...el, style: { ...el.style, opacity: 1 } })));
            
            if (children && children.length > 0) {
                await buildUITree(newId, children);
            }
            await sleep(40);
        }
    };

    // Helper to fetch from Standard OpenAI Compatible API (OpenRouter/Ollama)
    const fetchOpenAICompatible = async (
        url: string, 
        key: string, 
        model: string, 
        system: string, 
        prompt: string,
        jsonMode: boolean = false,
        imageContext?: string
    ): Promise<string> => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        if (key) headers['Authorization'] = `Bearer ${key}`;
        
        // OpenRouter requires explicit referral
        if (url.includes('openrouter')) {
             headers['HTTP-Referer'] = 'https://protosigner.pro';
             headers['X-Title'] = 'Protosigner';
        }

        let userContent: any = prompt;
        if (imageContext) {
            userContent = [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: imageContext } }
            ];
        }

        const body: any = {
            model: model,
            messages: [
                { role: 'system', content: system },
                { role: 'user', content: userContent }
            ],
            stream: false
        };

        if (jsonMode) {
             if (url.includes('localhost') || url.includes('127.0.0.1')) {
                 body.format = 'json';
             } else {
                 if (model.includes('gpt')) {
                     body.response_format = { type: 'json_object' };
                 }
             }
        }

        const res = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`AI Provider Error: ${err}`);
        }

        const data = await res.json();
        return data.choices?.[0]?.message?.content || data.message?.content || '';
    };

    const generateContent = useCallback(async (prompt: string, targetId?: string, imageContext?: string, templateStructure?: any, createNewPage: boolean = false) => {
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

            // Add new page and switch visibility
            setElements(prev => {
                const hiddenPrev = prev.map(el => el.type === 'page' ? { ...el, style: { ...el.style, display: 'none' } } : el);
                return [...hiddenPrev, newPage];
            });
            
            // Switch selection to new page
            selectElement(newPageId);
            effectiveId = newPageId;
            targetEl = newPage;
            
            // Slight delay to allow state to settle conceptually (though we use targetEl directly)
            await sleep(50);
        } else {
            // Standard lookup
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
            let responseText = '';
            
            // --- IMAGE GENERATION ---
            // Only allowed in Cloud mode (Provider check implicitly handles this, but explicit check implies intention)
            if (targetEl.type === 'image' && !imageContext && activeModelProvider === 'Google') {
                const ai = new GoogleGenAI({ apiKey: googleApiKey });
                // Correctly use generateContent to generate images with Nano Banana
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-preview-0514', 
                    contents: { parts: [{ text: prompt }] },
                    config: {
                        imageConfig: { aspectRatio: "1:1" }
                    }
                });

                let imageUrl = '';
                // Check all parts for image data
                if (response.candidates?.[0]?.content?.parts) {
                    for (const part of response.candidates[0].content.parts) {
                        if (part.inlineData) {
                            const base64EncodeString = part.inlineData.data;
                            imageUrl = `data:${part.inlineData.mimeType};base64,${base64EncodeString}`;
                            break;
                        }
                    }
                }

                if (imageUrl) {
                    updateElementProps(effectiveId, { src: imageUrl, alt: prompt });
                }
                return; 
            }

            // --- UI GENERATION ---
            const isContainer = ['page', 'section', 'container', 'box', 'frame', 'grid'].includes(targetEl.type);
            const isLocal = activeModelProvider === 'Ollama';
            
            if (isContainer) {
                 // --- 1. SYSTEM INSTRUCTION VIA SPECTRAL AGENT ---
                 // PASS targetDimensions to SpectralAgent
                 let systemInstruction = getSpectralSystemInstruction(expertMode, projectSettings, isLocal, targetDimensions);
                 
                 // --- 2. TEMPLATE INJECTION ---
                 let userPrompt = `User Request: "${prompt}".`;
                 
                 if (templateStructure) {
                     systemInstruction += `\n\nIMPORTANT: Use the following WIREFRAME TEMPLATE as the strict skeleton of your response. 
                     TEMPLATE SKELETON: ${JSON.stringify(templateStructure)}
                     `;
                     userPrompt += " Populate the provided template skeleton.";
                 } else {
                     userPrompt += " Create a layout from scratch.";
                 }

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
                            systemInstruction: systemInstruction,
                            responseMimeType: 'application/json' 
                        }
                    });
                    responseText = response.text || '';
                 } else if (activeModelProvider === 'OpenRouter') {
                     responseText = await fetchOpenAICompatible(
                        'https://openrouter.ai/api/v1/chat/completions',
                        openRouterApiKey,
                        activeModelId,
                        systemInstruction,
                        userPrompt,
                        true,
                        imageContext
                     );
                 } else if (activeModelProvider === 'Ollama') {
                     responseText = await fetchOpenAICompatible(
                         `${ollamaServerUrl}/v1/chat/completions`,
                         '',
                         activeModelId,
                         systemInstruction,
                         userPrompt,
                         true, // force JSON
                         imageContext
                     );
                 }
                
                if (responseText) {
                    try {
                        let cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
                        // Remove trailing commas before closing brackets
                        cleanJson = cleanJson.replace(/,\s*([}\]])/g, '$1');
                        // Handle case where AI wraps array in object
                        let parsed = JSON.parse(cleanJson);
                        if (!Array.isArray(parsed) && parsed.children) parsed = [parsed];
                        if (!Array.isArray(parsed) && parsed.type) parsed = [parsed];
                        
                        await buildUITree(effectiveId, parsed);
                    } catch (e) {
                        console.error("Failed to parse AI response", e);
                    }
                }

            } else {
                // Leaf Node Update (existing logic)
                const systemInstruction = `You are a UI Component Specialist.
                Current Component Context: ${contextStr}.
                Task: Update the 'props' and 'style'. Return JSON object with keys 'props' and 'style'.
                `;
                
                const userPrompt = `User Request: "${prompt}".`;

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
                        config: { systemInstruction, responseMimeType: 'application/json' }
                    });
                    responseText = response.text || '';
                } else if (activeModelProvider === 'OpenRouter') {
                    responseText = await fetchOpenAICompatible('https://openrouter.ai/api/v1/chat/completions', openRouterApiKey, activeModelId, systemInstruction, userPrompt, true, imageContext);
                } else if (activeModelProvider === 'Ollama') {
                    responseText = await fetchOpenAICompatible(`${ollamaServerUrl}/v1/chat/completions`, '', activeModelId, systemInstruction, userPrompt, true, imageContext);
                }

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

    const generateStyles = useCallback(async (prompt: string, targetId?: string, imageContext?: string) => {
        // Reuse existing style generation logic
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
            const userPrompt = `User Request: "${prompt}".`;
            let responseText = '';

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
                    model: activeModelId, contents: contentsPayload, config: { systemInstruction, responseMimeType: 'application/json' }
                });
                responseText = response.text || '';
            } else if (activeModelProvider === 'OpenRouter') {
                responseText = await fetchOpenAICompatible('https://openrouter.ai/api/v1/chat/completions', openRouterApiKey, activeModelId, systemInstruction, userPrompt, true, imageContext);
            } else if (activeModelProvider === 'Ollama') {
                responseText = await fetchOpenAICompatible(`${ollamaServerUrl}/v1/chat/completions`, '', activeModelId, systemInstruction, userPrompt, true, imageContext);
            }
            if (responseText) {
                const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
                const styles = JSON.parse(cleanJson);
                updateElementStyle(effectiveId, styles);
            }
        } catch (e) { console.error("AI Style failed", e); } finally { setIsGenerating(false); }
    }, [googleApiKey, openRouterApiKey, ollamaServerUrl, activeModelId, activeModelProvider, updateElementStyle, saveToHistory, selectedId, elements]);

    return { isGenerating, generateContent, generateStyles };
};
