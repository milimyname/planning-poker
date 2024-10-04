import type { PersistedClient, Persister } from './persist';
import type { PersistRetryer } from './retry-strategies';

interface Storage {
	getItem: (key: string) => string | null;
	setItem: (key: string, value: string) => void;
	removeItem: (key: string) => void;
}

interface CreateSyncStoragePersisterOptions {
	storage: Storage | undefined;
	key?: string;
	throttleTime?: number;
	serialize?: (client: PersistedClient) => string;
	deserialize?: (cachedString: string) => PersistedClient;
	retry?: PersistRetryer;
}

export function createSyncStoragePersister({
	storage,
	key = 'SVELTE_QUERY_OFFLINE_CACHE',
	throttleTime = 1000,
	serialize = JSON.stringify,
	deserialize = JSON.parse,
	retry
}: CreateSyncStoragePersisterOptions): Persister {
	if (typeof storage !== 'undefined') {
		const trySave = (persistedClient: PersistedClient): Error | undefined => {
			try {
				storage.setItem(key, serialize(persistedClient));
				return;
			} catch (error) {
				return error as Error;
			}
		};

		return {
			persistClient: throttle((persistedClient) => {
				let client: PersistedClient | undefined = persistedClient;
				let error = trySave(client);
				let errorCount = 0;
				while (error && client) {
					errorCount++;
					client = retry?.({
						persistedClient: client,
						error,
						errorCount
					});

					if (client) {
						error = trySave(client);
					}
				}
			}, throttleTime),
			restoreClient: () => {
				const cacheString = storage.getItem(key);
				if (!cacheString) {
					return;
				}
				return deserialize(cacheString) as PersistedClient;
			},
			removeClient: () => {
				storage.removeItem(key);
			}
		};
	}

	return {
		persistClient: noop,
		restoreClient: () => undefined,
		removeClient: noop
	};
}

function throttle<TArgs extends unknown[]>(func: (...args: TArgs) => unknown, wait = 100) {
	let timer: ReturnType<typeof setTimeout> | null = null;
	let params: TArgs;
	return function (...args: TArgs) {
		params = args;
		if (timer === null) {
			timer = setTimeout(() => {
				func(...params);
				timer = null;
			}, wait);
		}
	};
}

function noop() {}
