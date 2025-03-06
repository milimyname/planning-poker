import { BASE_API_URL, BASE_URL } from '$lib/constants';
import type { ApiResponse } from '$lib/types/api';
import { type SessionType } from '$lib/validators';
import { ofetch } from 'ofetch';
import { useShape, type UseShapeResult } from 'svelte-electricsql';

export class Session {
	private _shape: UseShapeResult<SessionType> | undefined;
	table = 'sessions';

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

	async create(body: SessionType): Promise<SessionType> {
		const json = await ofetch<ApiResponse<SessionType>>(`${BASE_API_URL}/${this.table}`, {
			method: 'POST',
			body
		});
		return json.data;
	}

	update(session: SessionType) {
		fetch(`${BASE_API_URL}/${this.table}/item/${session.id}`, {
			method: `PUT`,
			body: JSON.stringify(session)
		});
	}
}
