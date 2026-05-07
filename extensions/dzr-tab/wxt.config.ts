import { defineConfig } from 'wxt';
import { resolve } from 'path';

export default defineConfig({
  srcDir: 'src',
  outDir: '.output',
  publicDir: resolve(__dirname, 'public'),
  manifest: {
    name: 'Deezer Tab',
    short_name: 'Deezer Tab',
    description: 'Discover a Deezer track every time you open a new tab.',
    author: 'Simon Duhem',
    version: '3.0.0',
    icons: {
      16: '/icon16.png',
      48: '/icon48.png',
      128: '/icon128.png',
    },
    permissions: ['storage'],
    host_permissions: [
      'https://api.deezer.com/*',
      'https://e-cdns-images.dzcdn.net/*',
    ],
  },
  vite: () => ({
    resolve: {
      alias: {
        '@dzr-tab/deezer-api': resolve(__dirname, '../../packages/deezer-api/src/index.ts'),
      },
    },
  }),
});
