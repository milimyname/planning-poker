import { browser } from '$app/environment';
import { PUBLIC_ELECTRIC_URL } from '$env/static/public';

// Caddy server
// export const BASE_URL = PUBLIC_ELECTRIC_URL ?? `http://localhost:3001`;

export const BASE_URL = PUBLIC_ELECTRIC_URL ?? `http://localhost:3000`;

console.log('BASE_URL', BASE_URL);

export const BASE_API_URL = browser
	? `${window.location.origin}/api/shapes`
	: 'http://localhost:5173/api/shapes'; // fallback for server-side rendering

export const ESTIMATE_SELECTIONS = ['1,2,3,5,8,13,21'];
