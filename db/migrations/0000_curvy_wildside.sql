CREATE TYPE "public"."content_type" AS ENUM('reconocimiento', 'convenio', 'directorio', 'evento', 'oficio');--> statement-breakpoint
CREATE TYPE "public"."credential_status" AS ENUM('activa', 'suspendida', 'revocada');--> statement-breakpoint
CREATE TABLE "admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(160) NOT NULL,
	"password_hash" text NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_attempts" (
	"key" varchar(64) PRIMARY KEY NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(160) NOT NULL,
	"phone" varchar(40),
	"subject" varchar(160) NOT NULL,
	"message" text NOT NULL,
	"ip_hash" varchar(64),
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_type" "content_type" NOT NULL,
	"title" varchar(220) NOT NULL,
	"subtitle" varchar(180),
	"summary" text,
	"file_url" text,
	"file_pathname" text,
	"event_date" date,
	"is_published" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interventores" (
	"id" serial PRIMARY KEY NOT NULL,
	"credential_number" varchar(50) NOT NULL,
	"verification_hash" varchar(40) NOT NULL,
	"full_name" varchar(160) NOT NULL,
	"role_title" varchar(140) NOT NULL,
	"state_name" varchar(100) NOT NULL,
	"municipality" varchar(120),
	"issued_at" date NOT NULL,
	"expires_at" date NOT NULL,
	"status" "credential_status" DEFAULT 'activa' NOT NULL,
	"photo_url" text,
	"photo_pathname" text,
	"internal_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" varchar(100) PRIMARY KEY NOT NULL,
	"value" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "admins_email_unique" ON "admins" USING btree ("email");--> statement-breakpoint
CREATE INDEX "messages_read_idx" ON "contact_messages" USING btree ("is_read","created_at");--> statement-breakpoint
CREATE INDEX "content_public_idx" ON "content_items" USING btree ("item_type","is_published","event_date");--> statement-breakpoint
CREATE UNIQUE INDEX "interventores_credential_unique" ON "interventores" USING btree ("credential_number");--> statement-breakpoint
CREATE UNIQUE INDEX "interventores_hash_unique" ON "interventores" USING btree ("verification_hash");--> statement-breakpoint
CREATE INDEX "interventores_name_idx" ON "interventores" USING btree ("full_name");--> statement-breakpoint
CREATE INDEX "interventores_status_idx" ON "interventores" USING btree ("status");--> statement-breakpoint
INSERT INTO "settings" ("key", "value") VALUES
	('organization_name', 'Sede Nacional de Interventores para los Derechos Humanos'),
	('email', ''),
	('phone', ''),
	('whatsapp', ''),
	('address', ''),
	('office_hours', ''),
	('donation_transparency', 'La información financiera y los informes aplicables se publicarán conforme a las obligaciones de la organización.'),
	('bank_name', 'Por configurar'),
	('bank_holder', 'Por configurar'),
	('bank_clabe', 'Por configurar'),
	('bank_account', 'Por configurar')
ON CONFLICT ("key") DO NOTHING;
