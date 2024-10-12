import { BASE_URL, BASE_API_URL } from '$lib/constants';
import { getShapeStream } from '$lib/electric-store';
import { matchStream } from '$lib/match-stream';
import { type InsertPlayer } from '$lib/validators';

export const playerShape = (where?: string) => ({
	url: new URL(`/v1/shape/players?${where}`, BASE_URL).href
});

export async function createPlayer(player: InsertPlayer) {
	const playersStream = getShapeStream<InsertPlayer>(playerShape());

	const findUpdatePromise = matchStream({
		stream: playersStream,
		operations: ['insert'],
		matchFn: ({ message }) => message.value.id === player.id
	});

	const fetchPromise = fetch(`${BASE_API_URL}/players`, {
		method: `POST`,
		body: JSON.stringify(player)
	});
	return await Promise.all([findUpdatePromise, fetchPromise]);
}

export async function clearInvitees(player: InsertPlayer) {
	const playersStream = getShapeStream<InsertPlayer>(playerShape());

	const streamPromise = matchStream({
		stream: playersStream,
		operations: ['delete'],
		matchFn: ({ message }) => message.value.id !== player.id
	});

	const fetchPromise = fetch(`${BASE_API_URL}/players/item/${player.id}`, {
		method: 'DELETE'
	});

	return await Promise.all([streamPromise, fetchPromise]);
}

export async function deletePlayer(player: InsertPlayer) {
	const playersStream = getShapeStream<InsertPlayer>(playerShape());

	const streamPromise = matchStream({
		stream: playersStream,
		operations: ['delete'],
		matchFn: ({ message }) => message.value.id === player.id
	});

	const fetchPromise = fetch(`${BASE_API_URL}/players/item/${player.id}`, {
		method: 'DELETE'
	});

	return await Promise.all([streamPromise, fetchPromise]);
}
