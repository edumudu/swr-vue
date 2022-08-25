/// <reference types="vitest" />

import { resolve } from 'node:path';

import { defineConfig } from 'vite';
import ViteDts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [ViteDts({ outputDir: resolve(__dirname, 'dist', 'types') })],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'lib'),
    },
  },

  build: {
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      name: 'swr-vue',
      fileName: (format) => `swr-vue.${format}.js`,
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
