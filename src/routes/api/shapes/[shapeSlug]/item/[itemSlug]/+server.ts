import { db } from '$lib/server/db';
import { games, players, sessions, votes, reactions } from '$lib/server/schema';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

const shapeMap = {
	games,
	players,
	votes,
	sessions,
	reactions
};

// // New endpoint for deleting all except one
// export const DELETE = async ({ params }) => {
// 	const { slug, rest } = params;
// 	const shape = shapeMap[slug];

// 	if (!shape) return json({ error: `Invalid shape: ${slug}` }, { status: 400 });

// 	try {
// 		const result = await db.delete(shape).where(ne(shape.id, rest));
// 		const deletedCount = result.rowCount;
// 		return json(
// 			{
// 				message: `${deletedCount} ${slug}(s) deleted except ID ${rest}`,
// 				deletedCount
// 			},
// 			{ status: 200 }
// 		);
// 	} catch (error) {
// 		console.error(`Error deleting ${slug}:`, error);
// 		return json({ error: `Failed to delete ${slug}` }, { status: 500 });
// 	}
// };

export const DELETE = async ({ params }) => {
	const { shapeSlug, itemSlug } = params;
	const shape = shapeMap[shapeSlug];

	if (!shape) return json({ error: `Invalid shape: ${shapeSlug}` }, { status: 400 });

	if (!itemSlug) return json({ error: `Invalid ID: ${itemSlug}` }, { status: 400 });

	try {
		await db.delete(shape).where(eq(shape.id, itemSlug));

		return json({ message: `${shapeSlug} deleted`, id: itemSlug }, { status: 200 });
	} catch (error) {
		console.error(`Error deleting ${shapeSlug}:`, error);
		return json({ error: `Failed to delete ${shapeSlug}` }, { status: 500 });
	}
};

export const PUT = async ({ params, request }) => {
	const { shapeSlug, itemSlug } = params;
	const shape = shapeMap[shapeSlug];

	if (!shape) return json({ error: `Invalid shape: ${shapeSlug}` }, { status: 400 });

	if (!itemSlug) return json({ error: `Invalid ID: ${itemSlug}` }, { status: 400 });

	const body = await request.json();

	try {
		await db.update(shape).set(body).where(eq(shape.id, itemSlug));

		return json({ message: `${shapeSlug} updated`, id: itemSlug }, { status: 200 });
	} catch (error) {
		console.error(`Error updating ${shapeSlug}:`, error);
		return json({ error: `Failed to update ${shapeSlug}` }, { status: 500 });
	}
};
