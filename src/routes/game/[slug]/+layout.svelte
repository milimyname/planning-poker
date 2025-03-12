<script lang="ts">
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import { PlayerInGames } from '$lib/states/player-in-games.svelte.js';
	import { goto } from '$app/navigation';

	const { data, children } = $props();

	const playerInGames = new PlayerInGames();

	const playerInGamesShape = playerInGames.getUserInGame({
		where: `player_id='${data.currentPlayer.id}' and game_id='${page.params.slug}'`
	});

	$effect(() => {
		if (playerInGamesShape.isLoading) return;

		if (playerInGamesShape.isError) {
			console.log('Error fetching player in game', playerInGamesShape.error);
			toast.error('Error fetching player in game');
			return;
		}

		// Check if player is part of this game
		if (!playerInGamesShape?.data?.length) {
			console.log('Player not found in game - redirecting');
			toast.error('You are not part of this game.');
			localStorage.removeItem('currentPlayer');
			goto('/');
		}
	});
</script>

{@render children()}
