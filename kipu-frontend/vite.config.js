import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

/**
 * Vite Configuration
 * Includes Vue plugin, Tailwind CSS support, and path aliases for DDD structure.
 * @see https://vite.dev/config/
 */
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      /** * Root alias mapping to the 'src' directory.
       * Allows using '@/path/to/file' instead of relative paths.
       */
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});