ALTER TABLE "games" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;