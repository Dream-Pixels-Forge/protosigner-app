export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, model = 'google/gemini-2.0-flash-exp:free' } = req.body;

  if (!messages) {
    return res.status(400).json({ error: 'Messages are required' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('OpenRouter API Error:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
}
