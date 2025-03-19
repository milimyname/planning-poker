<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import * as Card from '$lib/components/ui/card';
	import { v4 as uuidv4 } from 'uuid';
	import { cn } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { CircleX } from 'lucide-svelte';
	import LoadingDots from '$lib/components/loading-dots.svelte';
	import Countdown from '$lib/components/countdown.svelte';
	import { Switch, Label } from 'bits-ui';
	import Reactions from '$lib/components/reactions.svelte';
	import { randomEmoji } from '$lib/random-emoji-generator';
	import { slide } from 'svelte/transition';
	import { cubicIn } from 'svelte/easing';
	import { Player as ClassPlayer } from '$lib/states/player.svelte';
	import { Game as ClassGame } from '$lib/states/game.svelte';
	import { PlayerInGames as ClassPlayerInGames } from '$lib/states/player-in-games.svelte.js';
	import { Session as ClassSession } from '$lib/states/session.svelte';
	import { Vote as ClassVote } from '$lib/states/vote.svelte';
	import { Reaction as ClassReaction } from '$lib/states/reaction.svelte';

	const classPlayer = new ClassPlayer();
	const classGame = new ClassGame();
	const classPlayerInGames = new ClassPlayerInGames();
	const classSession = new ClassSession();
	const classVote = new ClassVote();
	const classReaction = new ClassReaction();

	const classPlayerShape = classPlayer.fetchShape();
	const classGameShape = classGame.fetchShape();
	const classPlayerInGamesShape = classPlayerInGames.fetchShape(`game_id='${page.params.slug}'`);
	const classSessionShape = classSession.fetchShape();
	const classVoteShape = classVote.fetchShape();
	const classReactionShape = classReaction.fetchShape();

	let isHovered: string = $state();
	let emoji = $state(randomEmoji());
	let lastReactionTime = $state(0);
	let maxReactions = 50;

	let { data } = $props();

	let isLoading = $derived.by(() => {
		return (
			classPlayerShape?.isLoading ||
			classGameShape?.isLoading ||
			classPlayerInGamesShape?.isLoading ||
			classSessionShape?.isLoading ||
			classVoteShape?.isLoading ||
			classReactionShape?.isLoading
		);
	});

	const latestSession = $derived.by(() =>
		classSessionShape?.data
			? [...classSessionShape?.data].sort(
					(a, b) => new Date(b.created_at) - new Date(a.created_at)
				)[0]
			: null
	);

	let combinedPlayerGamesStore = $derived.by(() =>
		classPlayerInGamesShape?.data?.map((pg) => ({
			...pg,
			player: classPlayerShape?.data?.find((p) => p.id === pg.player_id),
			game: classGameShape?.data?.find((g) => g.id === pg.game_id),
			sessions: classSessionShape?.data?.filter((s) => s.game_id === pg.game_id),
			activeVote: classVoteShape?.data?.find(
				(v) => v.session_id === latestSession?.id && v.player_id === pg.player_id
			)
		}))
	);

	let currentGame = $derived.by(() =>
		combinedPlayerGamesStore?.find((pg) => pg.game_id === page.params.slug)
	);

	let averageEstimateOfCurrentSession = $derived.by(() => {
		let sessionVotes = classVoteShape?.data?.filter(
			(v) => v.session_id === latestSession?.id && v.estimate
		);
		if (!sessionVotes?.length) return null;
		return Math.round(
			sessionVotes.reduce((acc, vote) => acc + vote.estimate, 0) / sessionVotes.length
		);
	});

	let cards = $derived.by(() => [currentGame?.game?.cards?.split(','), emoji].flat());

	let isCreator = $derived.by(() => currentGame?.player_id === data.currentPlayer.id);

	let currentUserVotes = $derived.by(() =>
		classVoteShape?.data?.filter(
			(v) => v.player_id === data.currentPlayer.id && v.session_id === latestSession?.id
		)
	);

	function invitePlayer() {
		navigator.clipboard.writeText(window.location.href.replace('game', 'join'));

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
					classVote.update({
						id: currentUserVotes[0].id,
						playerId: data.currentPlayer.id,
						sessionId: latestSession.id,
						emoji: null,
						estimate: Number(estimate)
					});
					break;
				case 'emoji':
					classVote.update({
						id: currentUserVotes[0].id,
						playerId: data.currentPlayer.id,
						sessionId: latestSession.id,
						estimate: null,
						emoji: estimate
					});
					break;
			}
		} else if (!latestSession) {
			const session = await classSession.create({
				id: uuidv4(),
				gameId: page.params.slug,
				status: 'active'
			});

			classVote.create({
				id: uuidv4(),
				playerId: data.currentPlayer.id,
				sessionId: session.id,
				...(type === 'basic' ? { estimate: Number(estimate) } : { emoji: estimate })
			});
		} else {
			classVote.create({
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
		if (!classVoteShape?.data?.find((v) => v.session_id === latestSession.id)) {
			toast.error('No votes casted yet.');
			return;
		}

		if (latestSession.status === 'revealed') {
			toast.error('Session is already revealed. Please restart the session.');
			return;
		}

		classSession.update({
			id: latestSession.id,
			status: 'revealed',
			gameId: latestSession.game_id
		});
	}

	function restart() {
		classSession.create({
			id: uuidv4(),
			gameId: page.params.slug,
			status: 'active'
		});

		if (!latestSession?.id) {
			toast.error('No active session found.');
			return;
		}

		classReaction.deleteInSession(latestSession?.id);

		emoji = randomEmoji();
	}

	function startNewGame() {
		goto('/?newGame=true');
	}

	function toggleAutoReveal() {
		toast.success(`Auto reveal is now ${currentGame?.game?.auto_reveal ? 'enabled' : 'disabled'}.`);

		classGame.update({
			id: page.params.slug,
			autoReveal: !currentGame?.game?.auto_reveal,
			cards: currentGame?.game?.cards ?? '',
			name: currentGame?.game?.name ?? '',
			status: currentGame?.game?.status ?? 'voting'
		});
	}

	function handleReaction(emoji: string) {
		if (!latestSession?.id) {
			toast.error('No active session found.');
			return;
		}

		// check if the player has already reacted to the current session
		const playerReactions = classReactionShape?.data?.filter(
			(r) => r.player_id === data.currentPlayer.id && r.session_id === latestSession.id
		);

		if (playerReactions?.length >= maxReactions) {
			toast.error('You can only react 50 times per session.');
			return;
		}

		const currentTime = Date.now();
		const timeSinceLastReaction = currentTime - lastReactionTime;

		if (timeSinceLastReaction < 500) {
			toast.error('You can only react once every 500ms.');
			return;
		}

		lastReactionTime = currentTime;

		// If we get here, either there are no previous reactions or the last one is old enough
		classReaction.create({
			id: uuidv4(),
			playerId: data.currentPlayer.id,
			targetPlayerId: isHovered,
			emoji,
			sessionId: latestSession.id
		});
	}

	$effect(() => {
		if (
			latestSession?.status !== 'revealed' &&
			combinedPlayerGamesStore?.every((pg) => pg.activeVote)
		) {
			console.log('All players have voted. Reveal the session.');
			reveal();
		}
	});
</script>

<div class="h-screen w-full place-content-center pb-20">
	{#if isLoading}
		<LoadingDots />
	{/if}

	{#if !isLoading}
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
							onmouseenter={() => (isHovered = playerGame.player_id)}
							onmouseleave={() => (isHovered = '')}
							id={playerGame.player_id}
						>
							<Reactions
								targetedCardId={playerGame.player_id}
								show={isHovered === playerGame.player_id}
								{handleReaction}
								reactions={classReactionShape?.data}
							/>

							{#if !playerGame.is_creator || isCreator}
								<Button
									variant="destructive"
									size="icon"
									onclick={() => {
										classPlayer.delete(playerGame?.player);
									}}
									class="absolute -right-2 -top-2 rounded-full"
								>
									<CircleX class="size-4" />
								</Button>
							{/if}

							<Card.Header class="h-12">
								{playerGame.player?.name}
							</Card.Header>

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
					{#if !latestSession || latestSession?.status === 'revealed'}
						<Button variant="secondary" onclick={restart}>Restart</Button>
					{:else}
						<Button variant="outline" onclick={reveal}>Reveal</Button>
					{/if}

					<div class="flex items-center space-x-3 justify-self-end">
						<Switch.Root
							onclick={toggleAutoReveal}
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
					<Button variant="secondary" onclick={startNewGame}>New Game</Button>

					<Button
						onclick={() => invitePlayer()}
						class="flex cursor-pointer items-center justify-center transition-transform hover:scale-105 active:scale-95 active:shadow"
					>
						Invite player
					</Button>
				</div>
			</div>
		</div>

		<div class="grid place-content-center">
			<div class="flex gap-5 py-10">
				{#each [1, 2, 3, 5, 8, 13, 21] as card}
					<Card.Root
						onclick={() =>
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
