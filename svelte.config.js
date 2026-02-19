import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      fallback: 'index.html'
    }),
    prerender: {
      handleHttpError: ({ path, message }) => {
        if (path === '/favicon.png') return;
        throw new Error(message);
      },
      handleUnseenRoutes: 'warn'
    },
    alias: {
      $lib: 'src/lib'
    }
  }
};

export default config;
