import { BASE_API_URL, BASE_URL } from '$lib/constants';
import { type GameType } from '$lib/validators';
import { useShape, type UseShapeResult } from 'svelte-electricsql';
import { ofetch } from 'ofetch';
import type { ApiResponse } from '$lib/types/api';

export class Game {
	private _shape: UseShapeResult<GameType> | undefined;
	table = 'games';

	constructor() {}

	private initShape(where?: string) {
		if (!this._shape) {
			this._shape = useShape({
				url: new URL(`/v1/shape`, BASE_URL).href,
				params: {
					table: this.table,
					where
				}
			});
		}
		return this._shape;
	}

	fetchShape(where?: string) {
		return this.initShape(where);
	}

	async create(body: GameType): Promise<GameType> {
		const json = await ofetch<ApiResponse<GameType>>(`${BASE_API_URL}/${this.table}`, {
			method: 'POST',
			body
		});

		return json.data;
	}

	clear() {
		fetch(`${BASE_API_URL}/${this.table}`, { method: `DELETE` });
	}

	update(game: GameType) {
		fetch(`${BASE_API_URL}/${this.table}/item/${game.id}`, {
			method: `PUT`,
			body: JSON.stringify(game)
		});
	}
}
