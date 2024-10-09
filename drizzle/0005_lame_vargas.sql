CREATE TABLE IF NOT EXISTS "player_games" (
	"player_id" uuid NOT NULL,
	"game_id" uuid NOT NULL,
	"is_creator" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "players" DROP CONSTRAINT "players_game_id_games_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "player_games" ADD CONSTRAINT "player_games_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "player_games" ADD CONSTRAINT "player_games_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "games" DROP COLUMN IF EXISTS "creator_id";--> statement-breakpoint
ALTER TABLE "players" DROP COLUMN IF EXISTS "game_id";