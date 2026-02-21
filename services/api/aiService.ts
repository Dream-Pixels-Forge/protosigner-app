/**
 * AI Provider Configuration
 */
export interface AIProvider {
  id: 'gemini' | 'openrouter' | 'openai';
  name: string;
  apiKey?: string;
  endpoint: string;
  model: string;
  maxTokens: number;
  enabled: boolean;
}

export interface GenerationConfig {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export interface GenerationResult {
  success: boolean;
  elements?: any[];
  message?: string;
  error?: string;
  provider: string;
  model: string;
  tokensUsed?: number;
}

/**
 * Default provider configurations
 */
export const DEFAULT_PROVIDERS: AIProvider[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    endpoint: '/api/ai/gemini',
    model: 'gemini-2.0-flash',
    maxTokens: 8192,
    enabled: true,
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    endpoint: '/api/ai/openrouter',
    model: 'anthropic/claude-3.5-sonnet',
    maxTokens: 4096,
    enabled: false,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    endpoint: '/api/ai/openai',
    model: 'gpt-4o',
    maxTokens: 4096,
    enabled: false,
  },
];

/**
 * Default generation config
 */
export const DEFAULT_CONFIG: GenerationConfig = {
  temperature: 0.7,
  maxTokens: 4096,
  topP: 0.9,
  frequencyPenalty: 0.5,
  presencePenalty: 0.5,
};

/**
 * Generate UI from prompt using best available provider
 */
export async function generateUI(
  prompt: string,
  config: Partial<GenerationConfig> = {},
  providers: AIProvider[] = DEFAULT_PROVIDERS
): Promise<GenerationResult> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Try providers in order
  for (const provider of providers.filter(p => p.enabled)) {
    try {
      const result = await callProvider(provider, prompt, finalConfig);
      if (result.success) {
        return result;
      }
    } catch (error) {
      console.warn(`Provider ${provider.id} failed:`, error);
      // Continue to next provider
    }
  }
  
  return {
    success: false,
    error: 'All AI providers failed to generate a response',
    provider: 'none',
    model: 'none',
  };
}

/**
 * Call specific AI provider
 */
async function callProvider(
  provider: AIProvider,
  prompt: string,
  config: GenerationConfig
): Promise<GenerationResult> {
  const response = await fetch(provider.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      config,
      model: provider.model,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Provider ${provider.id} returned ${response.status}`);
  }
  
  return response.json();
}

/**
 * Optimize prompt for better AI results
 */
export async function optimizePrompt(prompt: string): Promise<string> {
  const response = await fetch('/api/ai/optimize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  
  if (!response.ok) {
    return prompt;
  }
  
  const result = await response.json();
  return result.optimizedPrompt || prompt;
}

/**
 * Generate accessibility-compliant UI
 */
export async function generateAccessibleUI(
  prompt: string,
  wcagLevel: 'A' | 'AA' | 'AAA' = 'AA'
): Promise<GenerationResult> {
  const accessibilityPrompt = `${prompt}. Ensure WCAG ${wcagLevel} compliance: 
  - Proper color contrast ratios
  - Keyboard navigable elements
  - ARIA labels and roles
  - Focus indicators
  - Screen reader friendly structure
  - Semantic HTML elements`;
  
  return generateUI(accessibilityPrompt);
}

/**
 * Generate UI variants
 */
export async function generateVariants(
  prompt: string,
  count: number = 3,
  creativeRange: 'refine' | 'explore' | 'reimagine' = 'explore'
): Promise<GenerationResult[]> {
  const results: GenerationResult[] = [];
  
  for (let i = 0; i < count; i++) {
    const variantPrompt = `${prompt}. Create variant ${i + 1} of ${count}. 
    ${creativeRange === 'refine' ? 'Make subtle improvements.' : 
      creativeRange === 'explore' ? 'Explore different design directions.' : 
      'Completely reimagine the design.'}`;
    
    const result = await generateUI(variantPrompt);
    results.push(result);
  }
  
  return results;
}

/**
 * Get available providers
 */
export function getAvailableProviders(): AIProvider[] {
  return DEFAULT_PROVIDERS.filter(p => p.enabled);
}

/**
 * Check if provider is available
 */
export async function checkProviderHealth(providerId: string): Promise<boolean> {
  try {
    const provider = DEFAULT_PROVIDERS.find(p => p.id === providerId);
    if (!provider) return false;
    
    const response = await fetch(`${provider.endpoint}/health`, {
      method: 'GET',
    });
    
    return response.ok;
  } catch {
    return false;
  }
}
