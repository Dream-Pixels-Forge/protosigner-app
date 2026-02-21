import { describe, it, expect } from 'vitest';
import { CodeGenerator } from './CodeGenerator';
import { UIElement, ProjectSettings } from '../types';

describe('CodeGenerator', () => {
  const mockElements: UIElement[] = [
    {
      id: 'page1',
      type: 'page',
      name: 'Home Page',
      props: {},
      style: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#000000',
        color: '#ffffff'
      },
      children: [
        {
          id: 'header1',
          type: 'container',
          name: 'Header',
          props: {},
          style: {
            display: 'flex',
            height: 80,
            backgroundColor: '#1a1a1a'
          },
          children: []
        }
      ]
    }
  ];

  const mockSettings: ProjectSettings = {
    darkMode: true,
    animateEntrance: true,
    fontFamily: 'Space Grotesk',
    pageSize: { width: 1440, height: 3600 },
    viewportSize: { width: 1440, height: 900 },
    pageBorder: { show: true, width: 1, color: '#333', style: 'solid' },
    viewportBorder: { show: true, width: 2, color: 'rgba(255,255,255,0.2)', style: 'dashed' },
    guides: {
      showFold: true,
      foldPosition: 900,
      showSafeZone: false,
      safeZoneWidth: 1140,
      showColumnGrid: false,
      columns: 12,
      gap: 24,
      margin: 0,
      color: 'rgba(255,0,0,0.05)'
    },
    padding: { x: 0, y: 0 },
    showGrid: true,
    snapToGrid: true,
    gridSize: 20,
    componentLibrary: 'html-tailwind',
    enableGridMaster: true,
    autoSkillMode: true
  };

  describe('generateProject', () => {
    it('should generate a complete project structure', () => {
      const files = CodeGenerator.generateProject(mockElements, mockSettings);
      
      expect(files).toHaveProperty('package.json');
      expect(files).toHaveProperty('vite.config.ts');
      expect(files).toHaveProperty('tailwind.config.js');
      expect(files).toHaveProperty('index.html');
      expect(files).toHaveProperty('src/index.css');
      expect(files).toHaveProperty('src/main.tsx');
      expect(files).toHaveProperty('src/App.tsx');
    });

    it('should generate valid package.json', () => {
      const files = CodeGenerator.generateProject(mockElements, mockSettings);
      const packageJson = JSON.parse(files['package.json']);
      
      expect(packageJson.name).toBe('protosigner-export');
      expect(packageJson.dependencies).toHaveProperty('react');
      expect(packageJson.dependencies).toHaveProperty('react-dom');
      expect(packageJson.devDependencies).toHaveProperty('vite');
      expect(packageJson.devDependencies).toHaveProperty('tailwindcss');
    });

    it('should generate page components', () => {
      const files = CodeGenerator.generateProject(mockElements, mockSettings);
      
      expect(files).toHaveProperty('src/pages/HomePage.tsx');
      expect(files['src/pages/HomePage.tsx']).toContain('export default function HomePage');
    });

    it('should generate component files for children', () => {
      const files = CodeGenerator.generateProject(mockElements, mockSettings);
      
      expect(files).toHaveProperty('src/components/Header.tsx');
      expect(files['src/components/Header.tsx']).toContain('export const Header');
    });

    it('should generate CSS with theme settings', () => {
      const files = CodeGenerator.generateProject(mockElements, mockSettings);
      
      expect(files['src/index.css']).toContain('@tailwind base');
      expect(files['src/index.css']).toContain('background-color: #000');
      expect(files['src/index.css']).toContain('font-family');
    });

    it('should generate router for multiple pages', () => {
      const multiplePages: UIElement[] = [
        {
          id: 'page1',
          type: 'page',
          name: 'Home',
          props: {},
          style: { display: 'flex' },
          children: []
        },
        {
          id: 'page2',
          type: 'page',
          name: 'About',
          props: {},
          style: { display: 'flex' },
          children: []
        }
      ];

      const files = CodeGenerator.generateProject(multiplePages, mockSettings);
      
      expect(files['src/App.tsx']).toContain('Home');
      expect(files['src/App.tsx']).toContain('About');
      expect(files['src/App.tsx']).toContain('navigate');
    });
  });

  describe('toPascalCase', () => {
    it('should convert string to PascalCase', () => {
      // Note: toPascalCase is private, so we test through generateProject
      const files = CodeGenerator.generateProject(mockElements, mockSettings);
      
      // Home Page should become HomePage
      expect(files).toHaveProperty('src/pages/HomePage.tsx');
    });
  });
});
