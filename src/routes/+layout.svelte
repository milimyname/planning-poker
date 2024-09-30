<script lang="ts">
	import '../app.css';
	import { createSyncStoragePersister } from '$lib/tanstack/create-sync-storage-persister';
	import PersistQueryClientProvider from '$lib/tanstack/persist-query-client-provider.svelte';
	import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';
	import { browser } from '$app/environment';

	export let data;

	const persister = browser
		? createSyncStoragePersister({
				storage: window.localStorage
			})
		: undefined;
</script>

{#if persister}
	<PersistQueryClientProvider
		client={data.queryClient}
		persistOptions={{ persister }}
		on:success={() => console.log('internet on - restored')}
	>
		<slot />
		<SvelteQueryDevtools />
	</PersistQueryClientProvider>
{:else}
	<slot />
{/if}
