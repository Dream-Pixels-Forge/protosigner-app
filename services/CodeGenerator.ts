import { UIElement, ProjectSettings } from '../types';

export type FileMap = Record<string, string>;

export class CodeGenerator {
  static generateProject(elements: UIElement[], settings: ProjectSettings): FileMap {
    const files: FileMap = {};
    const pages = elements.filter(el => el.type === 'page');

    // 1. Static Configuration Files
    this.addConfigFiles(files, settings);

    // 2. Global Styles
    files['src/index.css'] = this.generateIndexCss(settings);

    // 3. Entry Point
    files['src/main.tsx'] = this.generateMainTsx();

    // 4. Pages & Components
    pages.forEach((page, index) => {
        const pageName = this.toPascalCase(page.name) || `Page${index + 1}`;
        
        // Analyze page children to split into components
        const { pageContent, components } = this.generatePageAndComponents(page, pageName, settings);
        
        // Add Page File
        files[`src/pages/${pageName}.tsx`] = pageContent;
        
        // Add Component Files
        Object.assign(files, components);
    });

    // 5. Routing
    files['src/App.tsx'] = this.generateAppRouter(pages);

    return files;
  }

  private static addConfigFiles(files: FileMap, settings: ProjectSettings) {
    files['package.json'] = JSON.stringify({
      name: "protosigner-export",
      private: true,
      version: "1.0.0",
      type: "module",
      scripts: {
        "dev": "vite",
        "build": "tsc && vite build",
        "preview": "vite preview"
      },
      dependencies: {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "lucide-react": "^0.300.0" 
      },
      devDependencies: {
        "@types/react": "^18.2.43",
        "@types/react-dom": "^18.2.17",
        "@vitejs/plugin-react": "^4.2.1",
        "autoprefixer": "^10.4.16",
        "postcss": "^8.4.32",
        "tailwindcss": "^3.4.0",
        "typescript": "^5.2.2",
        "vite": "^5.0.8"
      }
    }, null, 2);

    files['vite.config.ts'] = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`;

    files['tailwind.config.js'] = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
       fontFamily: {
        sans: ['"${settings.fontFamily}"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}`;

    files['postcss.config.js'] = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

    files['index.html'] = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Protosigner App</title>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
  }

