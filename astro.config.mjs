import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
  site: 'https://chucklagos.dev',
  trailingSlash: 'always',
  vite: { plugins: [tailwindcss()] },
});
