<script lang="ts">
	import type { InsertReaction } from '$lib/validators';
	import { fade } from 'svelte/transition';
	import EmojiPicker from './emoji-picker.svelte';

	export let targetedCardId: string;
	export let show: boolean;
	export let reactions: InsertReaction[];
	export let handleReaction: (emoji: string) => void;

	let showPicker = false;
	let animatedEmojis = [];
	let previousReactions: InsertReaction[] = [];

	// Filter reactions for this specific card
	$: cardReactions = reactions.filter((reaction) => reaction.target_player_id === targetedCardId);

	// Track reactions counts for this card only
	$: reactionCounts = cardReactions.reduce((acc, reaction) => {
		acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
		return acc;
	}, {});

	const emojiButtons = [
		{ emoji: '👍', label: 'thumbs up' },
		{ emoji: '😄', label: 'happy' },
		{ emoji: '😢', label: 'sad' },
		{ emoji: '😡', label: 'angry' },
		{ emoji: '➕', label: 'more' }
	];

	// Function to handle emoji selection from the picker
	function onEmojiSelect(event: CustomEvent<{ native: string }>) {
		const emoji = event.detail.native;
		showPicker = false;
		throwEmoji(emoji);
	}

	// Watch for new reactions for this specific card
	$: {
		if (cardReactions) {
			const newReactions = cardReactions.filter(
				(reaction) => !previousReactions.some((prev) => prev.id === reaction.id)
			);

			// Animate each new reaction
			newReactions.forEach((reaction) => {
				if (!animatedEmojis.some((e) => e.reactionId === reaction.id)) {
					throwEmoji(reaction.emoji, reaction.id);
				}
			});

			// Update previous reactions
			previousReactions = cardReactions;
		}
	}

	function getRandomStartPosition() {
		const edge = Math.floor(Math.random() * 4);
		const position = { x: 0, y: 0 };

		switch (edge) {
			case 0: // top
				position.x = Math.random() * window.innerWidth;
				position.y = -50;
				break;
			case 1: // right
				position.x = window.innerWidth + 50;
				position.y = Math.random() * window.innerHeight;
				break;
			case 2: // bottom
				position.x = Math.random() * window.innerWidth;
				position.y = window.innerHeight + 50;
				break;
			case 3: // left
				position.x = -50;
				position.y = Math.random() * window.innerHeight;
				break;
		}

		return position;
	}

	function calculateCollisionPoint(start, target) {
		if (!target) return { x: 0, y: 0 };
		const targetBounds = target.getBoundingClientRect();

		const dx = targetBounds.x + targetBounds.width / 2 - start.x;
		const dy = targetBounds.y + targetBounds.height / 2 - start.y;

		const length = Math.sqrt(dx * dx + dy * dy);
		const normalizedDx = dx / length;
		const normalizedDy = dy / length;

		let collisionX, collisionY;

		if (normalizedDy < 0) {
			collisionY = targetBounds.bottom;
			collisionX = start.x + (collisionY - start.y) * (normalizedDx / normalizedDy);
		} else {
			collisionY = targetBounds.top;
			collisionX = start.x + (collisionY - start.y) * (normalizedDx / normalizedDy);
		}

		if (collisionX < targetBounds.left || collisionX > targetBounds.right) {
			if (normalizedDx < 0) {
				collisionX = targetBounds.right;
			} else {
				collisionX = targetBounds.left;
			}
			collisionY = start.y + (collisionX - start.x) * (normalizedDy / normalizedDx);
		}

		return { x: collisionX, y: collisionY };
	}

	function throwEmoji(selectedEmoji: string, reactionId?: string) {
		// If no reactionId, this is a new reaction from the user
		if (!reactionId) {
			handleReaction(selectedEmoji);

			return;
		}

		const startPos = getRandomStartPosition();
		const targetCard = document.getElementById(targetedCardId);
		if (!targetCard) return;

		const collisionPoint = calculateCollisionPoint(startPos, targetCard);

		const dx = collisionPoint.x - startPos.x;
		const dy = collisionPoint.y - startPos.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		const normalizedDx = dx / distance;
		const normalizedDy = dy / distance;

		const bounceDistance = 40;
		const bounceX = collisionPoint.x + normalizedDx * -bounceDistance;
		const bounceY = collisionPoint.y + normalizedDy * -bounceDistance;

		const emoji = {
			id: Math.random().toString(36).substring(7),
			reactionId,
			content: selectedEmoji,
			startX: startPos.x,
			startY: startPos.y,
			collisionX: collisionPoint.x,
			collisionY: collisionPoint.y,
			bounceX,
			bounceY,
			rotation: Math.random() * 720 - 360
		};

		animatedEmojis = [...animatedEmojis, emoji];

		setTimeout(() => {
			animatedEmojis = animatedEmojis.filter((e) => e.id !== emoji.id);
		}, 2000);
	}
