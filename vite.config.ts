/// <reference types="vitest" />

import { resolve } from 'node:path';

import { defineConfig } from 'vite';
import ViteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [ViteTsconfigPaths()],

  build: {
    lib: {
      entry: resolve(__dirname, 'lib'),
      name: 'swr',
      fileName: (format) => `swr.${format}.js`,
    },

    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    clearMocks: true,
  },
});
