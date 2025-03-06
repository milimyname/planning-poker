import { browser } from '$app/environment';
import { invalidate } from '$app/navigation';
import type { PlayerType } from '$lib/validators';
import { QueryClient } from '@tanstack/svelte-query';

const CURRENT_PLAYER_DEP = 'custom:currentPlayer';

export async function load({ depends }) {
	depends(CURRENT_PLAYER_DEP);

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser,
				gcTime: Infinity
			}
		}
	});

	const currentPlayer = browser
		? JSON.parse(localStorage.getItem('currentPlayer') || 'null')
		: null;

	return {
		queryClient,
		currentPlayer,
		updateCurrentPlayer: async (newPlayer: PlayerType) => {
			if (browser) {
				localStorage.setItem('currentPlayer', JSON.stringify(newPlayer));
				await invalidate(CURRENT_PLAYER_DEP);
			}
		}
	};
}
