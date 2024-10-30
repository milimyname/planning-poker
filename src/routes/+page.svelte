<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { browser, dev } from '$app/environment';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import { insertGameSchema, type InsertGame, type InsertPlayer } from '$lib/validators';
	import { createGame } from '$lib/electric-actions/game';
	import { createPlayer } from '$lib/electric-actions/player';
	import { createMutation } from '@tanstack/svelte-query';
	import { v4 as uuidv4 } from 'uuid';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	export let data;

	const newGame = $page.url.searchParams.get('newGame')
		? JSON.parse($page.url.searchParams.get('newGame') || '{}')
		: undefined;

	$: if (newGame) open = true;

	let open = false;

	const addGameMutation = createMutation({
		mutationFn: (newGame: InsertGame) => createGame(newGame),
		mutationKey: ['add-game']
	});

	const addPlayerMutation = createMutation({
		mutationFn: (newPlayer: InsertPlayer) => createPlayer(newPlayer),
		mutationKey: ['add-player']
	});

	const form = superForm(data.form, {
		SPA: true,
		validators: zodClient(insertGameSchema),
		resetForm: true,
		onUpdated: async ({ form: f }) => {
			if (!f.valid) {
				toast.error('Please fix the errors in the form.');
				return;
			}

			const createSession = async () => {
				const newPlayer = await $addPlayerMutation.mutateAsync({
					id: uuidv4(),
					name: f.data.playerName
				});

				localStorage.setItem('currentPlayer', JSON.stringify(newPlayer[0].value));

				const newGame = await $addGameMutation.mutateAsync({
					id: uuidv4(),
					name: f.data.name,
					cards: '1,2,3,5,8,13',
					status: 'voting',
					creatorId: newPlayer[0].value.id,
					autoReveal: false,
					playerName: f.data.playerName
				});

				await data.updateCurrentPlayer(newPlayer[0].value);

				return { player: newPlayer[0].value, game: newGame[0].value };
			};

			toast.promise(createSession(), {
				loading: 'Creating session...',
				success: (data) => `Created new session: ${data.game.name}`,
				error: 'Failed to create session. Please try again.'
			});

			const result = await createSession();
			goto(`/game/${result.game.id}`);
		}
	});

	const { form: formData, enhance, submitting } = form;

	$: selectedCards = $formData.cards
		? {
				label: $formData.cards,
				value: $formData.cards
			}
		: undefined;

	$: if (open) $formData.id = uuidv4();

	$: if (submitting) {
		toast.info('Creating session...');
	}
</script>

<Dialog.Root bind:open>
	<div class="grid h-screen w-full place-content-center">
		<div class="flex gap-2">
			<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>
				Create a new session
			</Dialog.Trigger>
		</div>
	</div>
	<Dialog.Content class="sm:max-w-xl">
		<Dialog.Header>
			<Dialog.Title>Create a new session</Dialog.Title>
			<Dialog.Description>
				You can share this link with others to allow them to join the session.
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<form method="POST" class="w-full space-y-6" use:enhance>
				<Form.Field {form} name="name">
					<Form.Control let:attrs>
						<Form.Label>Session Name</Form.Label>
						<Input {...attrs} bind:value={$formData.name} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="playerName">
					<Form.Control let:attrs>
						<Form.Label>Your Name</Form.Label>
						<Input {...attrs} bind:value={$formData.playerName} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="cards">
					<Form.Control let:attrs>
						<Form.Label>Cards</Form.Label>
						<Select.Root
							selected={selectedCards}
							onSelectedChange={(v) => {
								v && ($formData.cards = v.value);
							}}
						>
							<Select.Trigger {...attrs}>
								<Select.Value />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="viadukt" label="viadukt" />
							</Select.Content>
						</Select.Root>
						<input hidden bind:value={$formData.cards} name={attrs.name} />
					</Form.Control>

					<Form.FieldErrors />
				</Form.Field>
				{#if browser && dev}
					<SuperDebug data={$formData} />
				{/if}
				<Dialog.Footer>
					<Form.Button disabled={$submitting}>Create</Form.Button>
				</Dialog.Footer>
			</form>
		</div>
	</Dialog.Content>
</Dialog.Root>
