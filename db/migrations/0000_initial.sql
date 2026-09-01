CREATE TYPE "credential_status" AS ENUM ('activa', 'suspendida', 'revocada');
CREATE TYPE "content_type" AS ENUM ('reconocimiento', 'convenio', 'directorio', 'evento', 'oficio');

CREATE TABLE "admins" (
  "id" serial PRIMARY KEY,
  "name" varchar(120) NOT NULL,
  "email" varchar(160) NOT NULL,
  "password_hash" text NOT NULL,
  "last_login_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "admins_email_unique" ON "admins" ("email");

CREATE TABLE "interventores" (
  "id" serial PRIMARY KEY,
  "credential_number" varchar(50) NOT NULL,
  "verification_hash" varchar(40) NOT NULL,
  "full_name" varchar(160) NOT NULL,
  "role_title" varchar(140) NOT NULL,
  "state_name" varchar(100) NOT NULL,
  "municipality" varchar(120),
  "issued_at" date NOT NULL,
  "expires_at" date NOT NULL,
  "status" "credential_status" NOT NULL DEFAULT 'activa',
  "photo_url" text,
  "photo_pathname" text,
  "internal_notes" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "interventores_credential_unique" ON "interventores" ("credential_number");
CREATE UNIQUE INDEX "interventores_hash_unique" ON "interventores" ("verification_hash");
CREATE INDEX "interventores_name_idx" ON "interventores" ("full_name");
CREATE INDEX "interventores_status_idx" ON "interventores" ("status");

CREATE TABLE "content_items" (
  "id" serial PRIMARY KEY,
  "item_type" "content_type" NOT NULL,
  "title" varchar(220) NOT NULL,
  "subtitle" varchar(180),
  "summary" text,
  "file_url" text,
  "file_pathname" text,
  "event_date" date,
  "is_published" boolean NOT NULL DEFAULT true,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "content_public_idx" ON "content_items" ("item_type", "is_published", "event_date");

CREATE TABLE "settings" (
  "key" varchar(100) PRIMARY KEY,
  "value" text NOT NULL DEFAULT '',
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "contact_messages" (
  "id" serial PRIMARY KEY,
  "name" varchar(120) NOT NULL,
  "email" varchar(160) NOT NULL,
  "phone" varchar(40),
  "subject" varchar(160) NOT NULL,
  "message" text NOT NULL,
  "ip_hash" varchar(64),
  "is_read" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "messages_read_idx" ON "contact_messages" ("is_read", "created_at");

CREATE TABLE "auth_attempts" (
  "key" varchar(64) PRIMARY KEY,
  "attempts" integer NOT NULL DEFAULT 0,
  "locked_until" timestamptz,
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

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
