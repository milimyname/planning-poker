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
	import { gameSchema } from '$lib/validators';
	import { v4 as uuidv4 } from 'uuid';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { ESTIMATE_SELECTIONS } from '$lib/constants.js';
	import { Player, Game } from '$lib/states';

	let { data } = $props();

	const player = new Player();
	const game = new Game();

	const newGame = page.url.searchParams.get('newGame')
		? JSON.parse(page.url.searchParams.get('newGame') || '{}')
		: undefined;

	$effect(() => {
		if (newGame) open = true;
	});

	let open = $state(false);

	const form = superForm(data.form, {
		SPA: true,
		validators: zodClient(gameSchema),
		resetForm: true,
		onUpdated: async ({ form: f }) => {
			if (!f.valid) {
				toast.error('Please fix the errors in the form.');
				return;
			}

			const createSession = async () => {
				const creator = await player.create({
					id: uuidv4(),
					name: f.data.playerName
				});

				localStorage.setItem('currentPlayer', JSON.stringify(creator));

				if (!creator.id) {
					toast.error('Player ID is missing.');
					return;
				}

				const newGame = await game.create({
					id: uuidv4(),
					name: f.data.name,
					cards: f.data.cards,
					status: 'voting',
					creatorId: creator.id,
					autoReveal: false,
					playerName: f.data.playerName
				});

				await data.updateCurrentPlayer(creator);

				setTimeout(() => {}, 1000);

				return { game: newGame };
			};

			// Create the session once and store the promise
			const sessionPromise = createSession();

			// Use the same promise for both the toast and navigation
			toast.promise(sessionPromise, {
				loading: 'Creating session...',
				success: (data) => {
					goto(`/game/${data?.game.id}`);
					return `Created new session: ${data?.game.name}`;
				},
				error: 'Failed to create session. Please try again.'
			});
		}
	});

	const { form: formData, enhance, submitting } = form;

	let selectedCards = $derived(
		$formData.cards
			? {
					label: $formData.cards,
					value: $formData.cards
				}
			: undefined
	);

	$effect(() => {
		if (open) $formData.id = uuidv4();
	});

	$effect(() => {
		if ($submitting) toast.info('Creating session...');
	});
</script>

<Dialog.Root bind:open>
	<div class="grid h-screen w-full place-content-center">
		<div class="flex gap-2">
			<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>
				Create a new session
			</Dialog.Trigger>
		</div>
	</div>
	<Dialog.Content class="overflow-hidden sm:max-w-xl">
		<Dialog.Header>
			<Dialog.Title>Create a new session</Dialog.Title>
			<Dialog.Description>
				You can share this link with others to allow them to join the session.
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<form method="POST" class="w-full space-y-6" use:enhance>
				<Form.Field {form} name="name">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Session Name</Form.Label>
							<Input {...props} bind:value={$formData.name} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="playerName">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Your Name</Form.Label>
							<Input {...props} bind:value={$formData.playerName} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="cards">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Cards</Form.Label>
							<Select.Root type="single" bind:value={$formData.cards} name={props.name}>
								<Select.Trigger {...props}>
									{selectedCards ? selectedCards.label : 'Select a card set'}
								</Select.Trigger>
								<Select.Content>
									{#each ESTIMATE_SELECTIONS as selection}
										<Select.Item value={selection} label={selection} />
									{/each}
								</Select.Content>
							</Select.Root>
							<input hidden bind:value={$formData.cards} name={props.name} />
						{/snippet}
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
