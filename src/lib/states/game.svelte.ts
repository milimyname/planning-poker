import { BASE_API_URL, BASE_URL } from '$lib/constants';
import { type InsertGame } from '$lib/validators';
import { useShape, type UseShapeResult } from 'svelte-electricsql';

export class Game {
	shape: UseShapeResult<InsertGame>;
	table = 'games';

	constructor(where?: string) {
		this.shape = useShape({
			url: new URL(`/v1/shape`, BASE_URL).href,
			params: {
				table: this.table,
				where
			}
		});
	}

	create(game: InsertGame) {
		fetch(`${BASE_API_URL}/${this.table}`, {
			method: 'POST',
			body: JSON.stringify(game),
			headers: { 'Content-Type': 'application/json' }
		});
	}

	clear() {
		fetch(`${BASE_API_URL}/${this.table}`, { method: `DELETE` });
	}

	update(game: InsertGame) {
		fetch(`${BASE_API_URL}/${this.table}/item/${game.id}`, {
			method: `PUT`,
			body: JSON.stringify(game)
		});
	}
}
