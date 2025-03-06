import { BASE_API_URL, BASE_URL } from '$lib/constants';
import { type PlayerInGamesType } from '$lib/validators';
import { useShape, type UseShapeResult, type ExternalParamsRecord } from 'svelte-electricsql';
import { ofetch } from 'ofetch';
import type { ApiResponse } from '$lib/types/api';

export class PlayerInGames {
	private _shape: UseShapeResult<PlayerInGamesType> | undefined;
	table = 'player_games';

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

	async create(body: PlayerInGamesType): Promise<PlayerInGamesType> {
		const json = await ofetch<ApiResponse<PlayerInGamesType>>(`${BASE_API_URL}/playerInGames`, {
			method: 'POST',
			body
		});

		return json.data;
	}

	getUserInGame(params: ExternalParamsRecord) {
		return useShape({
			url: new URL(`/v1/shape`, BASE_URL).href,
			params: {
				table: this.table,
				...params
			}
		});
	}
}
