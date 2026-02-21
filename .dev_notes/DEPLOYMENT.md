# Deployment Guide

## Deploying ProtoSigner to Vercel

### Prerequisites
- GitHub/GitLab/Bitbucket account
- Vercel account ([Sign up free](https://vercel.com/signup))
- Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey))
- OpenRouter API Key (optional, [Get one here](https://openrouter.ai/keys))

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Push to Git Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/Dream-Pixels-Forge/protosigner-app.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your repository
   - Vercel will auto-detect Vite configuration

3. **Configure Environment Variables**
   - Click "Environment Variables"
   - Add `GEMINI_API_KEY` with your API key
   - Add `OPENROUTER_API_KEY` (optional)
   - Select all environments (Production, Preview, Development)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app will be live at `https://your-project.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - Link to existing project or create new one

4. **Add Environment Variables**
   ```bash
   vercel env add GEMINI_API_KEY
   ```
   - Paste your API key when prompted
   - Select all environments

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Method 3: One-Click Deploy

Click the button below and follow the prompts:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/protosigner-app)

### Serverless Functions

ProtoSigner uses Vercel Serverless Functions for secure API calls:

**Endpoints:**
- `/api/gemini` - Google Gemini AI
- `/api/openrouter` - OpenRouter API

**Benefits:**
- API keys never exposed to client
- Better security and rate limiting
- Centralized error handling

See [SERVERLESS.md](./SERVERLESS.md) for complete documentation.

### Post-Deployment

1. **Custom Domain** (Optional)
   - Go to Project Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

2. **Environment Variables Management**
   - Go to Project Settings → Environment Variables
   - Update or add new variables as needed
   - Redeploy for changes to take effect

3. **Automatic Deployments**
   - Every push to `main` branch triggers production deployment
   - Pull requests create preview deployments automatically

### Troubleshooting

**Build Fails**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

**Environment Variables Not Working**
- Ensure variables are prefixed correctly (Vite uses `VITE_` prefix for client-side)
- Redeploy after adding/updating variables
- Check variable names match exactly

**404 Errors on Routes**
- Verify `vercel.json` rewrites configuration
- Ensure SPA routing is properly configured

### Performance Optimization

- Enable Edge Caching in Vercel settings
- Use Vercel Analytics for monitoring
- Enable Vercel Speed Insights

### Security

- Never commit `.env.local` to Git
- Rotate API keys regularly
- Use Vercel's environment variable encryption
- Enable Vercel's DDoS protection

### Monitoring

- View deployment logs: `vercel logs`
- Check analytics in Vercel dashboard
- Set up error tracking (Sentry, etc.)

### Rollback

If deployment fails:
```bash
vercel rollback
```

Or use the Vercel dashboard to redeploy a previous version.

---

For more information, visit [Vercel Documentation](https://vercel.com/docs)
