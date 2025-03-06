<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import * as Form from '$lib/components/ui/form';
	import { playerSchema } from '$lib/validators';
	import { v4 as uuidv4 } from 'uuid';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Player as ClassPlayer } from '$lib/states/player.svelte';
	import { PlayerInGames } from '$lib/states/player-in-games.svelte.js';

	let { data } = $props();

	let slug = page.params.slug;

	const player = new ClassPlayer();
	const playerInGames = new PlayerInGames();

	const form = superForm(data.form, {
		SPA: true,
		validators: zodClient(playerSchema),
		resetForm: true,
		onUpdated: async ({ form: f }) => {
			if (!f.valid) {
				toast.error('Please fix the errors in the form.');
				return;
			}

			toast.success(`You have joined the game as ${f.data.name}.`);

			if (!slug) {
				toast.error('Game ID is missing.');
				return;
			}

			const invitee = await player.create({
				id: uuidv4(),
				gameId: slug,
				name: f.data.name
			});

			localStorage.setItem('currentPlayer', JSON.stringify(invitee));

			if (!invitee.id) {
				toast.error('Player ID is missing.');
				return;
			}

			await playerInGames.create({
				gameId: slug,
				playerId: invitee.id
			});

			await data.updateCurrentPlayer(invitee);

			toast.promise(
				new Promise((resolve) =>
					setTimeout(
						() =>
							resolve({
								data: invitee
							}),
						500
					)
				),
				{
					loading: 'Joining the game...',
					success: () => {
						goto(`/game/${slug}`);
						return 'You have joined the game as ' + f.data.name + '.';
					},
					error: 'Failed to join the game.'
				}
			);
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
