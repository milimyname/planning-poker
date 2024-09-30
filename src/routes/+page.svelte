<script lang="ts">
	import { onMount } from 'svelte';
	import { createShapeStore, type ShapeStoreData } from '$lib/electric-store';

	export let data;

	const shapeStore = createShapeStore(data.shapeOptions);
	let shapeData: ShapeStoreData = {
		data: [],
		isLoading: true,
		error: null
	};

	$: ({ data: items, isLoading, error } = shapeData);

	onMount(() => {
		const unsubscribe = shapeStore.subscribe((value) => {
			shapeData = value;
		});

		shapeStore.init(); // Initialize the shape after component mounts

		return unsubscribe;
	});
</script>

{#if isLoading}
	<p>Loading...</p>
{:else if error}
	<p>Error: {error}</p>
{:else}
	<ul>
		{#each items as item}
			<li>{JSON.stringify(item)}</li>
		{/each}
	</ul>
{/if}
