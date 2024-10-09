import { browser } from '$app/environment';
import { QueryClient } from '@tanstack/svelte-query';

export async function load() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser,
				gcTime: Infinity
			}
		}
	});

	return {
		queryClient,
		currentPlayer: browser ? JSON.parse(localStorage.getItem('currentPlayer') || 'null') : null
	};
}
