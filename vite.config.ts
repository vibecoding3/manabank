import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    // Phaser alone is ~1.2 MB minified; split it out and silence the size warning.
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: { manualChunks: { phaser: ['phaser'] } },
    },
  },
});
