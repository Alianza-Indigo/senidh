import { boolean, date, index, integer, pgEnum, pgTable, serial, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

export const credentialStatus = pgEnum("credential_status", ["activa", "suspendida", "revocada"]);
export const contentType = pgEnum("content_type", ["reconocimiento", "convenio", "directorio", "evento", "oficio"]);

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 160 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, table => [uniqueIndex("admins_email_unique").on(table.email)]);

export const interventores = pgTable("interventores", {
  id: serial("id").primaryKey(),
  credentialNumber: varchar("credential_number", { length: 50 }).notNull(),
  verificationHash: varchar("verification_hash", { length: 40 }).notNull(),
  isForeign: boolean("is_foreign").default(false).notNull(),
  curp: varchar("curp", { length: 18 }),
  driverLicenseNumber: varchar("driver_license_number", { length: 80 }),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  roleTitle: varchar("role_title", { length: 140 }).notNull(),
  stateName: varchar("state_name", { length: 100 }).notNull(),
  municipality: varchar("municipality", { length: 120 }),
  issuedAt: date("issued_at").notNull(),
  expiresAt: date("expires_at").notNull(),
  status: credentialStatus("status").default("activa").notNull(),
  photoUrl: text("photo_url"),
  photoPathname: text("photo_pathname"),
  allowGoogleIndexing: boolean("allow_google_indexing").default(false).notNull(),
  internalNotes: text("internal_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
}, table => [
  uniqueIndex("interventores_credential_unique").on(table.credentialNumber),
  uniqueIndex("interventores_hash_unique").on(table.verificationHash),
  uniqueIndex("interventores_curp_unique").on(table.curp),
  index("interventores_name_idx").on(table.fullName),
  index("interventores_name_search_idx").using("gin", table.fullName.op("gin_trgm_ops")),
  index("interventores_number_search_idx").using("gin", table.credentialNumber.op("gin_trgm_ops")),
  index("interventores_municipality_search_idx").using("gin", table.municipality.op("gin_trgm_ops")),
  index("interventores_state_idx").on(table.stateName),
  index("interventores_public_directory_idx").on(table.allowGoogleIndexing, table.stateName, table.fullName),
  index("interventores_status_idx").on(table.status)
]);

export const disabledInterventores = pgTable("disabled_interventores", {
  id: serial("id").primaryKey(),
  originalInterventorId: integer("original_interventor_id").notNull(),
  credentialNumber: varchar("credential_number", { length: 50 }).notNull(),
  verificationHash: varchar("verification_hash", { length: 40 }).notNull(),
  isForeign: boolean("is_foreign").default(false).notNull(),
  curp: varchar("curp", { length: 18 }),
  driverLicenseNumber: varchar("driver_license_number", { length: 80 }),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  formerRoleTitle: varchar("former_role_title", { length: 140 }).notNull(),
  stateName: varchar("state_name", { length: 100 }).notNull(),
  municipality: varchar("municipality", { length: 120 }),
  issuedAt: date("issued_at").notNull(),
  expiresAt: date("expires_at").notNull(),
  formerStatus: credentialStatus("former_status").notNull(),
  photoUrl: text("photo_url"),
  photoPathname: text("photo_pathname"),
  allowedGoogleIndexing: boolean("allowed_google_indexing").default(false).notNull(),
  internalNotes: text("internal_notes"),
  disabledReason: text("disabled_reason"),
  disabledByAdminId: integer("disabled_by_admin_id"),
  disabledByName: varchar("disabled_by_name", { length: 120 }).notNull(),
  disabledByEmail: varchar("disabled_by_email", { length: 160 }).notNull(),
  originalCreatedAt: timestamp("original_created_at", { withTimezone: true }).notNull(),
  originalUpdatedAt: timestamp("original_updated_at", { withTimezone: true }).notNull(),
  disabledAt: timestamp("disabled_at", { withTimezone: true }).defaultNow().notNull()
}, table => [
  uniqueIndex("disabled_interventores_original_unique").on(table.originalInterventorId),
  index("disabled_interventores_name_idx").on(table.fullName),
  index("disabled_interventores_credential_idx").on(table.credentialNumber),
  index("disabled_interventores_disabled_at_idx").on(table.disabledAt)
]);

export const contentItems = pgTable("content_items", {
  id: serial("id").primaryKey(),
  itemType: contentType("item_type").notNull(),
  title: varchar("title", { length: 220 }).notNull(),
  subtitle: varchar("subtitle", { length: 180 }),
  summary: text("summary"),
  fileUrl: text("file_url"),
  filePathname: text("file_pathname"),
  eventDate: date("event_date"),
  isPublished: boolean("is_published").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
}, table => [index("content_public_idx").on(table.itemType, table.isPublished, table.eventDate)]);

export const settings = pgTable("settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  subject: varchar("subject", { length: 160 }).notNull(),
  message: text("message").notNull(),
  ipHash: varchar("ip_hash", { length: 64 }),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, table => [index("messages_read_idx").on(table.isRead, table.createdAt)]);

export const authAttempts = pgTable("auth_attempts", {
  key: varchar("key", { length: 64 }).primaryKey(),
  attempts: integer("attempts").default(0).notNull(),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export type Interventor = typeof interventores.$inferSelect;
export type DisabledInterventor = typeof disabledInterventores.$inferSelect;
export type ContentItem = typeof contentItems.$inferSelect;
