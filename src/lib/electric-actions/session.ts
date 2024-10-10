import { getShapeStream } from '$lib/electric-store';
import { matchStream } from '$lib/match-stream';
import { type InsertSession } from '$lib/validators';
import { BASE_URL, BASE_API_URL } from '$lib/constants';

export const sessionShape = () => ({
	url: new URL(`/v1/shape/sessions`, BASE_URL).href
});

export async function createSession(session: InsertSession) {
	const sessionStream = getShapeStream<InsertSession>(sessionShape());

	const findUpdatePromise = matchStream({
		stream: sessionStream,
		operations: ['insert'],
		matchFn: ({ message }) => message.value.id === session.id
	});

	const fetchPromise = fetch(`${BASE_API_URL}/sessions`, {
		method: `POST`,
		body: JSON.stringify(session)
	});
	return await Promise.all([findUpdatePromise, fetchPromise]);
}

export async function updateSession(session: InsertSession) {
	const sessionStream = getShapeStream<InsertSession>(sessionShape());

	const findUpdatePromise = matchStream({
		stream: sessionStream,
		operations: ['update'],
		matchFn: ({ message }) => message.value.id === session.id
	});

	const fetchPromise = fetch(`${BASE_API_URL}/sessions/item/${session.id}`, {
		method: `PUT`,
		body: JSON.stringify(session)
	});
	return await Promise.all([findUpdatePromise, fetchPromise]);
}
