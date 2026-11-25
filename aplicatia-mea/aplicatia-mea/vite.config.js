import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuratia completa pentru proiectul Vite cu React
export default defineConfig({
  plugins: [react()],
  // Foloseste calea depozitului cand ruleaza pe GitHub Pages, altfel radacina aplicatiei
  base: process.env.GITHUB_ACTIONS ? '/numele-depozitului/' : '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});