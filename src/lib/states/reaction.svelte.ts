import { BASE_API_URL, BASE_URL } from '$lib/constants';
import { type InsertReaction } from '$lib/validators';
import { useShape, type UseShapeResult } from 'svelte-electricsql';

export class Reaction {
	shape: UseShapeResult<InsertReaction>;
	table = 'reactions';

	constructor(where?: string) {
		this.shape = useShape({
			url: new URL(`/v1/shape`, BASE_URL).href,
			params: {
				table: this.table,
				where
			}
		});
	}

	create(player: InsertReaction) {
		fetch(`${BASE_API_URL}/${this.table}`, {
			method: 'POST',
			body: JSON.stringify(player),
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// Clear all reactions in a session
	clearReactions() {
		fetch(`${BASE_API_URL}/${this.table}`, {
			method: 'DELETE'
		});
	}

	delete(player: InsertReaction) {
		fetch(`${BASE_API_URL}/${this.table}/item/${player.id}`, {
			method: 'DELETE'
		});
	}
}
