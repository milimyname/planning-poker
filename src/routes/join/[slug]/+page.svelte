<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import * as Form from '$lib/components/ui/form';
	import { insertPlayerSchema, type InsertPlayer } from '$lib/validators';
	import { createPlayer } from '$lib/electric-actions/player';
	import { createMutation } from '@tanstack/svelte-query';
	import { v4 as uuidv4 } from 'uuid';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { createPlayerGame } from '$lib/electric-actions/playerGames.js';

	let { data } = $props();

	let slug = $page.params.slug;

	const addPlayerMutation = createMutation({
		mutationFn: (newPlayer: InsertPlayer) => createPlayer(newPlayer),
		mutationKey: ['add-player']
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

			const newInvitee = await $addPlayerMutation.mutateAsync({
				id: uuidv4(),
				gameId: slug,
				name: f.data.name
			});

			localStorage.setItem('currentPlayer', JSON.stringify(newInvitee[0].value));

			createPlayerGame({
				gameId: slug,
				playerId: newInvitee[0].value.id
			});

			await data.updateCurrentPlayer(newInvitee[0].value);

			goto(`/game/${slug}`);
		}
	});

	$effect(() => {
		const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
		if (nameInput) nameInput.focus();
	});

	const { form: formData, enhance } = form;

	$effect(() => {
		$formData.id = uuidv4();
	});
	$effect(() => {
		$formData.gameId = slug;
	});
</script>

<AlertDialog.Root open={true}>
	<AlertDialog.Content class="sm:max-w-xl">
		<AlertDialog.Header>
			<AlertDialog.Title>Join the session</AlertDialog.Title>
			<AlertDialog.Description>Enter your name to get started.</AlertDialog.Description>
		</AlertDialog.Header>
		<div class="grid gap-4 py-4">
			<form method="POST" class="w-full space-y-6" use:enhance>
				<Form.Field {form} name="gameId">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Session</Form.Label>
							<Input {...props} bind:value={$formData.gameId} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="name">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Your Name</Form.Label>
							<Input {...props} bind:value={$formData.name} />
						{/snippet}
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
