import data from '@emoji-mart/data';

// Cache emojis after first load
let cachedEmojis: any[] | null = null;

function initEmojiCache() {
	if (!cachedEmojis) {
		// Initialize cache with valid emojis
		cachedEmojis = [];
		for (const key in data.emojis) {
			const emoji = data.emojis[key]?.skins;
			if (emoji) {
				cachedEmojis.push(emoji[0].native);
			}
		}
	}
}

/**
 * Generate a random emoji
 * @returns A random emoji character
 */
export function randomEmoji(): string {
	initEmojiCache();

	if (!cachedEmojis || cachedEmojis.length === 0) {
		console.warn('No emojis found in cache');
		return '😀'; // Fallback emoji
	}

	const randomIndex = Math.floor(Math.random() * cachedEmojis.length);
	return cachedEmojis[randomIndex];
}