  private static generateIndexCss(settings: ProjectSettings): string {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: ${settings.darkMode ? '#000' : '#fff'};
  color: ${settings.darkMode ? '#fff' : '#000'};
  margin: 0;
  font-family: '${settings.fontFamily}', sans-serif;
}`;
  }

  private static generateMainTsx(): string {
    return `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`;
  }

  private static generatePageAndComponents(page: UIElement, pageName: string, settings: ProjectSettings) {
      const components: FileMap = {};
      const imports: string[] = [`import React from 'react';`];
      const childJsxList: string[] = [];

      if (page.children) {
          page.children.forEach((child, idx) => {
              if (child.style?.display === 'none') return;

              // Naming strategy: Use element name if valid, else fallback
              const rawName = child.name.trim();
              const baseName = this.toPascalCase(rawName) || `Section${idx + 1}`;
              
              // Ensure uniqueness in this page context (simple check)
              let compName = baseName;
              if (imports.some(i => i.includes(`import { ${compName} }`))) {
                  compName = `${compName}${idx + 1}`;
              }

              // Extract to file
              const compContent = this.generateComponentFile(child, compName);
              components[`src/components/${compName}.tsx`] = compContent;

              imports.push(`import { ${compName} } from '../components/${compName}';`);
              childJsxList.push(`<${compName} />`);
          });
      }

      // Root Page Style
      // We explicitly set min-h-screen and flex-col to ensure proper layout of stacked sections
      const pageStyle = {
          backgroundColor: page.style?.backgroundColor || (settings.darkMode ? '#000000' : '#ffffff'),
          color: page.style?.color || (settings.darkMode ? '#ffffff' : '#000000'),
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          ...page.style
      };
      
      // Remove display: none if it was set (though usually page is visible if we are exporting it)
      if (pageStyle.display === 'none') pageStyle.display = 'flex';

      const pageContent = `${imports.join('\n')}

export default function ${pageName}() {
  return (
    <div className="w-full relative overflow-x-hidden" style={${JSON.stringify(pageStyle)}}>
      ${childJsxList.join('\n      ')}
    </div>
  );
}`;

      return { pageContent, components };
  }

  private static generateComponentFile(element: UIElement, componentName: string): string {
      // The element passed here is the root of the new component.
      const jsx = this.renderElement(element, 4);

      return `import React from 'react';

export const ${componentName} = () => {
  return (
${jsx}
  );
};`;
  }

  private static renderElement(el: UIElement, indent: number): string {
    if (el.style?.display === 'none') return '';
    
    const spaces = ' '.repeat(indent);
    
    // Clone style to avoid mutation issues
    const styleObj = { ...el.style };
    const styleProp = Object.keys(styleObj).length > 0 ? ` style={${JSON.stringify(styleObj)}}` : '';
    
    let tag = 'div';
    let content = '';
    let propsStr = '';
    let className = '';

    // Tag Inference
    switch (el.type) {
        case 'text':
            tag = 'div';
            // Simple heuristic for semantic tags
            const fontSize = parseInt(String(el.style?.fontSize || '16'));
            if (el.name.toLowerCase().includes('h1') || fontSize > 32) tag = 'h1';
            else if (el.name.toLowerCase().includes('h2') || fontSize > 24) tag = 'h2';
            else if (el.name.toLowerCase().includes('h3') || fontSize > 20) tag = 'h3';
            else if (el.name.toLowerCase().includes('p') || el.name.toLowerCase().includes('desc')) tag = 'p';
            
            content = el.props.text || '';
            break;
        case 'button':
            tag = 'button';
            content = el.props.label || 'Button';
            className = 'hover:opacity-90 active:scale-95 transition-transform';
            break;
        case 'image':
            tag = 'img';
            propsStr = ` src="${el.props.src}" alt="${el.props.alt || el.name}"`;
            break;
        case 'section':
            tag = 'section';
            break;
    }

    const childrenCode = el.children && el.children.length > 0
        ? '\n' + el.children.map(c => this.renderElement(c, indent + 2)).filter(s => s).join('\n') + `\n${spaces}`
        : content;

    if (tag === 'img' || tag === 'input' || tag === 'br' || tag === 'hr') {
        return `${spaces}<${tag}${className ? ` className="${className}"` : ''}${propsStr}${styleProp} />`;
    }

    const opening = `<${tag}${className ? ` className="${className}"` : ''}${propsStr}${styleProp}>`;
    const closing = `</${tag}>`;

    return `${spaces}${opening}${childrenCode}${closing}`;
  }

  private static generateAppRouter(pages: UIElement[]): string {
    const pageNames = pages.map((p, i) => ({
        name: this.toPascalCase(p.name) || `Page${i + 1}`,
        route: i === 0 ? '/' : `/${this.toKebabCase(p.name)}`
    }));

    const imports = pageNames.map(p => `import ${p.name} from './pages/${p.name}';`).join('\n');

    return `import React, { useState, useEffect } from 'react';
${imports}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(window.location.pathname);

  useEffect(() => {
    const onPopState = () => setCurrentRoute(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentRoute(path);
  };

  const renderPage = () => {
    const path = currentRoute === '/' ? '/' : currentRoute.replace(/^\\//, '');
    
    switch(path) {
      ${pageNames.map(p => `case '${p.route === '/' ? '/' : p.route.replace('/','') }': return <${p.name} />`).join('\n      ')}
      default: return <${pageNames[0]?.name || 'div'} />
    }
  };

  return (
    <main className="min-h-screen bg-black">
      ${pageNames.length > 1 ? `
      <nav className="fixed top-4 right-4 z-50 flex gap-2 bg-black/50 p-2 rounded backdrop-blur text-xs border border-white/10">
         ${pageNames.map(p => `<button onClick={() => navigate('${p.route}')} className="px-3 py-1.5 bg-white/10 rounded text-white hover:bg-white/20 transition-colors">${p.name}</button>`).join('\n         ')}
      </nav>` : ''}
      {renderPage()}
    </main>
  );
};`;
  }

  private static toPascalCase(str: string): string {
    if (!str) return '';
    return str
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
  }

  private static toKebabCase(str: string): string {
      if (!str) return '';
      return str
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(/\s+/)
        .join('-')
        .toLowerCase();
  }
}
