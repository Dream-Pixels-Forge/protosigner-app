# Quick Start: Serverless Functions

## Setup (2 minutes)

1. **Add API Keys to Vercel:**
   ```bash
   vercel env add GEMINI_API_KEY
   vercel env add OPENROUTER_API_KEY
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

## Usage

```typescript
import { callGeminiAPI } from './services/serverless';

// Generate content
const result = await callGeminiAPI('Create a hero section');
console.log(result.text);
```

## Endpoints

- `POST /api/gemini` - Gemini AI
- `POST /api/openrouter` - OpenRouter

## Full Documentation

See [SERVERLESS.md](./SERVERLESS.md) for complete guide.
