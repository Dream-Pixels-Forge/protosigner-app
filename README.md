<div align="center">

<img width="1920" height="990" alt="Screenshot 2026-02-13 065607" src="https://github.com/user-attachments/assets/f9502d7c-eb93-4c15-8108-83dcc73cdc8b" />

# ProtoSigner

**AI-Powered UI Builder for React Components**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Dream-Pixels-Forge/protosigner-app)

[Live Demo](https://protosigner-app.vercel.app) •  • [Report Bug](https://github.com/Dream-Pixels-Forge/protosigner-app/issues)

</div>

---

## 🚀 Overview

ProtoSigner is a high-fidelity, AI-powered visual UI builder that enables designers and developers to create React components through an intuitive interface combined with natural language prompts. Design, iterate, and export production-ready code—all in one place.

<img width="1920" height="997" alt="Screenshot 2026-02-13 114309" src="https://github.com/user-attachments/assets/20925754-b58f-4d42-9d58-e76cae8ac59d" />


## ✨ Features

- 🎨 **Visual Canvas Editor** - Drag, drop, and design with precision
- 🤖 **AI-Powered Design** - Generate UI components using natural language prompts
- 📐 **Layer Management** - Organize and structure your design hierarchy
- 🎯 **Property Inspector** - Fine-tune every element with detailed controls
- 📱 **Responsive Design** - Multiple viewport sizes and page formats
- 💾 **History & Undo** - Track and revert changes effortlessly
- 📤 **Code Export** - Generate clean React/HTML/CSS code
- 🎬 **After Effects Export** - Export designs for motion graphics
- ⌨️ **Keyboard Shortcuts** - Boost productivity with hotkeys
- 🎨 **Design Guides** - Built-in grid and alignment tools

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **AI:** Google Gemini AI, OpenRouter
- **Backend:** Vercel Serverless Functions
- **Build Tool:** Vite
- **Deployment:** Vercel

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey))

## 🏃 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Dream-Pixels-Forge/protosigner-app.git
   cd protosigner-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create or update `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   OPENROUTER_API_KEY=your_openrouter_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 🌐 Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Dream-Pixels-Forge/protosigner-app)

### Manual Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set Environment Variables**
   
   In your Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add `GEMINI_API_KEY` with your API key
   - Add `OPENROUTER_API_KEY` (optional)

4. **Redeploy**
   ```bash
   vercel --prod
   ```

### Environment Variables for Vercel

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key for AI features |
| `OPENROUTER_API_KEY` | No | OpenRouter API key for additional AI models |

## 📖 Usage

### Creating Designs

1. **Use AI Prompts** - Type natural language descriptions in the prompt bar
2. **Manual Design** - Click elements in the toolbar and place them on canvas
3. **Edit Properties** - Select elements and modify in the properties panel
4. **Layer Management** - Organize elements in the layers panel

### Keyboard Shortcuts

- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Y` - Redo
- `Delete` - Remove selected element
- `Ctrl/Cmd + D` - Duplicate element
- `Ctrl/Cmd + E` - Export code
- `?` - Show all shortcuts

### Exporting

- **React Code** - Export as React components
- **HTML/CSS** - Export as static HTML
- **After Effects** - Export for motion graphics

## 🗂️ Project Structure

```
protosigner-app/
├── api/              # Vercel serverless functions
│   ├── gemini.js    # Gemini AI endpoint
│   └── openrouter.js # OpenRouter endpoint
├── components/       # Reusable UI components
├── context/         # React context providers
├── features/        # Feature-specific modules
│   ├── ai/         # AI integration
│   ├── canvas/     # Canvas editor
│   ├── export/     # Code export
│   ├── layers/     # Layer management
│   └── properties/ # Property inspector
├── services/        # External services & API utilities
├── .env.local      # Environment variables
├── package.json    # Dependencies
├── vercel.json     # Vercel configuration
└── vite.config.ts  # Vite configuration
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🔒 Security

ProtoSigner uses Vercel Serverless Functions to keep API keys secure:
- API keys stored server-side only
- Never exposed to client browser
- Secure environment variable management

See [SERVERLESS.md](./SERVERLESS.md) for detailed documentation.

## Legal

- License: [Apache License 2.0](LICENSE)

## 🙏 Acknowledgments

- Built with [Google Gemini AI](https://ai.google.dev/)
- Powered by [React](https://react.dev/) and [Vite](https://vitejs.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

- 📧 Email: dream.pixels.forge@gmail.com
- 💬 Discord: [Join our community](https://discord.gg/protosigner)
- 🐛 Issues: [GitHub Issues](https://github.com/Dream-Pixels-Forge/protosigner-app/issues)

---

<div align="center">
Made with ❤️ by the ProtoSigner Team
</div>
