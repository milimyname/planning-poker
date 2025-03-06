import { BASE_API_URL, BASE_URL } from '$lib/constants';
import { type ReactionType } from '$lib/validators';
import { useShape, type UseShapeResult } from 'svelte-electricsql';

export class Reaction {
	private _shape: UseShapeResult<ReactionType> | undefined;
	table = 'reactions';

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

	create(reaction: ReactionType) {
		fetch(`${BASE_API_URL}/${this.table}`, {
			method: 'POST',
			body: JSON.stringify(reaction),
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// Clear all reactions in a session
	clearReactions() {
		fetch(`${BASE_API_URL}/${this.table}`, {
			method: 'DELETE'
		});
	}

	delete(reaction: ReactionType) {
		fetch(`${BASE_API_URL}/${this.table}/item/${reaction.id}`, {
			method: 'DELETE'
		});
	}

	deleteInSession(sessionId: string) {
		fetch(`${BASE_API_URL}/${this.table}`, {
			method: 'DELETE',
			body: JSON.stringify({ sessionId })
		});
	}
}
