import { getShapeStream } from '$lib/electric-store';
import { matchStream } from '$lib/match-stream';
import { type InsertPlayerGame } from '$lib/validators';
import { BASE_URL, BASE_API_URL } from '$lib/constants';

export const gameShape = () => ({
	url: new URL(`/v1/shape/player_games`, BASE_URL).href
});

export async function createPlayerGame(playerGame: InsertPlayerGame) {
	const playerGamesStream = getShapeStream<InsertPlayerGame>(gameShape());

	console.log('playerGame', playerGame);

	const findUpdatePromise = matchStream({
		stream: playerGamesStream,
		operations: ['insert'],
		matchFn: ({ message }) =>
			message.value.gameId === playerGame.gameId && message.value.playerId === playerGame.playerId
	});

	const fetchPromise = fetch(`${BASE_API_URL}/playerGames`, {
		method: `POST`,
		body: JSON.stringify(playerGame)
	});
	return await Promise.all([findUpdatePromise, fetchPromise]);
}
