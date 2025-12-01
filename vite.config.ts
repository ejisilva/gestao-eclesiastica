import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Garante compatibilidade com bibliotecas que usam process.env
    'process.env': process.env
  }
});