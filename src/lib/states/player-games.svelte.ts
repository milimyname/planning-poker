import { BASE_API_URL, BASE_URL } from '$lib/constants';
import { type InsertPlayerGame } from '$lib/validators';
import { useShape, type UseShapeResult } from 'svelte-electricsql';

export class PlayerGame {
	shape: UseShapeResult<InsertPlayerGame>;
	table = 'player_games';

	constructor(where?: string) {
		this.shape = useShape({
			url: new URL(`/v1/shape`, BASE_URL).href,
			params: {
				table: this.table,
				where
			}
		});
	}

	create(playerGame: InsertPlayerGame) {
		fetch(`${BASE_API_URL}/playerGames`, {
			method: 'POST',
			body: JSON.stringify(playerGame),
			headers: { 'Content-Type': 'application/json' }
		});
	}
}
