import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import vike from 'vike/plugin';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), vike({ prerender: true })],
    server: {
      port: 3000,
    },
    define: {
      'process.env': env,
    },
  };
});
