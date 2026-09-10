ALTER TABLE "interventores" ADD COLUMN "curp" varchar(18);--> statement-breakpoint
CREATE UNIQUE INDEX "interventores_curp_unique" ON "interventores" USING btree ("curp");