</script>

<div class="relative">
	{#if show}
		<div
			class="emoji-buttons absolute -top-10 left-1/2 z-10 -translate-x-1/2 select-none"
			transition:fade
		>
			{#each emojiButtons as button}
				<button
					class="emoji-button relative"
					on:click={() => {
						button.emoji === '➕' ? (showPicker = !showPicker) : throwEmoji(button.emoji);
					}}
					aria-label={button.label}
				>
					{button.emoji}
					{#if reactionCounts[button.emoji]}
						<div
							class="absolute -right-2 -top-2 rounded-full bg-blue-500 px-1.5 py-0.5 text-xs text-white"
						>
							{reactionCounts[button.emoji]}
						</div>
					{/if}
				</button>
			{/each}

			{#if showPicker}
				<div class="absolute left-1/2 top-12 z-50 -translate-x-1/2" transition:fade>
					<EmojiPicker on:emoji-select={onEmojiSelect} />
				</div>
			{/if}
		</div>
	{/if}

	<!-- Create a portal container for animations -->
	<div class="emoji-container">
		{#each animatedEmojis as emoji (emoji.id)}
			<div
				class="emoji"
				style="--start-x: {emoji.startX}px;
					   --start-y: {emoji.startY}px;
					   --collision-x: {emoji.collisionX}px;
					   --collision-y: {emoji.collisionY}px;
					   --bounce-x: {emoji.bounceX}px;
					   --bounce-y: {emoji.bounceY}px;
					   --rotation: {emoji.rotation}deg;"
			>
				{emoji.content}
			</div>
		{/each}
	</div>
</div>

<style>
	.emoji-buttons {
		display: flex;
		gap: 0.5rem;
		padding: 0.5rem;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 2rem;
		backdrop-filter: blur(4px);
	}

	.emoji-button {
		font-size: 1.25rem;
		padding: 0.5rem;
		border: none;
		background: none;
		cursor: pointer;
		border-radius: 50%;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
	}

	.emoji-button:hover {
		transform: scale(1.2);
		background: rgba(255, 255, 255, 0.1);
	}

	.emoji-button:active {
		transform: scale(0.95);
	}

	.emoji-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 50;
	}

	.emoji {
		position: fixed;
		user-select: none;
		pointer-events: none;
		font-size: 2rem;
		left: var(--start-x);
		top: var(--start-y);
		z-index: 50;
		animation: throwWithCollision 2s cubic-bezier(0.2, 0, 0.3, 1) forwards;
	}

	@keyframes throwWithCollision {
		0% {
			transform: translate(0, 0) scale(0.5) rotate(0deg);
			opacity: 0;
		}
		20% {
			transform: translate(
					calc((var(--collision-x) - var(--start-x)) * 0.2),
					calc((var(--collision-y) - var(--start-y)) * 0.2)
				)
				scale(1.2) rotate(calc(var(--rotation) * 0.3));
			opacity: 1;
		}
		45% {
			transform: translate(
					calc(var(--collision-x) - var(--start-x)),
					calc(var(--collision-y) - var(--start-y))
				)
				scale(1) rotate(var(--rotation));
			opacity: 1;
		}
		50% {
			transform: translate(
					calc(var(--collision-x) - var(--start-x)),
					calc(var(--collision-y) - var(--start-y))
				)
				scale(1.3, 0.7) rotate(var(--rotation));
			opacity: 1;
		}
		60% {
			transform: translate(
					calc(var(--bounce-x) - var(--start-x)),
					calc(var(--bounce-y) - var(--start-y))
				)
				scale(0.9) rotate(calc(var(--rotation) * 1.2));
			opacity: 0.8;
		}
		80% {
			transform: translate(
					calc(var(--collision-x) - var(--start-x)),
					calc(var(--collision-y) - var(--start-y))
				)
				scale(0.8) rotate(calc(var(--rotation) * 1.4));
			opacity: 0.6;
		}
		100% {
			transform: translate(
					calc(var(--collision-x) - var(--start-x)),
					calc(var(--collision-y) - var(--start-y))
				)
				scale(0.5) rotate(calc(var(--rotation) * 1.5));
			opacity: 0;
		}
	}
</style>
