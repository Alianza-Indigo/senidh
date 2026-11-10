ALTER TABLE "disabled_interventores" ADD COLUMN "voter_id_front_pathname" text;--> statement-breakpoint
ALTER TABLE "disabled_interventores" ADD COLUMN "voter_id_back_pathname" text;--> statement-breakpoint
ALTER TABLE "interventores" ADD COLUMN "voter_id_front_pathname" text;--> statement-breakpoint
ALTER TABLE "interventores" ADD COLUMN "voter_id_back_pathname" text;