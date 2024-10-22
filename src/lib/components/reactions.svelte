<script lang="ts">
	export let targetedCardId: string;
	export let show: boolean;

	let emojis = [];

	const emojiButtons = [
		{ emoji: '👍', label: 'thumbs up' },
		{ emoji: '👎', label: 'thumbs down' },
		{ emoji: '😄', label: 'happy' },
		{ emoji: '😢', label: 'sad' },
		{ emoji: '😡', label: 'angry' }
	];

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

	function throwEmoji(selectedEmoji: string) {
		const startPos = getRandomStartPosition();
		const targetCard = document.getElementById(targetedCardId);
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
			content: selectedEmoji,
			startX: startPos.x,
			startY: startPos.y,
			collisionX: collisionPoint.x,
			collisionY: collisionPoint.y,
			bounceX,
			bounceY,
			rotation: Math.random() * 720 - 360
		};

		emojis = [...emojis, emoji];

		setTimeout(() => {
			emojis = emojis.filter((e) => e.id !== emoji.id);
		}, 2000);
	}
</script>

{#if show}
	<div class="emoji-buttons absolute -top-10 left-1/2 z-10 -translate-x-1/2 select-none">
		{#each emojiButtons as button}
			<button
				class="emoji-button"
				on:click={() => throwEmoji(button.emoji)}
				aria-label={button.label}
			>
				{button.emoji}
			</button>
		{/each}
	</div>
{/if}

{#each emojis as emoji (emoji.id)}
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
