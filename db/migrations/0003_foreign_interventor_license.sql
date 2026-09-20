ALTER TABLE "interventores" ADD COLUMN "is_foreign" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "interventores" ADD COLUMN "driver_license_number" varchar(80);
