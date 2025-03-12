import { z } from 'zod';

export const gameSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1),
	createdAt: z.date().nullish(),
	cards: z.string(),
	status: z.enum(['created', 'voting', 'revealed', 'finished']).default('created'),
	playerName: z.string().min(1), // for form input,
	autoReveal: z.boolean().default(false)
});

export type GameType = Partial<z.infer<typeof gameSchema>>;

export const playerSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1).max(15),
	joinedAt: z.date().nullish(),
	gameId: z.string().uuid().optional() // TODO: remove later
});

export type PlayerType = Partial<z.infer<typeof playerSchema>>;

export const voteScema = z.object({
	id: z.string().uuid(),
	sessionId: z.string().uuid(),
	playerId: z.string().uuid(),
	estimate: z.number().int().nullish(),
	emoji: z.string().min(1).nullish(),
	votedAt: z.date()
});

export type VoteType = Partial<z.infer<typeof voteScema>>;

export const playerInGamesSchema = z.object({
	playerId: z.string().uuid(),
	gameId: z.string().uuid(),
	isCreator: z.boolean()
});

export type PlayerInGamesType = Partial<z.infer<typeof playerInGamesSchema>>;

export const sessionSchema = z.object({
	id: z.string().uuid(),
	gameId: z.string().uuid(),
	status: z.enum(['active', 'completed', 'revealed']).default('active'),
	createdAt: z.date(),
	updatedAt: z.date()
});

export type SessionType = Partial<z.infer<typeof sessionSchema>>;

export const reactionSchema = z.object({
	id: z.string().uuid(),
	sessionId: z.string().uuid(),
	playerId: z.string().uuid(),
	targetPlayerId: z.string().uuid(),
	emoji: z.string().min(1),
	createdAt: z.date()
});

export type ReactionType = Partial<z.infer<typeof sessionSchema>>;
