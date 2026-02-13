// Utility to call Vercel serverless functions
export const callGeminiAPI = async (prompt: string, model = 'gemini-2.0-flash-exp') => {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, model }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate content');
  }

  return response.json();
};

export const callOpenRouterAPI = async (messages: any[], model = 'google/gemini-2.0-flash-exp:free') => {
  const response = await fetch('/api/openrouter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, model }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate content');
  }

  return response.json();
};
