import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

if (process.env.VERCEL === '1' && !process.env.VITE_API_URL?.trim()) {
  throw new Error('VITE_API_URL must point to the deployed backend when building on Vercel.');
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      },
    },
  },
});
