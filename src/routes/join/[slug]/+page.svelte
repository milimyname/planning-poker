<script lang="ts">
	import { onMount } from 'svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import * as Form from '$lib/components/ui/form';
	import { insertPlayerSchema, type InsertPlayer } from '$lib/validators';
	import { clearGames } from '$lib/electric-actions/game';
	import { createPlayer } from '$lib/electric-actions/player';
	import { writable } from 'svelte/store';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { v4 as uuidv4 } from 'uuid';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	export let data;

	const queryClient = useQueryClient();

	let isOnline = true;
	let open = false;

	let slug = $page.params.slug;

	const pendingMutations = writable<Map<string, InsertPlayer>>(new Map());

	onMount(() => {
		isOnline = navigator.onLine;
		window.addEventListener('online', () => {
			isOnline = true;
			queryClient.resumePausedMutations();
		});
		window.addEventListener('offline', () => (isOnline = false));
	});

	const addPlayerMutation = createMutation({
		mutationFn: (newPlayer: InsertPlayer) => createPlayer(newPlayer),
		mutationKey: ['add-player']
	});

	const clearGamesMutation = createMutation({
		mutationKey: ['clearGames'],
		mutationFn: clearGames,
		onMutate: () => {
			pendingMutations.set(new Map());
		}
	});

	const form = superForm(data.form, {
		SPA: true,
		validators: zodClient(insertPlayerSchema),
		resetForm: true,
		onUpdated: async ({ form: f }) => {
			if (!f.valid) {
				toast.error('Please fix the errors in the form.');
				return;
			}

			toast.success(`You have joined the game as ${f.data.name}.`);

			$addPlayerMutation.mutate({
				id: uuidv4(),
				gameId: slug,
				name: f.data.name
			});

			goto(`/game/${slug}`);
		}
	});

	const { form: formData, enhance } = form;

	$: $formData.id = uuidv4();
	$: $formData.gameId = slug;
</script>

<AlertDialog.Root open={true}>
	<AlertDialog.Content class="sm:max-w-xl">
		<AlertDialog.Header>
			<AlertDialog.Title>Create a new session</AlertDialog.Title>
			<AlertDialog.Description>Enter your name to get started.</AlertDialog.Description>
		</AlertDialog.Header>
		<div class="grid gap-4 py-4">
			<form method="POST" class="w-2/3 space-y-6" use:enhance>
				<Form.Field {form} name="gameId">
					<Form.Control let:attrs>
						<Form.Label>Session</Form.Label>
						<Input {...attrs} bind:value={$formData.gameId} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="name">
					<Form.Control let:attrs>
						<Form.Label>Your Name</Form.Label>
						<Input {...attrs} bind:value={$formData.name} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<AlertDialog.Footer>
					<Form.Button>Save changes</Form.Button>
				</AlertDialog.Footer>
			</form>
		</div>
	</AlertDialog.Content>
</AlertDialog.Root>
