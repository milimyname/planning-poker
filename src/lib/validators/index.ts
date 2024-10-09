import { z } from 'zod';
import { type Row } from '@electric-sql/client';

export const gameSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1),
	createdAt: z.date(),
	cards: z.string(),
	status: z.enum(['voting', 'revealed', 'completed']).default('voting'),
	playerName: z.string().min(1) // for form input
});

export type Game = z.infer<typeof gameSchema> & Row;

export const insertGameSchema = gameSchema.omit({ createdAt: true });

export type InsertGame = z.infer<typeof insertGameSchema> & Row;

export const playerSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1),
	joinedAt: z.date()
});

export type Player = z.infer<typeof playerSchema> & Row;

export const insertPlayerSchema = playerSchema.omit({ joinedAt: true });

export type InsertPlayer = z.infer<typeof insertPlayerSchema> & Row;

export const voteScema = z.object({
	id: z.string().uuid(),
	gameId: z.string().uuid(),
	playerId: z.string().uuid(),
	estimate: z.number().int(),
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
