ALTER TABLE "games" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "playerGames" RENAME COLUMN "playerId" TO "player_id";--> statement-breakpoint
ALTER TABLE "playerGames" RENAME COLUMN "gameId" TO "game_id";--> statement-breakpoint
ALTER TABLE "playerGames" RENAME COLUMN "isCreator" TO "is_creator";--> statement-breakpoint
ALTER TABLE "players" RENAME COLUMN "joinedAt" TO "joined_at";--> statement-breakpoint
ALTER TABLE "players" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "players" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "votes" RENAME COLUMN "gameId" TO "game_id";--> statement-breakpoint
ALTER TABLE "votes" RENAME COLUMN "playerId" TO "player_id";--> statement-breakpoint
ALTER TABLE "votes" RENAME COLUMN "votedAt" TO "voted_at";--> statement-breakpoint
ALTER TABLE "votes" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "votes" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "playerGames" DROP CONSTRAINT "playerGames_playerId_players_id_fk";
--> statement-breakpoint
ALTER TABLE "playerGames" DROP CONSTRAINT "playerGames_gameId_games_id_fk";
--> statement-breakpoint
ALTER TABLE "votes" DROP CONSTRAINT "votes_gameId_games_id_fk";
--> statement-breakpoint
ALTER TABLE "votes" DROP CONSTRAINT "votes_playerId_players_id_fk";
--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "playerGames" ADD CONSTRAINT "playerGames_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "playerGames" ADD CONSTRAINT "playerGames_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "votes" ADD CONSTRAINT "votes_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "votes" ADD CONSTRAINT "votes_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "games" DROP COLUMN IF EXISTS "updatedAt";