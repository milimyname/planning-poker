import { z } from 'zod';

export const gameSchema = z.object({
	id: z.string().uuid().optional(),
	name: z.string(),
	createdAt: z.date(),
	cards: z.string(),
	status: z.enum(['voting', 'revealed', 'completed']).default('voting')
});

export type Game = z.infer<typeof gameSchema>;

export const insertGameSchema = gameSchema.omit({ createdAt: true });

export type InsertGame = z.infer<typeof insertGameSchema>;
