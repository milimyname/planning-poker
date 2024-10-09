<script lang="ts">
	import { createShapeStore, type ShapeStoreData } from '$lib/electric-store';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { onMount } from 'svelte';
	import { derived, writable } from 'svelte/store';
	import { playerSchema, clearInvitees } from '$lib/electric-actions/player';
	import {
		type InsertVote,
		type Player,
		type InsertPlayer,
		type PlayerGames
	} from '$lib/validators';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';
	import { BASE_URL } from '$lib/constants.js';

	export let data;

	const queryClient = useQueryClient();

	const playerGamesSchema = () => ({
		url: new URL('/v1/shape/player_games', BASE_URL).href,
		where: `game_id='${$page.params.slug}'`
	});

	const shapePlayerStore = createShapeStore<Player>(playerSchema());

	const shapePlayerGamesSchema = createShapeStore<PlayerGames>(playerGamesSchema());

	let shapePlayerData: ShapeStoreData<Player> = {
		data: [],
		isLoading: true,
		error: null
	};

	let shapePlayerGamesData: ShapeStoreData<PlayerGames> = {
		data: [],
		isLoading: true,
		error: null
	};

	// Reactive variables for players and playerGames
	$: ({ data: players, isLoading: playersLoading, error: playersError } = shapePlayerData);
	$: ({
		data: playerGames,
		isLoading: playerGamesLoading,
		error: playerGamesError
	} = shapePlayerGamesData);

	$: combinedPlayerGamesStore = playerGames.map((pg) => ({
		...pg,
		player: players.find((p) => p.id === pg.player_id)
	}));

	$: error = playersError || playerGamesError;
	$: isLoading = playersLoading || playerGamesLoading;

	let isOnline = true;

	const pendingMutations = writable<Map<string, InsertVote>>(new Map());

	onMount(() => {
		const playerUnsubscribe = shapePlayerStore.subscribe((value) => {
			shapePlayerData = value;
		});

		const playerGamesUnsubscribe = shapePlayerGamesSchema.subscribe((value) => {
			shapePlayerGamesData = value;
		});

		shapePlayerStore.init();

		shapePlayerGamesSchema.init();

		isOnline = navigator.onLine;
		window.addEventListener('online', () => {
			isOnline = true;
			queryClient.resumePausedMutations();
		});
		window.addEventListener('offline', () => (isOnline = false));

		return {
			destroy() {
				playerUnsubscribe();
				playerGamesUnsubscribe();
			}
		};
	});

	const clearInviteesMutation = createMutation({
		mutationKey: ['clear-players'],
		mutationFn: (player: InsertPlayer) => clearInvitees(player),
		onMutate: (player: InsertPlayer) => {
			// Clear the invitees except for the current player
			pendingMutations.update((pending) => {
				pending.set(player.id, player);
				return pending;
			});
		}
	});

	function invitePlayer() {
		navigator.clipboard.writeText(window.location.href.replace('game', 'join'));
		toast('Copied to clipboard.');

		toast('Share this link to invite them to this session.', {
			action: {
				label: 'Copy again',
				onClick: () => {
					navigator.clipboard.writeText(window.location.href.replace('game', 'join'));
					toast('Copied to clipboard.');
				}
			}
		});
	}
</script>

<p>Network status: {isOnline ? 'Online' : 'Offline'}</p>

<div>
	<h1>Players</h1>
	{#if isLoading}
		<p>Loading...</p>
	{:else if error}
		<p>Error: {error}</p>
	{:else}
		<ul>
			{#each combinedPlayerGamesStore as playerGame (playerGame.playerId)}
				<li>{playerGame.player?.name}</li>
			{/each}
		</ul>
	{/if}
</div>

<div>
	<h2>Actions</h2>
	<Button on:click={invitePlayer}>Invite new Player</Button>
	<Button
		variant="destructive"
		on:click={() => {
			console.log('Clearing Players', data);
			$clearInviteesMutation.mutate(data.currentPlayer);
		}}
	>
		Clear Players
	</Button>
</div>
