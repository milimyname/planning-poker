import { pgTable, timestamp, pgEnum, uuid, varchar, integer } from 'drizzle-orm/pg-core';

export const gameEnum = pgEnum('status', ['voting', 'revealed', 'completed']);

export const items = pgTable('items', {
	id: uuid('id').defaultRandom().primaryKey()
});

export const games = pgTable('games', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	created_at: timestamp('created_at').notNull().defaultNow(),
	cards: varchar('cards', { length: 255 }).notNull(),
	status: gameEnum('voting')
});

export const players = pgTable('players', {
	id: uuid('id').defaultRandom().primaryKey(),
	gameId: uuid('game_id')
		.references(() => games.id, { onDelete: 'cascade' })
		.notNull(),
	name: varchar('name', { length: 255 }).notNull(),
	joinedAt: timestamp('joined_at').defaultNow().notNull()
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
	votedAt: timestamp('voted_at').defaultNow().notNull()
});
