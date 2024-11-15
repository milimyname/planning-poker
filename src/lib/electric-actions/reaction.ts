import { BASE_URL, BASE_API_URL } from '$lib/constants';
import { getShapeStream } from '$lib/electric-store';
import { matchStream } from '$lib/match-stream';
import { type InsertReaction } from '$lib/validators';

export const reactionShape = (where?: string) => ({
	url: new URL(`/v1/shape?table=reactions&${where}`, BASE_URL).href
});

export async function createReaction(reaction: InsertReaction) {
	const reactionsStream = getShapeStream<InsertReaction>(reactionShape());

	const findUpdatePromise = matchStream({
		stream: reactionsStream,
		operations: ['insert'],
		matchFn: ({ message }) => message.value.id === reaction.id
	});

	const fetchPromise = fetch(`${BASE_API_URL}/reactions`, {
		method: `POST`,
		body: JSON.stringify(reaction)
	});
	return await Promise.all([findUpdatePromise, fetchPromise]);
}

export async function deleteReaction(reaction: InsertReaction) {
	const reactionsStream = getShapeStream<InsertReaction>(reactionShape());

	const streamPromise = matchStream({
		stream: reactionsStream,
		operations: ['delete'],
		matchFn: ({ message }) => message.value.id === reaction.id
	});

	const fetchPromise = fetch(`${BASE_API_URL}/reactions/item/${reaction.id}`, {
		method: 'DELETE'
	});

	return await Promise.all([streamPromise, fetchPromise]);
}

export async function clearReactionsBySessionId(sessionId: string) {
	const reactionsStream = getShapeStream<InsertReaction>(reactionShape(`sessionId=${sessionId}`));

	const streamPromise = matchStream({
		stream: reactionsStream,
		operations: ['delete'],
		matchFn: ({ message }) => message.value.sessionId === sessionId
	});

	const fetchPromise = fetch(`${BASE_API_URL}/reactions`, {
		method: 'DELETE'
	});

	return await Promise.all([streamPromise, fetchPromise]);
}
