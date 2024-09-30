// lib/electricStore.ts
import { Shape, ShapeStream, type ShapeStreamOptions, type Row } from '@electric-sql/client';
import { writable, derived, type Readable } from 'svelte/store';

const streamCache = new Map<string, ShapeStream>();
const shapeCache = new Map<ShapeStream, Shape>();

export async function preloadShape<T extends Row = Row>(
	options: ShapeStreamOptions
): Promise<Shape<T>> {
	const shapeStream = getShapeStream<T>(options);
	const shape = getShape<T>(shapeStream);
	await shape.value;
	return shape;
}

export function sortedOptionsHash(options: ShapeStreamOptions): string {
	return JSON.stringify(options, Object.keys(options).sort());
}

export function getShapeStream<T extends Row = Row>(options: ShapeStreamOptions): ShapeStream<T> {
	const shapeHash = sortedOptionsHash(options);

	if (streamCache.has(shapeHash)) {
		return streamCache.get(shapeHash)! as ShapeStream<T>;
	} else {
		const newShapeStream = new ShapeStream<T>(options);
		streamCache.set(shapeHash, newShapeStream);
		return newShapeStream;
	}
}

export function getShape<T extends Row>(shapeStream: ShapeStream<T>): Shape<T> {
	if (shapeCache.has(shapeStream)) {
		return shapeCache.get(shapeStream)! as Shape<T>;
	} else {
		const newShape = new Shape<T>(shapeStream);
		shapeCache.set(shapeStream, newShape);
		return newShape;
	}
}

export interface UseShapeResult<T extends Row = Row> {
	data: T[];
	shape: Shape<T>;
	isLoading: boolean;
	lastSyncedAt?: number;
	error: Shape<T>['error'];
	isError: boolean;
}

function parseShapeData<T extends Row>(shape: Shape<T>): UseShapeResult<T> {
	return {
		data: [...shape.valueSync.values()],
		isLoading: shape.isLoading(),
		lastSyncedAt: shape.lastSyncedAt(),
		isError: shape.error !== false,
		shape,
		error: shape.error
	};
}

export function createShapeStore<T extends Row = Row>(
	options: ShapeStreamOptions
): Readable<UseShapeResult<T>> {
	const shapeStream = getShapeStream<T>(options);
	const shape = getShape<T>(shapeStream);

	const { subscribe } = writable<UseShapeResult<T>>(parseShapeData(shape), (set) => {
		const unsubscribe = shape.subscribe(() => {
			set(parseShapeData(shape));
		});

		return unsubscribe;
	});

	return { subscribe };
}

export function createDerivedShapeStore<T extends Row, U>(
	options: ShapeStreamOptions,
	selector: (value: UseShapeResult<T>) => U
): Readable<U> {
	const shapeStore = createShapeStore<T>(options);
	return derived(shapeStore, selector);
}
