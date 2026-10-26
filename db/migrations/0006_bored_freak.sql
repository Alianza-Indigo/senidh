CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
CREATE INDEX "interventores_name_search_idx" ON "interventores" USING gin ("full_name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "interventores_number_search_idx" ON "interventores" USING gin ("credential_number" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "interventores_municipality_search_idx" ON "interventores" USING gin ("municipality" gin_trgm_ops);
