<script lang="ts">
	import { createMutation } from '@tanstack/svelte-query';
	import { onMount } from 'svelte';
	import { deletePlayer } from '$lib/electric-actions/player';
	import {
		type InsertVote,
		type Player,
		type InsertPlayer,
		type PlayerGames,
		type Game,
		type InsertSession,
		type Session,
		type UpdateGame,
		type InsertReaction
	} from '$lib/validators';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';
	import * as Card from '$lib/components/ui/card';
	import { updateGame } from '$lib/electric-actions/game';
	import { createVote, updateVote } from '$lib/electric-actions/vote';
	import { v4 as uuidv4 } from 'uuid';
	import { createSession, updateSession } from '$lib/electric-actions/session.js';
	import { cn } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { CircleX } from 'lucide-svelte';
	import LoadingDots from '$lib/components/loading-dots.svelte';
	import Countdown from '$lib/components/countdown.svelte';
	import { Switch, Label } from 'bits-ui';
	import Reactions from '$lib/components/reactions.svelte';
	import { randomEmoji } from '$lib/random-emoji-generator';
	import { createReaction, clearReactionsBySessionId } from '$lib/electric-actions/reaction';
	import { slide } from 'svelte/transition';
	import { cubicIn } from 'svelte/easing';
	import { ShapeStream, Shape } from '@electric-sql/client';
	import { BASE_URL } from '$lib/constants.js';

	let players: Player[];
	let playerGames: PlayerGames[];
	let games: Game[];
	let sessions: Session[];
	let votes: InsertVote[];
	let reactions: InsertReaction[] = [];

	let isHovered: string;
	let emoji = randomEmoji();

	const playerStream = new ShapeStream({
		url: `${BASE_URL}/v1/shape`,
		table: 'players'
	});

	const playerShape = new Shape(playerStream);

	const playerGamesStream = new ShapeStream({
		url: `${BASE_URL}/v1/shape`,
		table: 'player_games',
		where: `game_id='${$page.params.slug}'`
	});

	const playerGamesShape = new Shape(playerGamesStream);

	const gameStream = new ShapeStream({
		url: `${BASE_URL}/v1/shape`,
		table: 'games'
	});

	const gameShape = new Shape(gameStream);

	const sessionStream = new ShapeStream({
		url: `${BASE_URL}/v1/shape`,
		table: 'sessions'
	});

	const sessionShape = new Shape(sessionStream);

	const reactionStream = new ShapeStream({
		url: `${BASE_URL}/v1/shape`,
		table: 'reactions'
	});

	const reactionShape = new Shape(reactionStream);

	const voteStream = new ShapeStream({
		url: `${BASE_URL}/v1/shape`,
		table: 'votes'
	});

	const voteShape = new Shape(voteStream);

	export let data;

	$: combinedPlayerGamesStore = playerGames?.map((pg) => {
		return {
			...pg,
			player: players?.find((p) => p.id === pg.player_id),
			game: games?.find((g) => g.id === pg.game_id),
			sessions: sessions?.filter((s) => s.game_id === pg.game_id),
			activeVote: votes?.find(
				(v) => v.session_id === latestSession?.id && v.player_id === pg.player_id
			)
		};
	});

	let isLoading = false;

	$: isCreator = playerGames?.some(
		(pg) =>
			pg.player_id === data?.currentPlayer.id && pg.is_creator && pg.game_id === $page.params.slug
	);

	$: currentGame = combinedPlayerGamesStore?.find((pg) => pg.game_id === $page.params.slug);

	$: latestSession = sessions?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

	$: currentUserVotes = votes?.filter(
		(v) => v.player_id === data.currentPlayer.id && v.session_id === latestSession?.id
	);

	$: averageEstimateOfCurrentSession = Math.round(
		votes
			?.filter((v) => v.session_id === latestSession?.id)
			.reduce((acc, vote) => acc + vote.estimate, 0) /
			votes?.filter((v) => v.session_id === latestSession?.id && v.estimate)?.length
	);

	onMount(() => {
		playerGamesShape.subscribe((data) => {
			playerGames = data.rows;
		});

		sessionShape.subscribe((data) => {
			sessions = data.rows;
		});

		voteShape.subscribe((value) => {
			votes = value.rows;
		});

		sessionShape.subscribe((data) => {
			sessions = data.rows;
		});

		playerShape.subscribe((data) => {
			players = data.rows;
		});

		gameShape.subscribe((data) => {
			games = data.rows;
		});

		reactionShape.subscribe((data) => {
			reactions = data.rows;
		});
	});

	const deletePlayerMutation = createMutation({
		mutationFn: (player: InsertPlayer) => deletePlayer(player),
		mutationKey: ['delete-player']
	});

	const deleteReactionsBySessionIdMutation = createMutation({
		mutationFn: (sessionId: string) => clearReactionsBySessionId(sessionId),
		mutationKey: ['clear-reactions']
	});

	const addVoteMutation = createMutation({
		mutationFn: (vote: InsertVote) => createVote(vote),
		mutationKey: ['add-vote']
	});

	const updateVoteMutation = createMutation({
		mutationFn: (vote: InsertVote) => updateVote(vote),
		mutationKey: ['update-vote'],
		onError: (error) => {
			toast.error(error.message);
		}
	});

	const addSessionMutation = createMutation({
		mutationFn: (session: InsertSession) => createSession(session),
		mutationKey: ['add-session']
	});

	const addReactionMutation = createMutation({
		mutationFn: (reaction: InsertReaction) => createReaction(reaction),
		mutationKey: ['add-reaction']
	});

	const updateSessionMutation = createMutation({
		mutationFn: (session: InsertSession) => updateSession(session),
		mutationKey: ['update-session'],
		onMutate: () => {
			toast('Revealing session...');
		},
		onError: () => {
			toast.error('Could not reveal the session. Please try again or restart the session.', {
				action: {
					label: 'Restart',
					onClick: () => restart()
				}
			});
		}
	});

	const updateGameMutation = createMutation({
		mutationFn: (game: UpdateGame) => updateGame(game),
		mutationKey: ['update-game']
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

	async function handleVote(estimate: string, type: 'basic' | 'emoji') {
		if (latestSession?.status === 'revealed') {
			toast.error('Session is already revealed.');
			return;
		}

		// if estimate is already casted, show a toast message
		if (
			(currentUserVotes[0]?.estimate === Number(estimate) ||
				currentUserVotes[0]?.emoji === estimate) &&
			latestSession.status !== 'completed'
		) {
			toast.error('You already voted this estimate.');
			return;
		}

		if (latestSession && currentUserVotes?.length === 1) {
			switch (type) {
				case 'basic':
					$updateVoteMutation.mutate({
						id: currentUserVotes[0].id,
						playerId: data.currentPlayer.id,
						sessionId: latestSession.id,
						emoji: null,
						estimate: Number(estimate)
					});
					break;
				case 'emoji':
					$updateVoteMutation.mutate({
						id: currentUserVotes[0].id,
						playerId: data.currentPlayer.id,
						sessionId: latestSession.id,
						estimate: null,
						emoji: estimate
					});
					break;
			}
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
				...(type === 'basic' ? { estimate: Number(estimate) } : { emoji: estimate })
			});
		} else {
			$addVoteMutation.mutate({
				id: uuidv4(),
				playerId: data.currentPlayer.id,
				sessionId: latestSession.id,
				...(type === 'basic' ? { estimate: Number(estimate) } : { emoji: estimate })
			});
		}

		toast.success(`You voted ${estimate}`);
	}

	function reveal() {
		if (!latestSession) {
			toast.error('No active session found.');
			return;
		}

		// if no votes are casted, show a toast message
		if (!votes?.find((v) => v.session_id === latestSession.id)) {
			toast.error('No votes casted yet.');
			return;
		}

		if (latestSession.status === 'revealed') {
			toast.error('Session is already revealed. Please restart the session.');
			return;
		}

		$updateSessionMutation.mutate({
			id: latestSession.id,
			status: 'revealed',
			gameId: latestSession.game_id as string
		});
	}

	function restart() {
		$addSessionMutation.mutate({
			id: uuidv4(),
			gameId: $page.params.slug,
			status: 'active'
		});

		$deleteReactionsBySessionIdMutation.mutate(latestSession.id);

		emoji = randomEmoji();
	}

	function startNewGame() {
		goto('/?newGame=true');
	}

	function toggleAutoReveal() {
		toast.success(`Auto reveal is now ${currentGame?.game?.auto_reveal ? 'enabled' : 'disabled'}.`);

		$updateGameMutation.mutate({
			id: $page.params.slug,
			autoReveal: !currentGame?.game?.auto_reveal,
			cards: currentGame?.game?.cards ?? '',
			name: currentGame?.game?.name ?? '',
			status: currentGame?.game?.status ?? 'voting'
		});
	}

	function handleReaction(emoji: string) {
		$addReactionMutation.mutate({
			id: uuidv4(),
			playerId: data.currentPlayer.id,
			targetPlayerId: isHovered,
			emoji,
			sessionId: latestSession.id
		});
	}
