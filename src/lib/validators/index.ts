import { z } from 'zod';
import { type Row } from '@electric-sql/client';

export const gameSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1),
	createdAt: z.date(),
	cards: z.string(),
	status: z.enum(['created', 'voting', 'revealed', 'finished']).default('created'),
	playerName: z.string().min(1), // for form input,
	autoReveal: z.boolean().default(false)
});

export type Game = z.infer<typeof gameSchema> & Row;

export const insertGameSchema = gameSchema.omit({ createdAt: true });
export const updateGameSChema = gameSchema.omit({
	createdAt: true,
	playerName: true
});

export type InsertGame = z.infer<typeof insertGameSchema> & Row;

export type UpdateGame = z.infer<typeof updateGameSChema> & Row;

export const playerSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1).max(15),
	joinedAt: z.date(),
	gameId: z.string().uuid().optional() // TODO: remove later
});

export type Player = z.infer<typeof playerSchema> & Row;

export const insertPlayerSchema = playerSchema.omit({ joinedAt: true });

export type InsertPlayer = z.infer<typeof insertPlayerSchema> & Row;

export const voteScema = z.object({
	id: z.string().uuid(),
	sessionId: z.string().uuid(),
	playerId: z.string().uuid(),
	estimate: z.number().int().nullish(),
	emoji: z.string().min(1).nullish(),
	votedAt: z.date()
});

export type Vote = z.infer<typeof voteScema> & Row;

export const insertVoteSchema = voteScema.omit({ votedAt: true });

export type InsertVote = z.infer<typeof insertVoteSchema> & Row;

export const playerGamesSchema = z.object({
	playerId: z.string().uuid(),
	gameId: z.string().uuid(),
	isCreator: z.boolean()
});

export type PlayerGames = z.infer<typeof playerGamesSchema> & Row;

export const insertPlayerGamesSchema = playerGamesSchema.omit({ isCreator: true });

export type InsertPlayerGame = z.infer<typeof insertPlayerGamesSchema> & Row;

export const sessionSchema = z.object({
	id: z.string().uuid(),
	gameId: z.string().uuid(),
	status: z.enum(['active', 'completed', 'revealed']).default('active'),
	createdAt: z.date(),
	updatedAt: z.date()
});

export type Session = z.infer<typeof sessionSchema> & Row;

export const insertSessionSchema = sessionSchema.omit({ createdAt: true, updatedAt: true });

export type InsertSession = z.infer<typeof insertSessionSchema> & Row;
