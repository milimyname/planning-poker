import { ShapeStream, Shape, type ShapeStreamOptions, type Row } from '@electric-sql/client';
import { writable, type Readable } from 'svelte/store';

const streamCache = new Map<string, ShapeStream>();
const shapeCache = new Map<ShapeStream, Shape>();

function sortedOptionsHash(options: ShapeStreamOptions): string {
	return JSON.stringify(options, Object.keys(options).sort());
}

export function getShapeStream<T extends Row = Row>(options: ShapeStreamOptions): ShapeStream<T> {
	const shapeHash = sortedOptionsHash(options);
	if (!streamCache.has(shapeHash)) {
		streamCache.set(shapeHash, new ShapeStream<T>(options));
	}
	return streamCache.get(shapeHash)! as ShapeStream<T>;
}

export function getShape<T extends Row>(shapeStream: ShapeStream<T>): Shape<T> {
	if (!shapeCache.has(shapeStream)) {
		shapeCache.set(shapeStream, new Shape<T>(shapeStream));
	}
	return shapeCache.get(shapeStream)! as Shape<T>;
}

export interface ShapeStoreData<T extends Row = Row> {
	data: T[];
	isLoading: boolean;
	lastSyncedAt?: number;
	error: any;
}

export function createShapeStore<T extends Row = Row>(
	options: ShapeStreamOptions
): Readable<ShapeStoreData<T>> & { init: () => void } {
	const { subscribe, set } = writable<ShapeStoreData<T>>({
		data: [],
		isLoading: true,
		error: null
	});

	let shape: Shape<T>;

	function initializeShape() {
		const shapeStream = getShapeStream<T>(options);
		shape = getShape<T>(shapeStream);

		shape.subscribe(() => {
			set({
				data: Array.from(shape.valueSync?.values() || []),
				isLoading: shape.isLoading(),
				lastSyncedAt: shape.lastSyncedAt(),
				error: shape.error
			});
		});

		shape.value
			.then(() => {
				set({
					data: Array.from(shape.valueSync?.values() || []),
					isLoading: false,
					lastSyncedAt: shape.lastSyncedAt(),
					error: null
				});
			})
			.catch((error) => {
				set({
					data: [],
					isLoading: false,
					error
				});
			});
	}

	return {
		subscribe,
		init: initializeShape
	};
}
