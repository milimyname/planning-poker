import { BASE_API_URL, BASE_URL } from '$lib/constants';
import { type InsertSession } from '$lib/validators';
import { useShape, type UseShapeResult } from 'svelte-electricsql';

export class Player {
	shape: UseShapeResult<InsertSession>;
	table = 'sessions';

	constructor(where?: string) {
		this.shape = useShape({
			url: new URL(`/v1/shape`, BASE_URL).href,
			params: {
				table: this.table,
				where
			}
		});
	}

	create(session: InsertSession) {
		fetch(`${BASE_API_URL}/${this.table}`, {
			method: 'POST',
			body: JSON.stringify(session),
			headers: { 'Content-Type': 'application/json' }
		});
	}

	update(session: InsertSession) {
		fetch(`${BASE_API_URL}/${this.table}/item/${session.id}`, {
			method: `PUT`,
			body: JSON.stringify(session)
		});
	}
}
