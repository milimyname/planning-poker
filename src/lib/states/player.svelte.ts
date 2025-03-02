import { BASE_API_URL, BASE_URL } from '$lib/constants';
import { type InsertPlayer } from '$lib/validators';
import { useShape, type UseShapeResult } from 'svelte-electricsql';

export class Player {
	shape: UseShapeResult<InsertPlayer>;
	table = 'players';

	constructor(where?: string) {
		this.shape = useShape({
			url: new URL(`/v1/shape`, BASE_URL).href,
			params: {
				table: this.table,
				where
			}
		});
	}

	create(player: InsertPlayer) {
		fetch(`${BASE_API_URL}/${this.table}`, {
			method: 'POST',
			body: JSON.stringify(player),
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// Clear all players in a session
	clearInvitees(player: InsertPlayer) {
		fetch(`${BASE_API_URL}/${this.table}/item/${player.id}`, {
			method: 'DELETE'
		});
	}

	delete(player: InsertPlayer) {
		fetch(`${BASE_API_URL}/${this.table}/item/${player.id}`, {
			method: 'DELETE'
		});
	}
}
