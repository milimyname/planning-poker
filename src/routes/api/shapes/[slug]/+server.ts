import { db } from '$lib/server/db';
import { gamesTable } from '$lib/server/schema';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

const shapeMap = {
	games: gamesTable
	// Add other shapes here, e.g.:
	// players: players,
};

export const POST = async ({ params, request }) => {
	const { slug } = params;
	const shape = shapeMap[slug];

	if (!shape) return json({ error: `Invalid shape: ${slug}` }, { status: 400 });

	const body = await request.json();

	try {
		const result = await db.insert(shape).values(body).returning();
		return json({ message: `${slug} added`, data: result[0] }, { status: 200 });
	} catch (error) {
		console.error(`Error adding ${slug}:`, error);
		return json({ error: `Failed to add ${slug}` }, { status: 500 });
	}
};

export const DELETE = async ({ params }) => {
	const { slug } = params;
	const shape = shapeMap[slug];

	if (!shape) return json({ error: `Invalid shape: ${slug}` }, { status: 400 });

	try {
		await db.delete(shape);
		return json({ message: `All ${slug} deleted` }, { status: 200 });
	} catch (error) {
		console.error(`Error deleting ${slug}:`, error);
		return json({ error: `Failed to delete ${slug}` }, { status: 500 });
	}
};

export const GET = async ({ params, url }) => {
	const { slug } = params;
	const shape = shapeMap[slug];

	if (!shape) return json({ error: `Invalid shape: ${slug}` }, { status: 400 });

	const id = url.searchParams.get('id');

	try {
		let query = db.select().from(shape);

		if (id) query = query.where(eq(shape.id, id));

		const result = await query;
		return json(result, { status: 200 });
	} catch (error) {
		console.error(`Error fetching ${slug}:`, error);
		return json({ error: `Failed to fetch ${slug}` }, { status: 500 });
	}
};
