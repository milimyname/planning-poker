import { pgTable, timestamp, pgEnum, uuid, varchar, integer } from 'drizzle-orm/pg-core';

export const gameEnum = pgEnum('status', ['voting', 'revealed', 'completed']);

export const itemsTable = pgTable('items', {
	id: uuid('id').defaultRandom().primaryKey()
});

export const gamesTable = pgTable('games', {
	id: uuid('id').defaultRandom().primaryKey(),
	created_at: timestamp('created_at').notNull().defaultNow(),
	status: gameEnum('voting')
});

export const playersTable = pgTable('players', {
	id: uuid('id').defaultRandom().primaryKey(),
	gameId: uuid('game_id')
		.references(() => gamesTable.id)
		.notNull(),
	name: varchar('name', { length: 255 }).notNull(),
	joinedAt: timestamp('joined_at').defaultNow().notNull()
});

export const votesTable = pgTable('votes', {
	id: uuid('id').defaultRandom().primaryKey(),
	gameId: uuid('game_id')
		.references(() => gamesTable.id)
		.notNull(),
	playerId: uuid('player_id')
		.references(() => playersTable.id)
		.notNull(),
	estimate: integer('estimate'),
	votedAt: timestamp('voted_at').defaultNow().notNull()
});
