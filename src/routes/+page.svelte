<script lang="ts">
	import { onMount } from 'svelte';
	import { createShapeStore, type ShapeStoreData } from '$lib/electric-store';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { browser } from '$app/environment';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import { insertGameSchema, type InsertGame } from '$lib/validators';
	import { createGame } from '$lib/electric-actions/game';
	import { writable } from 'svelte/store';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';

	export let data;

	const shapeStore = createShapeStore({
		url: 'http://localhost:3000/v1/shape/games'
	});

	const queryClient = useQueryClient();

	let shapeData: ShapeStoreData = {
		data: [],
		isLoading: true,
		error: null
	};

	$: ({ data: items, isLoading, error } = shapeData);

	let isOnline = true;

	const pendingMutations = writable<Map<string, InsertGame>>(new Map());

	onMount(() => {
		const unsubscribe = shapeStore.subscribe((value) => {
			shapeData = value;
			// Remove pending mutations that are now in the actual data
			pendingMutations.update((pending) => {
				value.data.forEach((game) => {
					pending.delete(game.id);
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

	const addGameMutation = createMutation({
		mutationFn: (newGame: InsertGame) => createGame(newGame),
		onMutate: (newGame) => {
			pendingMutations.update((pending) => {
				pending.set(newGame.id, newGame);
				return pending;
			});
		},
		onSettled: (variables) => {
			pendingMutations.update((pending) => {
				pending.delete(variables.id);
				return pending;
			});
		}
	});

	const form = superForm(data.form, {
		SPA: true,
		validators: zodClient(insertGameSchema),
		onUpdated: ({ form: f }) => {
			if (f.valid) {
				toast.success(`You submitted ${JSON.stringify(f.data, null, 2)}`);
				$addGameMutation.mutate({
					name: f.data.name,
					cards: f.data.cards,
					status: 'voting'
				});
			} else {
				toast.error('Please fix the errors in the form.');
			}
		}
	});

	const { form: formData, enhance } = form;

	$: selectedCards = $formData.cards
		? {
				label: $formData.cards,
				value: $formData.cards
			}
		: undefined;
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

<Dialog.Root>
	<div class="grid h-screen w-full place-content-center">
		<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>
			Create a new session
		</Dialog.Trigger>
	</div>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Create a new session</Dialog.Title>
			<Dialog.Description>
				You can share this link with others to allow them to join the session.
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<form method="POST" class="w-2/3 space-y-6" use:enhance>
				<Form.Field {form} name="name">
					<Form.Control let:attrs>
						<Form.Label>Name</Form.Label>
						<Input {...attrs} bind:value={$formData.name} />
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
								<Select.Value placeholder="Cards" />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="viadukt" label="viadukt" />
							</Select.Content>
						</Select.Root>
						<input hidden bind:value={$formData.cards} name={attrs.name} />
					</Form.Control>

					<Form.FieldErrors />
				</Form.Field>
				<Form.Button>Submit</Form.Button>
				{#if browser}
					<SuperDebug data={$formData} />
				{/if}
			</form>
		</div>
		<Dialog.Footer>
			<Button type="submit">Save changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
