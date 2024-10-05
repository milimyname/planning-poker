import { insertGameSchema } from '$lib/validators';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async () => {
	const form = await superValidate(zod(insertGameSchema));

	return { form };
};
