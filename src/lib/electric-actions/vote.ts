import { getShapeStream } from '$lib/electric-store';
import { matchStream } from '$lib/match-stream';
import { type InsertVote } from '$lib/validators';
import { BASE_URL, BASE_API_URL } from '$lib/constants';

export const voteShape = () => ({
	url: new URL(`/v1/shape?table=votes`, BASE_URL).href
});

export async function createVote(vote: InsertVote) {
	const voteStream = getShapeStream<InsertVote>(voteShape());

	const findUpdatePromise = matchStream({
		stream: voteStream,
		operations: ['insert'],
		matchFn: ({ message }) => message.value.id === vote.id
	});

	const fetchPromise = fetch(`${BASE_API_URL}/votes`, {
		method: `POST`,
		body: JSON.stringify(vote)
	});
	return await Promise.all([findUpdatePromise, fetchPromise]);
}

export async function updateVote(vote: InsertVote) {
	const voteStream = getShapeStream<InsertVote>(voteShape());

	const findUpdatePromise = matchStream({
		stream: voteStream,
		operations: ['update'],
		matchFn: ({ message }) => message.value.id === vote.id
	});

	const fetchPromise = fetch(`${BASE_API_URL}/votes/item/${vote.id}`, {
		method: `PUT`,
		body: JSON.stringify(vote)
	});
	return await Promise.all([findUpdatePromise, fetchPromise]);
}
