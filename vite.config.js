import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'build',
  },
  plugins: [
    {
      name: 'force-exit-after-build',
      apply: 'build',
      closeBundle() {
        process.exit(0);
      },
    },
  ],
});
