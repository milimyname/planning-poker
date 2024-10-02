import { PG_POOL } from '$lib/server/db';
import { json } from '@sveltejs/kit';

export const POST = async ({ request }) => {
	const { id } = await request.json();

	try {
		await PG_POOL.query('INSERT INTO games (id) VALUES ($1);', [id]);
		return json({ message: `Game added with id ${id}` }, { status: 200 });
	} catch (error) {
		console.error('Error adding game:', error);
		return json({ error: 'Failed to add game' }, { status: 500 });
	}
};

export const DELETE = async () => {
	try {
		await PG_POOL.query('DELETE FROM games;');
		return json({ message: 'All games deleted' }, { status: 200 });
	} catch (error) {
		console.error('Error deleting games:', error);
		return json({ error: 'Failed to delete games' }, { status: 500 });
	}
};
