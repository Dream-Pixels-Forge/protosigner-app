import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.OPENROUTER_API_KEY': JSON.stringify(env.OPENROUTER_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      // Vitest configuration
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./test/setup.ts'],
        include: ['**/*.{test,spec}.{ts,tsx}'],
        exclude: ['**/*.e2e.{ts,tsx}', '**/e2e/**', '**/tests/**/*.spec.ts', 'node_modules', 'dist', '.idea', '.git', '.cache'],
        coverage: {
          provider: 'v8',
          reporter: ['text', 'json', 'html'],
          include: ['src/**/*.{ts,tsx}', 'context/**/*.{ts,tsx}', 'services/**/*.{ts,tsx}', 'features/**/*.{ts,tsx}'],
          exclude: ['**/*.d.ts', '**/*.config.*', '**/node_modules/**'],
          thresholds: {
            global: {
              branches: 60,
              functions: 60,
              lines: 70,
              statements: 70
            }
          }
        }
      }
    };
});
