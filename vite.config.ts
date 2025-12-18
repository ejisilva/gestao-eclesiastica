import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // Isso substitui 'process.env.API_KEY' pelo valor real da string no momento do build
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY || ''),
      // Polyfill seguro para evitar crash se alguma lib tentar acessar process.env
      'process.env': {} 
    }
  };
});