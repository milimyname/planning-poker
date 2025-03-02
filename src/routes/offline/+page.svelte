<script>
	import { onMount } from 'svelte';

	/**
	 * @type {HTMLDivElement}
	 */
	let targetCard;
	/**
	 * @type {any[]}
	 */
	let emojis = [];
	let containerRef;

	const emojiList = ['🎉', '😎', '❤️', '😂', '✨'];

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

	/**
	 * @param {{ x: any; y: any; }} start
	 * @param {{ getBoundingClientRect: () => any; }} target
	 */
	function calculateCollisionPoint(start, target) {
		const targetBounds = target.getBoundingClientRect();

		// Calculate the direction vector
		const dx = targetBounds.x + targetBounds.width / 2 - start.x;
		const dy = targetBounds.y + targetBounds.height / 2 - start.y;

		// Normalize the vector
		const length = Math.sqrt(dx * dx + dy * dy);
		const normalizedDx = dx / length;
		const normalizedDy = dy / length;

		// Find intersection with card border
		// This calculates where the emoji will hit the card's border
		let collisionX, collisionY;

		// Check horizontal borders
		if (normalizedDy < 0) {
			collisionY = targetBounds.bottom;
			collisionX = start.x + (collisionY - start.y) * (normalizedDx / normalizedDy);
		} else {
			collisionY = targetBounds.top;
			collisionX = start.x + (collisionY - start.y) * (normalizedDx / normalizedDy);
		}

		// Check if collision point is within horizontal bounds
		if (collisionX < targetBounds.left || collisionX > targetBounds.right) {
			// If not, check vertical borders
			if (normalizedDx < 0) {
				collisionX = targetBounds.right;
			} else {
				collisionX = targetBounds.left;
			}
			collisionY = start.y + (collisionX - start.x) * (normalizedDy / normalizedDx);
		}

		return { x: collisionX, y: collisionY };
	}

	function throwEmoji() {
		const startPos = getRandomStartPosition();
		const collisionPoint = calculateCollisionPoint(startPos, targetCard);

		// Calculate bounce vector (opposite of incoming direction)
		const dx = collisionPoint.x - startPos.x;
		const dy = collisionPoint.y - startPos.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		const normalizedDx = dx / distance;
		const normalizedDy = dy / distance;

		// Bounce back distance
		const bounceDistance = 40;
		const bounceX = collisionPoint.x + normalizedDx * -bounceDistance;
		const bounceY = collisionPoint.y + normalizedDy * -bounceDistance;

		const emoji = {
			id: Math.random().toString(36).substring(7),
			content: emojiList[Math.floor(Math.random() * emojiList.length)],
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

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="container" bind:this={containerRef} onclick={throwEmoji}>
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

	<div bind:this={targetCard} class="card">Target Card</div>
</div>

<style>
	.container {
		position: relative;
		overflow: hidden;
		width: 100vw;
		height: 100vh;
	}

	.emoji {
		position: absolute;
		font-size: 2rem;
		left: var(--start-x);
		top: var(--start-y);
		animation: throwWithCollision 2s cubic-bezier(0.2, 0, 0.3, 1) forwards;
	}

	.card {
		position: absolute;
		width: 200px;
		height: 300px;
		background: lightblue;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	@keyframes throwWithCollision {
		0% {
			transform: translate(0, 0) scale(0.5) rotate(0deg);
			opacity: 0;
		}
		20% {
			/* Initial acceleration */
			transform: translate(
					calc((var(--collision-x) - var(--start-x)) * 0.2),
					calc((var(--collision-y) - var(--start-y)) * 0.2)
				)
				scale(1.2) rotate(calc(var(--rotation) * 0.3));
			opacity: 1;
		}
		45% {
			/* Just before collision */
			transform: translate(
					calc(var(--collision-x) - var(--start-x)),
					calc(var(--collision-y) - var(--start-y))
				)
				scale(1) rotate(var(--rotation));
			opacity: 1;
		}
		50% {
			/* Collision impact - squish effect */
			transform: translate(
					calc(var(--collision-x) - var(--start-x)),
					calc(var(--collision-y) - var(--start-y))
				)
				scale(1.3, 0.7) rotate(var(--rotation));
			opacity: 1;
		}
		60% {
			/* Initial bounce back */
			transform: translate(
					calc(var(--bounce-x) - var(--start-x)),
					calc(var(--bounce-y) - var(--start-y))
				)
				scale(0.9) rotate(calc(var(--rotation) * 1.2));
			opacity: 0.8;
		}
		80% {
			/* Settle back towards collision point */
			transform: translate(
					calc(var(--collision-x) - var(--start-x)),
					calc(var(--collision-y) - var(--start-y))
				)
				scale(0.8) rotate(calc(var(--rotation) * 1.4));
			opacity: 0.6;
		}
		100% {
			/* Final fade out */
			transform: translate(
					calc(var(--collision-x) - var(--start-x)),
					calc(var(--collision-y) - var(--start-y))
				)
				scale(0.5) rotate(calc(var(--rotation) * 1.5));
			opacity: 0;
		}
	}
</style>
