import { browser } from '$app/environment';

export const BASE_URL = import.meta.env.ELECTRIC_URL ?? `http://localhost:3000`;

export const BASE_API_URL = browser
	? `${window.location.origin}/api/shapes`
	: 'http://localhost:5173/api/shapes'; // fallback for server-side rendering
