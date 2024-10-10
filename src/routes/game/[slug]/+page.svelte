<script lang="ts">
	import { createShapeStore, type ShapeStoreData } from '$lib/electric-store';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { playerShape, clearInvitees } from '$lib/electric-actions/player';
	import {
		type InsertVote,
		type Player,
		type InsertPlayer,
		type PlayerGames,
		type Game,
		type InsertSession,
		type Session
	} from '$lib/validators';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';
	import * as Card from '$lib/components/ui/card';
	import { playerGamesWithWhereSchema } from '$lib/electric-actions/playerGames';
	import { gameShape } from '$lib/electric-actions/game';
	import { createVote, updateVote, voteShape } from '$lib/electric-actions/vote';
	import { v4 as uuidv4 } from 'uuid';
	import { createSession, sessionShape, updateSession } from '$lib/electric-actions/session.js';
	import { cn } from '$lib/utils';
	import { late } from 'zod';

	export let data;

	const queryClient = useQueryClient();

	const shapePlayerStore = createShapeStore<Player>(playerShape());
	const shapePlayerGamesStore = createShapeStore<PlayerGames>(
		playerGamesWithWhereSchema($page.params.slug)
	);
	const shapeGameStore = createShapeStore<Game>(gameShape());
	const shapeSessionStore = createShapeStore<Session>(sessionShape());
	const shapeVoteStore = createShapeStore<InsertVote>(voteShape());

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

	let shapeGameData: ShapeStoreData<Game> = {
		data: [],
		isLoading: true,
		error: null
	};

	let shapeSessionData: ShapeStoreData<Session> = {
		data: [],
		isLoading: true,
		error: null
	};

	let shapeVoteData: ShapeStoreData<InsertVote> = {
		data: [],
		isLoading: true,
		error: null
	};

	let isOnline = true;
	const pendingMutations = writable<Map<string, InsertVote>>(new Map());

	// Reactive variables for players and playerGames
	$: ({ data: players, isLoading: playersLoading, error: playersError } = shapePlayerData);
	$: ({
		data: playerGames,
		isLoading: playerGamesLoading,
		error: playerGamesError
	} = shapePlayerGamesData);
	$: ({ data: games, isLoading: gameLoading, error: gameError } = shapeGameData);
	$: ({ data: sessions } = shapeSessionData);
	$: ({ data: votes } = shapeVoteData);

	const combinedPlayerGamesStore = writable([]);

	$: $combinedPlayerGamesStore = playerGames?.map((pg) => {
		return {
			...pg,
			player: players.find((p) => p.id === pg.player_id),
			game: games.find((g) => g.id === pg.game_id),
			sessions: sessions.filter((s) => s.game_id === pg.game_id),
			activeVote: votes.find(
				(v) => v.session_id === latestSession?.id && v.player_id === pg.player_id
			)
		};
	});

	$: error = playersError || playerGamesError || gameError;
	$: isLoading = playersLoading || playerGamesLoading || gameLoading;

	$: isCreator = playerGames.some(
		(pg) =>
			pg.player_id === data?.currentPlayer.id && pg.is_creator && pg.game_id === $page.params.slug
	);

	$: currentGame = $combinedPlayerGamesStore.find((pg) => pg.game_id === $page.params.slug);

	$: latestSession = sessions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

	$: currentUserVotes = votes.filter(
		(v) => v.player_id === data.currentPlayer.id && v.session_id === latestSession?.id
	);

	$: averageEstimateOfCurrentSession =
		votes
			.filter((v) => v.session_id === latestSession?.id)
			.reduce((acc, vote) => acc + vote.estimate, 0) /
		votes.filter((v) => v.session_id === latestSession?.id).length;

	onMount(() => {
		const playerUnsubscribe = shapePlayerStore.subscribe((value) => {
			shapePlayerData = value;
		});

		const gameUnsubscribe = shapeGameStore.subscribe((value) => {
			shapeGameData = value;
		});

		const playerGamesUnsubscribe = shapePlayerGamesStore.subscribe((value) => {
			shapePlayerGamesData = value;
		});

		const sessionUnsubscribe = shapeSessionStore.subscribe((value) => {
			shapeSessionData = value;
		});

		const voteUnsubscribe = shapeVoteStore.subscribe((value) => {
			shapeVoteData = value;
		});

		shapePlayerStore.init();

		shapePlayerGamesStore.init();

		shapeGameStore.init();

		shapeSessionStore.init();

		shapeVoteStore.init();

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
				gameUnsubscribe();
				sessionUnsubscribe();
				voteUnsubscribe();
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

	const addVoteMutation = createMutation({
		mutationFn: (vote: InsertVote) => createVote(vote),
		mutationKey: ['add-vote']
	});

	const updateVoteMutation = createMutation({
		mutationFn: (vote: InsertVote) => updateVote(vote),
		mutationKey: ['update-vote']
	});

	const addSessionMutation = createMutation({
		mutationFn: (session: InsertSession) => createSession(session),
		mutationKey: ['add-session']
	});

	const updateSessionMutation = createMutation({
		mutationFn: (session: InsertSession) => updateSession(session),
		mutationKey: ['update-session']
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

	async function handleVote(card: string) {
		if (latestSession?.status === 'revealed') {
			toast.error('Session is already revealed.');
			return;
		}

		if (latestSession && currentUserVotes?.length === 1) {
			$updateVoteMutation.mutate({
				id: currentUserVotes[0].id,
				playerId: data.currentPlayer.id,
				sessionId: latestSession.id,
				estimate: Number(card)
			});
		} else if (!latestSession) {
			const session = await $addSessionMutation.mutateAsync({
				id: uuidv4(),
				gameId: $page.params.slug,
				status: 'active'
			});
			$addVoteMutation.mutate({
				id: uuidv4(),
				playerId: data.currentPlayer.id,
				sessionId: session[0].value.id,
				estimate: Number(card)
			});
		} else {
			$addVoteMutation.mutate({
				id: uuidv4(),
				playerId: data.currentPlayer.id,
				sessionId: latestSession.id,
				estimate: Number(card)
			});
		}

		toast.success(`You voted ${card}.`);
	}

	function reveal() {
		if (!latestSession) {
			toast.error('No active session found.');
			return;
		}

		$updateSessionMutation.mutate({
			id: latestSession.id,
			status: 'revealed',
			gameId: latestSession.game_id
		});
	}

	function restart() {
		$addSessionMutation.mutate({
			id: uuidv4(),
			gameId: $page.params.slug,
			status: 'active'
		});
	}
</script>

<div class="size-screen h-screen w-full place-content-center pb-20">
	{#if currentGame?.game?.cards}
		<div class="grid place-content-center text-center">
			<h2>Players</h2>
			<div class="flex gap-5 py-10">
				{#each $combinedPlayerGamesStore as playerGame}
					<Card.Root>
						<Card.Header>{playerGame.player?.name}</Card.Header>

						<Card.Content>
							{#if playerGame.activeVote && latestSession?.status === 'revealed'}
								<p class="text-7xl font-bold">{playerGame.activeVote.estimate}</p>
							{:else if playerGame.activeVote}
								<p>Done...</p>
							{:else}
								<p>Waiting...</p>
							{/if}
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		</div>
	{/if}

	<div class="grid w-full place-content-center gap-10">
		<div>
			<p>Network status: {isOnline ? 'Online' : 'Offline'}</p>
			{#if latestSession?.status === 'revealed'}
				<p>Average: {averageEstimateOfCurrentSession}</p>
			{/if}
		</div>
		<div>
			<Button on:click={invitePlayer}>Invite new Player</Button>
			<!-- {#if isCreator && playerGames.length > 1}
				<Button
					variant="destructive"
					on:click={() => {
						$clearInviteesMutation.mutate(data.currentPlayer);
					}}
				>
					Clear Players
				</Button>
			{/if} -->
			<Button variant="outline" on:click={restart}>Restart</Button>

			<Button variant="outline" on:click={reveal}>Reveal</Button>
		</div>
	</div>

	{#if currentGame?.game?.cards && !isLoading}
		<div class="grid place-content-center">
			<div class="flex gap-5 py-10">
				{#each currentGame?.game.cards.split(',') as card}
					<Card.Root
						on:click={() => handleVote(card)}
						class={cn(
							'cursor-pointer transition-transform hover:scale-105 active:scale-95 active:shadow',
							currentUserVotes.length &&
								currentUserVotes[0].estimate === Number(card) &&
								((latestSession?.status === 'revealed' &&
									'-translate-y-2 bg-green-500 text-white') ||
									(latestSession?.status !== 'completed' &&
										'-translate-y-2 animate-bounce bg-green-500 text-white'))
						)}
					>
						<Card.Content>{card}</Card.Content>
					</Card.Root>
				{/each}
			</div>
		</div>
	{/if}
</div>
