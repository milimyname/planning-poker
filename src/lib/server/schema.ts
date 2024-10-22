import { relations } from 'drizzle-orm';
import { pgTable, timestamp, pgEnum, uuid, varchar, integer, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Enums
export const gameStatusEnum = pgEnum('game_status', ['created', 'voting', 'revealed', 'finished']);
export const sessionStatusEnum = pgEnum('session_status', ['active', 'revealed', 'completed']);

// Tables
export const items = pgTable('items', {
	id: uuid('id').defaultRandom().primaryKey()
});

export const games = pgTable('games', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at', {
		withTimezone: true,
		mode: 'string'
	})
		.defaultNow()
		.notNull()
		.$onUpdate(() => sql`now()`),
	cards: varchar('cards', { length: 255 }).notNull(),
	status: gameStatusEnum('status').default('created').notNull(),
	autoReveal: boolean('auto_reveal').default(false).notNull()
});

export const players = pgTable('players', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	joinedAt: timestamp('joined_at').defaultNow().notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at', {
		withTimezone: true,
		mode: 'string'
	})
		.defaultNow()
		.notNull()
		.$onUpdate(() => sql`now()`)
});

export const playerGames = pgTable('player_games', {
	playerId: uuid('player_id')
		.notNull()
		.references(() => players.id, { onDelete: 'cascade' }),
	gameId: uuid('game_id')
		.notNull()
		.references(() => games.id, { onDelete: 'cascade' }),
	isCreator: boolean('is_creator').default(false).notNull()
});

export const sessions = pgTable('sessions', {
	id: uuid('id').defaultRandom().primaryKey(),
	gameId: uuid('game_id')
		.notNull()
		.references(() => games.id, { onDelete: 'cascade' }),
	status: sessionStatusEnum('status').default('active').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at', {
		withTimezone: true,
		mode: 'string'
	})
		.defaultNow()
		.notNull()
		.$onUpdate(() => sql`now()`)
});

export const votes = pgTable('votes', {
	id: uuid('id').defaultRandom().primaryKey(),
	sessionId: uuid('session_id')
		.notNull()
		.references(() => sessions.id, { onDelete: 'cascade' }),
	playerId: uuid('player_id')
		.references(() => players.id, { onDelete: 'cascade' })
		.notNull(),
	estimate: integer('estimate'),
	emoji: varchar('emoji', { length: 255 }),
	votedAt: timestamp('voted_at').defaultNow().notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at', {
		withTimezone: true,
		mode: 'string'
	})
		.defaultNow()
		.notNull()
		.$onUpdate(() => sql`now()`)
});

// Relations
export const gamesRelations = relations(games, ({ one, many }) => ({
	creator: one(players, {
		fields: [games.id],
		references: [players.id]
	}),
	playerGames: many(playerGames),
	sessions: many(sessions)
}));

export const playersRelations = relations(players, ({ many }) => ({
	playerGames: many(playerGames),
	votes: many(votes)
}));

export const playerGamesRelations = relations(playerGames, ({ one }) => ({
	player: one(players, {
		fields: [playerGames.playerId],
		references: [players.id]
	}),
	game: one(games, {
		fields: [playerGames.gameId],
		references: [games.id]
	})
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
	game: one(games, {
		fields: [sessions.gameId],
		references: [games.id]
	}),
	votes: many(votes)
}));

export const votesRelations = relations(votes, ({ one }) => ({
	session: one(sessions, {
		fields: [votes.sessionId],
		references: [sessions.id]
	}),
	player: one(players, {
		fields: [votes.playerId],
		references: [players.id]
	})
}));
