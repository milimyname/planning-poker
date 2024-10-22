<script lang="ts">
	import { onDestroy } from 'svelte';

	export let currentGame: any;
	export let handleReveal: () => void;

	let countdown = 8;
	let countdownInterval: NodeJS.Timeout;
	let isCountingDown = false;

	// Combine both animations
	$: animationClass = isCountingDown ? 'animate-number pulse-scale' : '';

	function startCountdown() {
		if (!currentGame?.game?.auto_reveal || isCountingDown) return;

		isCountingDown = true;
		countdown = 8;

		countdownInterval = setInterval(() => {
			countdown--;
			if (countdown <= 0) {
				clearInterval(countdownInterval);
				isCountingDown = false;
				// Trigger your reveal function here
				handleReveal();
			}
		}, 1000);
	}

	onDestroy(() => {
		if (countdownInterval) clearInterval(countdownInterval);
	});

	// Watch for changes in game status to start countdown
	$: if (currentGame?.game?.status === 'voting' && currentGame?.game?.auto_reveal) {
		startCountdown();
	}
</script>

{#if currentGame?.game?.auto_reveal && isCountingDown}
	<div class="countdown">
		<span class={animationClass}>
			{countdown}
		</span>
	</div>
{/if}

<style>
	.countdown {
		font-size: 1.5rem;
		font-weight: bold;
		margin-top: 0.5rem;
	}

	.animate-number {
		animation: popIn 1s ease-out;
	}

	.pulse-scale {
		animation:
			popIn 1s ease-out,
			pulseScale 2s ease-in-out infinite;
		animation-delay: 0s, 1s; /* Start pulse after pop-in */
	}

	@keyframes popIn {
		0% {
			transform: scale(1.5);
			opacity: 0;
		}
		20% {
			transform: scale(1.2);
			opacity: 0.8;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	@keyframes pulseScale {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.2);
		}
		100% {
			transform: scale(1);
		}
	}

	.status-text {
		color: var(--color-text-secondary);
	}
</style>
