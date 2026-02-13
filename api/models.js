const { GoogleGenerativeAI } = require('@google/genai');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(200).json({ models: [] });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const models = await genAI.listModels();
    
    const formattedModels = models
      .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
      .map(m => ({
        id: m.name.replace('models/', ''),
        name: m.displayName || m.name,
        description: m.description,
        inputTokenLimit: m.inputTokenLimit,
        outputTokenLimit: m.outputTokenLimit
      }));

    res.status(200).json({ models: formattedModels });
  } catch (error) {
    console.error('Failed to fetch models:', error);
    res.status(200).json({ models: [] });
  }
};
