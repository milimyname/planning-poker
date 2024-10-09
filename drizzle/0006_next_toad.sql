ALTER TABLE "player_games" RENAME TO "playerGames";--> statement-breakpoint
ALTER TABLE "games" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "playerGames" RENAME COLUMN "player_id" TO "playerId";--> statement-breakpoint
ALTER TABLE "playerGames" RENAME COLUMN "game_id" TO "gameId";--> statement-breakpoint
ALTER TABLE "playerGames" RENAME COLUMN "is_creator" TO "isCreator";--> statement-breakpoint
ALTER TABLE "players" RENAME COLUMN "joined_at" TO "joinedAt";--> statement-breakpoint
ALTER TABLE "votes" RENAME COLUMN "game_id" TO "gameId";--> statement-breakpoint
ALTER TABLE "votes" RENAME COLUMN "player_id" TO "playerId";--> statement-breakpoint
ALTER TABLE "votes" RENAME COLUMN "voted_at" TO "votedAt";--> statement-breakpoint
ALTER TABLE "playerGames" DROP CONSTRAINT "player_games_player_id_players_id_fk";
--> statement-breakpoint
ALTER TABLE "playerGames" DROP CONSTRAINT "player_games_game_id_games_id_fk";
--> statement-breakpoint
ALTER TABLE "votes" DROP CONSTRAINT "votes_game_id_games_id_fk";
--> statement-breakpoint
ALTER TABLE "votes" DROP CONSTRAINT "votes_player_id_players_id_fk";
--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "updatedAt" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "updatedAt" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "votes" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "votes" ADD COLUMN "updatedAt" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "playerGames" ADD CONSTRAINT "playerGames_playerId_players_id_fk" FOREIGN KEY ("playerId") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "playerGames" ADD CONSTRAINT "playerGames_gameId_games_id_fk" FOREIGN KEY ("gameId") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "votes" ADD CONSTRAINT "votes_gameId_games_id_fk" FOREIGN KEY ("gameId") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "votes" ADD CONSTRAINT "votes_playerId_players_id_fk" FOREIGN KEY ("playerId") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
