import { BASE_API_URL, BASE_URL } from '$lib/constants';
import { type PlayerType } from '$lib/validators';
import { useShape, type UseShapeResult } from 'svelte-electricsql';
import { ofetch } from 'ofetch';
import type { ApiResponse } from '$lib/types/api';

export class Player {
	private _shape: UseShapeResult<PlayerType> | undefined;
	table = 'players';

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

	async create(body: PlayerType): Promise<PlayerType> {
		const json = await ofetch<ApiResponse<PlayerType>>(`${BASE_API_URL}/${this.table}`, {
			method: 'POST',
			body
		});
		return json.data;
	}

	// Clear all players in a session
	clearInvitees(player: PlayerType) {
		fetch(`${BASE_API_URL}/${this.table}/item/${player.id}`, {
			method: 'DELETE'
		});
	}

	delete(player: PlayerType) {
		fetch(`${BASE_API_URL}/${this.table}/item/${player.id}`, {
			method: 'DELETE'
		});
	}
}