</script>

<div class="size-screen h-screen w-full place-content-center pb-20">
	{#if isLoading}
		<LoadingDots />
	{/if}

	{#if currentGame?.game?.auto_reveal && latestSession?.status !== 'revealed' && combinedPlayerGamesStore?.find((pg) => pg.activeVote)}
		<div class="grid place-content-center text-center">
			<Countdown {currentGame} handleReveal={reveal} />
		</div>
	{/if}

	<div class="grid place-content-center text-center">
		{#if latestSession?.status === 'revealed'}
			<p class="text-center" transition:slide={{ duration: 250, easing: cubicIn }}>
				Average: {averageEstimateOfCurrentSession ? averageEstimateOfCurrentSession : '-'}
			</p>
		{/if}
		<div class="flex gap-5 py-10">
			{#if combinedPlayerGamesStore}
				{#each combinedPlayerGamesStore as playerGame}
					<Card.Root
						class={cn(
							'relative h-48 w-32 max-w-52',
							playerGame.activeVote && 'border border-blue-500'
						)}
						on:mouseenter={() => (isHovered = playerGame.player_id)}
						on:mouseleave={() => (isHovered = '')}
						id={playerGame.player_id}
					>
						<Reactions
							targetedCardId={playerGame.player_id}
							show={isHovered === playerGame.player_id}
							{handleReaction}
							{reactions}
						/>

						{#if playerGame.player_id !== data.currentPlayer.id && combinedPlayerGamesStore.length > 1 && isCreator}
							<Button
								variant="destructive"
								size="icon"
								on:click={() => $deletePlayerMutation.mutate(playerGame.player)}
								class="absolute -right-2 -top-2 rounded-full"
							>
								<CircleX class="size-4" />
							</Button>
						{/if}

						<Card.Header class="h-12">{playerGame.player?.name}</Card.Header>

						<Card.Content class="flex h-28 items-center justify-center">
							{#if playerGame.activeVote && latestSession?.status === 'revealed'}
								<p class="text-7xl font-bold">
									{playerGame.activeVote.estimate ?? playerGame.activeVote.emoji}
								</p>
							{:else if playerGame.activeVote}
								<p>Done...</p>
							{:else if latestSession?.status !== 'revealed'}
								<LoadingDots />
							{:else}
								<p class="text-7xl font-bold">-</p>
							{/if}
						</Card.Content>
					</Card.Root>
				{/each}
			{/if}
		</div>
	</div>

	<div class="grid w-full place-content-center gap-10">
		<div class="grid grid-rows-2 gap-5">
			<div class="grid grid-cols-2 gap-5">
				{#if latestSession?.status === 'revealed'}
					<Button variant="secondary" on:click={restart}>Restart</Button>
				{:else}
					<Button variant="outline" on:click={reveal}>Reveal</Button>
				{/if}

				<div class="flex items-center space-x-3 justify-self-end">
					<Switch.Root
						on:click={toggleAutoReveal}
						id="auto-reveal"
						checked={currentGame?.game?.auto_reveal}
						class="data-[state=unchecked]:shadow-mini-inset peer inline-flex h-[36px] min-h-[36px] w-[60px] shrink-0 cursor-pointer items-center rounded-full px-[3px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-foreground data-[state=unchecked]:bg-slate-300 dark:data-[state=checked]:bg-foreground"
					>
						<Switch.Thumb
							class="data-[state=unchecked]:shadow-mini pointer-events-none block size-[30px] shrink-0 rounded-full bg-background transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0 dark:border dark:border-background/30 dark:bg-foreground dark:shadow-popover dark:data-[state=unchecked]:border"
						/>
					</Switch.Root>
					<Label.Root for="auto-reveal" class="text-sm font-medium">Auto Reveal</Label.Root>
				</div>
			</div>

			<div class="fixed right-5 top-5 flex gap-2">
				<Button variant="secondary" on:click={startNewGame}>New Game</Button>

				<Button
					on:click={() => invitePlayer()}
					class="flex cursor-pointer items-center justify-center transition-transform hover:scale-105 active:scale-95 active:shadow"
				>
					Invite player
				</Button>
			</div>
		</div>
	</div>

	{#if currentGame?.game?.cards}
		<div class="grid place-content-center">
			<div class="flex gap-5 py-10">
				{#each [...currentGame?.game.cards.split(','), emoji] as card}
					<Card.Root
						on:click={() =>
							emoji !== card ? handleVote(card, 'basic') : handleVote(emoji, 'emoji')}
						class={cn(
							'cursor-pointer transition-transform hover:scale-105 active:scale-95 active:shadow',
							currentUserVotes?.length &&
								(currentUserVotes[0].estimate === Number(card) ||
									currentUserVotes[0].emoji === card) &&
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
