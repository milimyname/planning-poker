import { BASE_API_URL, BASE_URL } from '$lib/constants';
import { type InsertVote } from '$lib/validators';
import { useShape, type UseShapeResult } from 'svelte-electricsql';

export class Vote {
	shape: UseShapeResult<InsertVote>;
	table = 'votes';

	constructor(where?: string) {
		this.shape = useShape({
			url: new URL(`/v1/shape`, BASE_URL).href,
			params: {
				table: this.table,
				where
			}
		});
	}

	create(vote: InsertVote) {
		fetch(`${BASE_API_URL}/${this.table}`, {
			method: 'POST',
			body: JSON.stringify(vote),
			headers: { 'Content-Type': 'application/json' }
		});
	}

	update(vote: InsertVote) {
		fetch(`${BASE_API_URL}/${this.table}/item/${vote.id}`, {
			method: `PUT`,
			body: JSON.stringify(vote)
		});
	}
}
