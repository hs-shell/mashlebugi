import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
import { defineConfig } from 'vite';

import manifest from './manifest.config';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  return {
    base: './',
    plugins: [
      react(),
      tsconfigPaths(),
      // dev 환경에서는 crx 플러그인을 제외
      !isDev &&
        crx({
          manifest,
          contentScripts: {
            injectCss: true,
          },
        }),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          popup: 'index.html',
        },
      },
    },
  };
});
