<script lang="ts">
	import '../app.css';
	import { createSyncStoragePersister } from '$lib/tanstack/create-sync-storage-persister';
	import PersistQueryClientProvider from '$lib/tanstack/persist-query-client-provider.svelte';
	import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';
	import { browser } from '$app/environment';
	import { Toaster } from '$lib/components/ui/sonner';

	export let data;

	const persister = browser
		? createSyncStoragePersister({
				storage: window.localStorage
			})
		: undefined;
</script>

<Toaster />

<PersistQueryClientProvider
	client={data.queryClient}
	persistOptions={{ persister }}
	on:success={() => console.log('internet on - restored')}
>
	<slot />
	<SvelteQueryDevtools />
</PersistQueryClientProvider>
