<script lang="ts">
	import { createShapeStore, getShapeStream, type ShapeStoreData } from '$lib/electric-store';
	import { matchStream } from '$lib/match-stream';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { onMount } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';
	import { derived, writable } from 'svelte/store';

	type Item = { id: string };

	const baseUrl = import.meta.env.ELECTRIC_URL ?? `http://localhost:3000`;
	const baseApiUrl = `http://localhost:3000`;

	const itemShape = () => ({
		url: new URL(`/v1/shape/items`, baseUrl).href
	});

	async function createItem(newId: string) {
		const itemsStream = getShapeStream<Item>(itemShape());
		const findUpdatePromise = matchStream({
			stream: itemsStream,
			operations: [`insert`],
			matchFn: ({ message }) => message.value.id === newId
		});
		const fetchPromise = fetch(`${baseApiUrl}/items`, {
			method: `POST`,
			body: JSON.stringify({ id: newId })
		});
		return await Promise.all([findUpdatePromise, fetchPromise]);
	}

	async function clearItems() {
		const itemsStream = getShapeStream(itemShape());
		const findUpdatePromise = matchStream({
			stream: itemsStream,
			operations: [`delete`],
			matchFn: () => true
		});
		const fetchPromise = fetch(`${baseApiUrl}/items`, { method: `DELETE` });
		return await Promise.all([findUpdatePromise, fetchPromise]);
	}

	const queryClient = useQueryClient();
	const shapeStore = createShapeStore(itemShape());

	let shapeData: ShapeStoreData = {
		data: [],
		isLoading: true,
		error: null
	};

	let isOnline = true;

	const pendingMutations = writable<Map<string, Item>>(new Map());

	onMount(() => {
		const unsubscribe = shapeStore.subscribe((value) => {
			shapeData = value;
			// Remove pending mutations that are now in the actual data
			pendingMutations.update((pending) => {
				value.data.forEach((item) => {
					pending.delete(item.id);
				});
				return pending;
			});
		});

		shapeStore.init();

		isOnline = navigator.onLine;
		window.addEventListener('online', () => {
			isOnline = true;
			queryClient.resumePausedMutations();
		});

		window.addEventListener('offline', () => (isOnline = false));

		return unsubscribe;
	});

	$: mergedItems = derived(
		[pendingMutations, writable(shapeData.data)],
		([$pendingMutations, $items]) => {
			const mergedMap = new Map<string, Item>();
			$items.forEach((item) => mergedMap.set(item.id, item));
			$pendingMutations.forEach((item, id) => {
				if (!mergedMap.has(id)) {
					mergedMap.set(id, item);
				}
			});
			return Array.from(mergedMap.values());
		}
	);

	const addItemMutation = createMutation({
		mutationFn: (newItem: Item) => createItem(newItem.id),
		onMutate: (newItem) => {
			pendingMutations.update((pending) => {
				pending.set(newItem.id, newItem);
				return pending;
			});
		},
		onSettled: (data, error, variables) => {
			pendingMutations.update((pending) => {
				pending.delete(variables.id);
				return pending;
			});
		}
	});

	const clearItemsMutation = createMutation({
		mutationFn: clearItems,
		onMutate: () => {
			pendingMutations.set(new Map());
		}
	});

	function handleAddItem() {
		const newItem = { id: uuidv4() };
		$addItemMutation.mutate(newItem);
	}

	function handleClearItems() {
		$clearItemsMutation.mutate();
	}
</script>

<p>Network status: {isOnline ? 'Online' : 'Offline'}</p>

<button on:click={handleAddItem}>Add Item</button>
<button on:click={handleClearItems}>Clear Items</button>

<div>
	{#if shapeData.isLoading}
		<p>Loading...</p>
	{:else if shapeData.error}
		<p>Error: {shapeData.error}</p>
	{:else}
		<ul>
			{#each $mergedItems as item (item.id)}
				<li>{item.id}</li>
			{/each}
		</ul>
	{/if}
</div>
