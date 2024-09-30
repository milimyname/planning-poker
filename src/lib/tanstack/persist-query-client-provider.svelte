<script lang="ts">
	import { onMount, setContext, createEventDispatcher } from 'svelte';
	import type { QueryClient } from '@tanstack/svelte-query';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { persistQueryClient, type PersistQueryClientOptions } from './persist';

	export let client: QueryClient;
	export let persistOptions: Omit<PersistQueryClientOptions, 'queryClient'>;

	const dispatch = createEventDispatcher();
	let isRestoring = true;

	onMount(() => {
		const [unsubscribe, promise] = persistQueryClient({
			...persistOptions,
			queryClient: client
		});

		promise.then(() => {
			isRestoring = false;
			dispatch('success');
		});

		return unsubscribe;
	});

	setContext('isRestoring', isRestoring);
</script>

<QueryClientProvider {client}>
	<slot />
</QueryClientProvider>
