import { browser } from '$app/environment';

// export const BASE_URL = 'https://electric-on-fly-test-app-broken-tree-4950.fly.dev';

// export const BASE_URL = import.meta.env.ELECTRIC_URL ?? `http://localhost:3000`;

// Caddy server
export const BASE_URL = import.meta.env.ELECTRIC_URL ?? `http://localhost:3001`;

export const BASE_API_URL = browser
	? `${window.location.origin}/api/shapes`
	: 'http://localhost:5173/api/shapes'; // fallback for server-side rendering

export const ESTIMATE_SELECTIONS = ['1,2,3,5,8,13,21'];
