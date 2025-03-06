<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import data from '@emoji-mart/data';

	const dispatch = createEventDispatcher();
	let pickerContainer: HTMLDivElement = $state();

	const initPicker = async (node) => {
		const { Picker } = await import('emoji-mart');

		const picker = new Picker({
			data,
			onEmojiSelect: (emoji) => {
				dispatch('emoji-select', emoji);
			},
			previewPosition: 'none',
			skinTonePosition: 'none',
			theme: 'light'
		});

		node.appendChild(picker);

		return {
			destroy() {
				picker.destroy();
			}
		};
	};

	$effect(() => {
		initPicker(pickerContainer);
	});
</script>

<div bind:this={pickerContainer} class="emoji-picker-container"></div>

<style>
	.emoji-picker-container {
		background: white;
		border-radius: 8px;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
	}

	:global(.emoji-picker-container em-emoji-picker) {
		--rgb-background: 255, 255, 255;
		--rgb-input: 247, 247, 247;
	}
</style>
