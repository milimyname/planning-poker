import { db } from '$lib/server/db';
import { games, players, playerGames } from '$lib/server/schema';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

const shapeMap = {
	games,
	players,
	playerGames
};

export const POST = async ({ params, request }) => {
	const { slug } = params;
	const shape = shapeMap[slug];

	if (!shape) return json({ error: `Invalid shape: ${slug}` }, { status: 400 });

	const body = await request.json();

	try {
		let result;

		await db.transaction(async (tx) => {
			[result] = await tx.insert(shape).values(body).returning();

			switch (slug) {
				case 'games':
					if (!body.creatorId) throw new Error('creatorId is required for creating a game');

					await tx.insert(playerGames).values({
						playerId: body.creatorId,
						gameId: result.id,
						isCreator: true
					});
					break;
			}
		});

		return json({ message: `${slug} added`, data: result }, { status: 200 });
	} catch (error) {
		console.error(`Error adding ${slug}:`, error);
		return json({ error: `Failed to add ${slug}: ${error.message}` }, { status: 500 });
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
