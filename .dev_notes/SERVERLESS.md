# Vercel Serverless Functions Guide

## Overview

ProtoSigner uses Vercel Serverless Functions to securely handle API calls server-side, keeping your API keys safe and never exposing them to the client.

## Architecture

```
Client (Browser)
    ↓
Vercel Serverless Function (/api/*)
    ↓
External API (Gemini/OpenRouter)
```

## Available Endpoints

### 1. `/api/gemini` - Google Gemini AI

**Purpose:** Generate UI components and content using Google Gemini AI

**Method:** POST

**Request Body:**
```json
{
  "prompt": "Create a hero section with a gradient background",
  "model": "gemini-2.0-flash-exp"
}
```

**Response:**
```json
{
  "text": "Generated content here..."
}
```

**Environment Variable Required:**
- `GEMINI_API_KEY`

### 2. `/api/openrouter` - OpenRouter API

**Purpose:** Access multiple AI models through OpenRouter

**Method:** POST

**Request Body:**
```json
{
  "messages": [
    { "role": "system", "content": "You are a UI designer" },
    { "role": "user", "content": "Create a button component" }
  ],
  "model": "google/gemini-2.0-flash-exp:free"
}
```

**Response:**
```json
{
  "choices": [
    {
      "message": {
        "content": "Generated content..."
      }
    }
  ]
}
```

**Environment Variable Required:**
- `OPENROUTER_API_KEY`

## File Structure

```
protosigner-app/
├── api/
│   ├── gemini.js          # Gemini AI endpoint
│   └── openrouter.js      # OpenRouter endpoint
├── services/
│   └── serverless.ts      # Client-side utilities
└── context/
    └── useAI.ts           # AI hook (update to use serverless)
```

## Setup Instructions

### 1. Local Development

Create `.env.local`:
```env
GEMINI_API_KEY=your_key_here
OPENROUTER_API_KEY=your_key_here
```

Run dev server:
```bash
npm run dev
```

Vercel CLI automatically runs serverless functions locally.

### 2. Production Deployment

**Add Environment Variables in Vercel Dashboard:**

1. Go to Project Settings → Environment Variables
2. Add:
   - `GEMINI_API_KEY` = your_gemini_key
   - `OPENROUTER_API_KEY` = your_openrouter_key
3. Select all environments (Production, Preview, Development)
4. Save and redeploy

**Or via CLI:**
```bash
vercel env add GEMINI_API_KEY
vercel env add OPENROUTER_API_KEY
vercel --prod
```

## Usage in Code

### Option 1: Use Utility Functions (Recommended)

```typescript
import { callGeminiAPI, callOpenRouterAPI } from '../services/serverless';

// Gemini
const result = await callGeminiAPI('Create a hero section');
console.log(result.text);

// OpenRouter
const messages = [
  { role: 'system', content: 'You are a UI designer' },
  { role: 'user', content: 'Create a button' }
];
const result = await callOpenRouterAPI(messages);
console.log(result.choices[0].message.content);
```

### Option 2: Direct Fetch

```typescript
const response = await fetch('/api/gemini', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    prompt: 'Create a navbar',
    model: 'gemini-2.0-flash-exp'
  }),
});
const data = await response.json();
```

## Migrating Existing Code

### Before (Direct API Call):
```typescript
const ai = new GoogleGenAI({ apiKey: googleApiKey });
const response = await ai.models.generateContent({
  model: 'gemini-2.0-flash-exp',
  contents: prompt
});
```

### After (Serverless):
```typescript
import { callGeminiAPI } from '../services/serverless';

const response = await callGeminiAPI(prompt, 'gemini-2.0-flash-exp');
const text = response.text;
```

## Benefits

✅ **Security:** API keys never exposed to client  
✅ **Rate Limiting:** Easier to implement server-side  
✅ **Caching:** Can add response caching  
✅ **Monitoring:** Better error tracking and logging  
✅ **Cost Control:** Centralized API usage monitoring  

## Error Handling

```typescript
try {
  const result = await callGeminiAPI(prompt);
  // Handle success
} catch (error) {
  console.error('API Error:', error);
  // Show user-friendly error message
}
```

## Testing Locally

```bash
# Start dev server
npm run dev

# Test endpoint
curl -X POST http://localhost:5173/api/gemini \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello world"}'
```

## Deployment Checklist

- [ ] Environment variables added in Vercel dashboard
- [ ] `.env.local` added to `.gitignore`
- [ ] Serverless functions tested locally
- [ ] Error handling implemented
- [ ] API keys rotated after testing
- [ ] Rate limiting considered
- [ ] Monitoring/logging setup

## Troubleshooting

**Function timeout:**
- Increase timeout in `vercel.json`:
```json
{
  "functions": {
    "api/**/*.js": {
      "maxDuration": 30
    }
  }
}
```

**CORS errors:**
- Vercel automatically handles CORS for same-origin requests
- For external domains, add headers in function response

**Environment variables not working:**
- Ensure variables are set for correct environment
- Redeploy after adding variables
- Check variable names match exactly

## Advanced Configuration

### Add Rate Limiting

```javascript
// api/gemini.js
const rateLimit = new Map();

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const now = Date.now();
  const limit = rateLimit.get(ip);
  
  if (limit && now - limit < 1000) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  
  rateLimit.set(ip, now);
  // ... rest of function
}
```

### Add Response Caching

```javascript
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  // ... rest of function
}
```

## Resources

- [Vercel Serverless Functions Docs](https://vercel.com/docs/functions)
- [Environment Variables Guide](https://vercel.com/docs/environment-variables)
- [Edge Functions vs Serverless](https://vercel.com/docs/functions/edge-functions)

---

**Need Help?** Open an issue on GitHub or contact support@protosigner.com
