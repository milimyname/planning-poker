import { getShapeStream } from '$lib/electric-store';
import { matchStream } from '$lib/match-stream';
import { type InsertGame } from '$lib/validators';

const baseUrl = import.meta.env.ELECTRIC_URL ?? `http://localhost:3000`;

const baseApiUrl = `http://localhost:5173/api/shapes`;

const gameShape = () => ({
	url: new URL(`/v1/shape/games`, baseUrl).href
});

export async function createGame(game: InsertGame) {
	const gamesStream = getShapeStream<InsertGame>(gameShape());

	const findUpdatePromise = matchStream({
		stream: gamesStream,
		operations: ['insert'],
		matchFn: ({ message }) => message.value.id === game.id
	});

	const fetchPromise = fetch(`${baseApiUrl}/games`, {
		method: `POST`,
		body: JSON.stringify(game)
	});
	return await Promise.all([findUpdatePromise, fetchPromise]);
}
