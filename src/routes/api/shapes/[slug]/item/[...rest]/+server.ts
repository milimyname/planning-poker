import { db } from '$lib/server/db';
import { games, players } from '$lib/server/schema';
import { json } from '@sveltejs/kit';
import { ne } from 'drizzle-orm';

const shapeMap = {
	games,
	players
};

// New endpoint for deleting all except one
export const DELETE = async ({ params }) => {
	const { slug, rest } = params;
	const shape = shapeMap[slug];

	if (!shape) return json({ error: `Invalid shape: ${slug}` }, { status: 400 });

	try {
		const result = await db.delete(shape).where(ne(shape.id, rest));
		const deletedCount = result.rowCount;
		return json(
			{
				message: `${deletedCount} ${slug}(s) deleted except ID ${rest}`,
				deletedCount
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error(`Error deleting ${slug}:`, error);
		return json({ error: `Failed to delete ${slug}` }, { status: 500 });
	}
};
