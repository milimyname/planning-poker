<script lang="ts">
	import { createShapeStore, getShapeStream, type ShapeStoreData } from '$lib/electric-store';
	import { matchStream } from '$lib/match-stream';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { onMount } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';
	import { derived, writable } from 'svelte/store';

	type Game = { id: string };

	const baseUrl = import.meta.env.ELECTRIC_URL ?? `http://localhost:3000`;
	const baseApiUrl = `http://localhost:5173/api`;

	const gameShape = () => ({
		url: new URL(`/v1/shape/games`, baseUrl).href
	});

	async function createGame(newId: string) {
		const gamesStream = getShapeStream<Game>(gameShape());
		console.log('gamesStream', gamesStream);

		const findUpdatePromise = matchStream({
			stream: gamesStream,
			operations: ['insert'],
			matchFn: ({ message }) => message.value.id === newId
		});
		const fetchPromise = fetch(`${baseApiUrl}/games`, {
			method: `POST`,
			body: JSON.stringify({ id: newId })
		});
		return await Promise.all([findUpdatePromise, fetchPromise]);
	}

	async function clearGames() {
		const gamesStream = getShapeStream(gameShape());
		const findUpdatePromise = matchStream({
			stream: gamesStream,
			operations: [`delete`],
			matchFn: () => true
		});
		const fetchPromise = fetch(`${baseApiUrl}/games`, { method: `DELETE` });
		return await Promise.all([findUpdatePromise, fetchPromise]);
	}

	const queryClient = useQueryClient();
	const shapeStore = createShapeStore(gameShape());

	let shapeData: ShapeStoreData = {
		data: [],
		isLoading: true,
		error: null
	};

	let isOnline = true;

	const pendingMutations = writable<Map<string, Game>>(new Map());

	onMount(() => {
		const unsubscribe = shapeStore.subscribe((value) => {
			shapeData = value;
			// Remove pending mutations that are now in the actual data
			pendingMutations.update((pending) => {
				value.data.forEach((Game) => {
					pending.delete(Game.id);
				});
				return pending;
			});
		});

		shapeStore.init();

		isOnline = navigator.onLine;
		window.addEventListener('online', () => {
			isOnline = true;
			queryClient.resumePausedMutations();
		});
		window.addEventListener('offline', () => (isOnline = false));

		return unsubscribe;
	});

	$: mergedGames = derived(
		[pendingMutations, writable(shapeData.data)],
		([$pendingMutations, $Games]) => {
			const mergedMap = new Map<string, Game>();
			$Games.forEach((Game) => mergedMap.set(Game.id, Game));
			$pendingMutations.forEach((Game, id) => {
				if (!mergedMap.has(id)) {
					mergedMap.set(id, Game);
				}
			});
			return Array.from(mergedMap.values());
		}
	);

	const addGameMutation = createMutation({
		mutationFn: (newGame: Game) => createGame(newGame.id),
		onMutate: (newGame) => {
			pendingMutations.update((pending) => {
				pending.set(newGame.id, newGame);
				return pending;
			});
		},
		onSettled: (data, error, variables) => {
			pendingMutations.update((pending) => {
				pending.delete(variables.id);
				return pending;
			});
		}
	});

	const clearGamesMutation = createMutation({
		mutationFn: clearGames,
		onMutate: () => {
			pendingMutations.set(new Map());
		}
	});

	function handleAddGame() {
		const newGame = { id: uuidv4() };
		$addGameMutation.mutate(newGame);
	}

	function handleClearGames() {
		$clearGamesMutation.mutate();
	}
</script>

<p>Network status: {isOnline ? 'Online' : 'Offline'}</p>

<button on:click={handleAddGame}>Add Game</button>
<button on:click={handleClearGames}>Clear Games</button>

<div>
	{#if shapeData.isLoading}
		<p>Loading...</p>
	{:else if shapeData.error}
		<p>Error: {shapeData.error}</p>
	{:else}
		<ul>
			{#each $mergedGames as Game (Game.id)}
				<li>{Game.id}</li>
			{/each}
		</ul>
	{/if}
</div>
