import { BASE_API_URL, BASE_URL } from '$lib/constants';
import type { ApiResponse } from '$lib/types/api';
import { type VoteType } from '$lib/validators';
import { ofetch } from 'ofetch';
import { useShape, type UseShapeResult } from 'svelte-electricsql';

export class Vote {
	private _shape: UseShapeResult<VoteType> | undefined;
	table = 'votes';

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

	async create(body: VoteType): Promise<VoteType> {
		const json = await ofetch<ApiResponse<VoteType>>(`${BASE_API_URL}/${this.table}`, {
			method: 'POST',
			body
		});
		return json.data;
	}

	update(vote: VoteType) {
		fetch(`${BASE_API_URL}/${this.table}/item/${vote.id}`, {
			method: `PUT`,
			body: JSON.stringify(vote)
		});
	}
}
