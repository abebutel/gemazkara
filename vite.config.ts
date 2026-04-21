import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'לוח אזכרה',
        short_name: 'אזכרה',
        description: 'הכנת חוברת לימוד לעילוי נשמת',
        theme_color: '#1a365d',
        background_color: '#f9f6f0',
        display: 'standalone',
        dir: 'rtl',
        lang: 'he',
      }
    })
  ],
});