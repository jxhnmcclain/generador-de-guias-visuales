import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      // Port for the development server (npm run dev)
      port: 3001,
      // Listen on all addresses (useful for network testing)
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:8001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    plugins: [react()],
    define: {
      // Expose env variables to the client-side code
      // WARNING: Be careful not to expose sensitive keys if this app is public.
      // For a public app, functionality requiring keys should be proxied through a backend.
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      }
    },
    // Build configuration (npm run build)
    build: {
      outDir: 'dist', // Default output directory
      sourcemap: false, // Disable sourcemaps for production to reduce bundle size
    }
  };
});
