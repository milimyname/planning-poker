import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		include: ['@tanstack/svelte-query', 'emoji-mart', '@emoji-mart/data']
	}
});
