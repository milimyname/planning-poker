import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

// Caddy server
// export const BASE_URL = env.PUBLIC_ELECTRIC_URL ?? `http://localhost:3001`;

export const BASE_URL = env.PUBLIC_ELECTRIC_URL ?? `http://localhost:3000`;

export const BASE_API_URL = browser
	? `${window.location.origin}/api/shapes`
	: 'http://localhost:5173/api/shapes';

export const ESTIMATE_SELECTIONS = ['1,2,3,5,8,13,21'];
