ALTER TABLE "playerGames" RENAME TO "player_games";--> statement-breakpoint
ALTER TABLE "player_games" DROP CONSTRAINT "playerGames_player_id_players_id_fk";
--> statement-breakpoint
ALTER TABLE "player_games" DROP CONSTRAINT "playerGames_game_id_games_id_fk";
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
