<script lang="ts">
	let dots = '';
	let dotsInterval: NodeJS.Timeout;

	$effect(() => {
		dotsInterval = setInterval(() => {
			dots = dots.length >= 3 ? '' : dots + '.';
		}, 500);

		return () => {
			if (dotsInterval) clearInterval(dotsInterval);
		};
	});
</script>

<div class="loading-container">
	<div class="loading-dot"></div>
	<div class="loading-dot"></div>
	<div class="loading-dot"></div>
</div>

<style>
	@keyframes bounce {
		0%,
		80%,
		100% {
			transform: translateY(0);
		}
		40% {
			transform: translateY(-10px);
		}
	}

	.loading-container {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
	}

	.loading-dot {
		width: 8px;
		height: 8px;
		background-color: currentColor;
		border-radius: 50%;
		display: inline-block;
		animation: bounce 1.4s infinite ease-in-out both;
	}

	.loading-dot:nth-child(1) {
		animation-delay: -0.32s;
	}
	.loading-dot:nth-child(2) {
		animation-delay: -0.16s;
	}
	.loading-dot:nth-child(3) {
		animation-delay: 0s;
	}
</style>
