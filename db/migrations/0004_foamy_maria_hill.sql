CREATE TABLE "disabled_interventores" (
	"id" serial PRIMARY KEY NOT NULL,
	"original_interventor_id" integer NOT NULL,
	"credential_number" varchar(50) NOT NULL,
	"verification_hash" varchar(40) NOT NULL,
	"is_foreign" boolean DEFAULT false NOT NULL,
	"curp" varchar(18),
	"driver_license_number" varchar(80),
	"full_name" varchar(160) NOT NULL,
	"former_role_title" varchar(140) NOT NULL,
	"state_name" varchar(100) NOT NULL,
	"municipality" varchar(120),
	"issued_at" date NOT NULL,
	"expires_at" date NOT NULL,
	"former_status" "credential_status" NOT NULL,
	"photo_url" text,
	"photo_pathname" text,
	"allowed_google_indexing" boolean DEFAULT false NOT NULL,
	"internal_notes" text,
	"disabled_reason" text,
	"disabled_by_admin_id" integer,
	"disabled_by_name" varchar(120) NOT NULL,
	"disabled_by_email" varchar(160) NOT NULL,
	"original_created_at" timestamp with time zone NOT NULL,
	"original_updated_at" timestamp with time zone NOT NULL,
	"disabled_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "disabled_interventores_original_unique" ON "disabled_interventores" USING btree ("original_interventor_id");--> statement-breakpoint
CREATE INDEX "disabled_interventores_name_idx" ON "disabled_interventores" USING btree ("full_name");--> statement-breakpoint
CREATE INDEX "disabled_interventores_credential_idx" ON "disabled_interventores" USING btree ("credential_number");--> statement-breakpoint
CREATE INDEX "disabled_interventores_disabled_at_idx" ON "disabled_interventores" USING btree ("disabled_at");