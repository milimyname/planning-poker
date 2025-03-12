import { db } from '$lib/server/db';
import { games, players, playerInGames, votes, sessions, reactions } from '$lib/server/schema';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

const shapeMap = {
	games,
	players,
	playerInGames,
	votes,
	sessions,
	reactions
};

export const POST = async ({ params, request }) => {
	const { shapeSlug } = params;
	const shape = shapeMap[shapeSlug];

	if (!shape) return json({ error: `Invalid shape: ${shapeSlug}` }, { status: 400 });

	const body = await request.json();

	try {
		let result;

		await db.transaction(async (tx) => {
			[result] = await tx.insert(shape).values(body).returning();

			switch (shapeSlug) {
				case 'games':
					if (!body.creatorId) throw new Error('creatorId is required for creating a game');

					await tx.insert(playerInGames).values({
						playerId: body.creatorId,
						gameId: result.id,
						isCreator: true
					});
					break;
				// case 'votes':
				// 	if (!body.sessionId) throw new Error('sessionId is required for creating a vote');
				// 	if (!body.playerId) throw new Error('playerId is required for creating a vote');

				// 	await tx.insert(sessions).values({ id: body.sessionId, gameId: body.gameId });
				// 	await tx.insert(players).values({ id: body.playerId, name: body.playerName });
				// 	break;
			}
		});

		return json({ message: `${shapeSlug} added`, data: result }, { status: 200 });
	} catch (error) {
		console.error(`Error adding ${shapeSlug}:`, error);
		return json({ error: `Failed to add ${shapeSlug}: ${error.message}` }, { status: 500 });
	}
};

export const DELETE = async ({ params, request }) => {
	const { shapeSlug } = params;
	const shape = shapeMap[shapeSlug];

	if (!shape) return json({ error: `Invalid shape: ${shapeSlug}` }, { status: 400 });

	const body = await request.json();

	try {
		await db.delete(shape);

		let result: any;

		await db.transaction(async (tx) => {
			switch (shapeSlug) {
				case 'reactions':
					if (!body.sessionId)
						throw new Error('sessionId is required for clearing all reactions in a session');

					await tx.delete(reactions).where(eq(reactions.sessionId, body.sessionId));

					return json(
						{ message: `All reactions in session ${body.sessionId} deleted`, data: result },
						{ status: 200 }
					);

					break;
			}
			[result] = await tx.insert(shape).values(body).returning();
		});

		return json({ message: `All ${shapeSlug} deleted`, data: result }, { status: 200 });
	} catch (error) {
		console.error(`Error deleting ${shapeSlug}:`, error);
		return json({ error: `Failed to delete ${shapeSlug}` }, { status: 500 });
	}
};

export const GET = async ({ params, url }) => {
	const { shapeSlug } = params;
	const shape = shapeMap[shapeSlug];

	if (!shape) return json({ error: `Invalid shape: ${shapeSlug}` }, { status: 400 });

	const id = url.searchParams.get('id');

	try {
		let query = db.select().from(shape);

		if (id) query = query.where(eq(shape.id, id));

		const result = await query;
		return json(result, { status: 200 });
	} catch (error) {
		console.error(`Error fetching ${shapeSlug}:`, error);
		return json({ error: `Failed to fetch ${shapeSlug}` }, { status: 500 });
	}
};
