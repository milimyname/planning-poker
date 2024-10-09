import { relations } from 'drizzle-orm';
import { pgTable, timestamp, pgEnum, uuid, varchar, integer, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const gameEnum = pgEnum('status', ['voting', 'revealed', 'completed']);

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
	status: gameEnum('voting')
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

export const votes = pgTable('votes', {
	id: uuid('id').defaultRandom().primaryKey(),
	gameId: uuid('game_id')
		.references(() => games.id)
		.notNull(),
	playerId: uuid('player_id')
		.references(() => players.id, { onDelete: 'cascade' })
		.notNull(),
	estimate: integer('estimate'),
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

export const gamesRelations = relations(games, ({ one, many }) => ({
	creator: one(players, {
		fields: [games.id],
		references: [players.id]
	}),
	playerGames: many(playerGames)
}));

export const playersRelations = relations(players, ({ many }) => ({
	playerGames: many(playerGames)
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
