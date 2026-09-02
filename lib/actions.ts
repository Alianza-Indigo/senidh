"use server";

import { createHash, timingSafeEqual } from "crypto";
import { del } from "@vercel/blob";
import { compare, hash } from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { admins, authAttempts, contactMessages, contentItems, interventores, settings } from "@/db/schema";
import { createSession, destroySession, requireAdmin, requireSuperadmin } from "@/lib/auth";
import { assertSameOrigin, requestIpHash, verificationCode } from "@/lib/security";

const emailSchema = z.string().trim().toLowerCase().email().max(160);
const contentTypes = ["reconocimiento", "convenio", "directorio", "evento", "oficio"] as const;
const statuses = ["activa", "suspendida", "revocada"] as const;

function secureEqual(value: string, expected: string) {
  return timingSafeEqual(createHash("sha256").update(value).digest(), createHash("sha256").update(expected).digest());
}

export async function setupAdmin(formData: FormData) {
  await assertSameOrigin();
  const setupSecret = String(formData.get("setupSecret") ?? "");
  if (!process.env.SETUP_SECRET || setupSecret !== process.env.SETUP_SECRET) redirect("/admin/setup?error=secret");
  const existing = await db.select({ id: admins.id }).from(admins).limit(1);
  if (existing.length) redirect("/admin/login?error=already-configured");
  const name = z.string().trim().min(2).max(120).parse(formData.get("name"));
  const email = emailSchema.parse(formData.get("email"));
  const password = z.string().min(12).max(128).parse(formData.get("password"));
  await db.insert(admins).values({ name, email, passwordHash: await hash(password, 12) });
  redirect("/admin/login?setup=ok");
}

export async function loginAdmin(formData: FormData) {
  await assertSameOrigin();
  const email = emailSchema.safeParse(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  if (!email.success) redirect("/admin/login?error=credentials");
  const ipHash = await requestIpHash();
  const attemptKey = createHash("sha256").update(`${email.data}:${ipHash}`).digest("hex");
  const attempt = (await db.select().from(authAttempts).where(eq(authAttempts.key, attemptKey)).limit(1))[0];
  if (attempt?.lockedUntil && attempt.lockedUntil > new Date()) redirect("/admin/login?error=locked");
  const superadminEmail = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase();
  const superadminPassword = process.env.SUPERADMIN_PASSWORD;
  const isSuperadmin = Boolean(superadminEmail && superadminPassword && email.data === superadminEmail && secureEqual(password, superadminPassword));
  if (isSuperadmin) {
    await db.delete(authAttempts).where(eq(authAttempts.key, attemptKey));
    await createSession({ id: 0, name: "Superadministrador", email: email.data, isSuperadmin: true });
    redirect("/admin");
  }
  const admin = (await db.select().from(admins).where(eq(admins.email, email.data)).limit(1))[0];
  if (!admin || !(await compare(password, admin.passwordHash))) {
    const count = (attempt?.attempts ?? 0) + 1;
    await db.insert(authAttempts).values({ key: attemptKey, attempts: count, lockedUntil: count >= 5 ? new Date(Date.now() + 5 * 60_000) : null, updatedAt: new Date() })
      .onConflictDoUpdate({ target: authAttempts.key, set: { attempts: count, lockedUntil: count >= 5 ? new Date(Date.now() + 5 * 60_000) : null, updatedAt: new Date() } });
    redirect("/admin/login?error=credentials");
  }
  await db.delete(authAttempts).where(eq(authAttempts.key, attemptKey));
  await db.update(admins).set({ lastLoginAt: new Date() }).where(eq(admins.id, admin.id));
  await createSession(admin);
  redirect("/admin");
}

export async function logoutAdmin() {
  await destroySession();
  redirect("/admin/login");
}

export async function createAdministrator(formData: FormData) {
  await requireSuperadmin();
  await assertSameOrigin();
  const parsed = z.object({
    name: z.string().trim().min(2).max(120),
    email: emailSchema,
    password: z.string().min(12).max(128),
    passwordConfirmation: z.string().min(12).max(128)
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success || parsed.data.password !== parsed.data.passwordConfirmation) redirect("/admin/administradores?error=invalid");
  const existing = await db.select({ id: admins.id }).from(admins).where(eq(admins.email, parsed.data.email)).limit(1);
  if (existing.length) redirect("/admin/administradores?error=exists");
  await db.insert(admins).values({ name: parsed.data.name, email: parsed.data.email, passwordHash: await hash(parsed.data.password, 12) });
  revalidatePath("/admin/administradores");
  redirect("/admin/administradores?created=1");
}

function uploadedPathname(formData: FormData, field: string, folder: string) {
  const pathname = String(formData.get(field) ?? "").trim();
  if (!pathname) return null;
  if (pathname.length > 500 || !pathname.startsWith(`${folder}/`) || pathname.includes("..")) throw new Error("Ruta de archivo no permitida");
  return pathname;
}

export async function saveInterventor(formData: FormData) {
  await requireAdmin(); await assertSameOrigin();
  const id = Number(formData.get("id") || 0);
  const parsed = z.object({
    credentialNumber: z.string().trim().toUpperCase().min(4).max(50),
    fullName: z.string().trim().min(3).max(160),
    roleTitle: z.string().trim().min(2).max(140),
    stateName: z.string().trim().min(2).max(100),
    municipality: z.string().trim().max(120),
    issuedAt: z.string().date(),
    expiresAt: z.string().date(),
    status: z.enum(statuses),
    internalNotes: z.string().trim().max(5000)
  }).parse(Object.fromEntries(formData));
  const old = id ? (await db.select().from(interventores).where(eq(interventores.id, id)).limit(1))[0] : null;
  const photoPathname = uploadedPathname(formData, "photoPathname", "interventores");
  const values = { ...parsed, municipality: parsed.municipality || null, internalNotes: parsed.internalNotes || null, photoUrl: photoPathname ? null : old?.photoUrl ?? null, photoPathname: photoPathname ?? old?.photoPathname ?? null, updatedAt: new Date() };
  if (old) await db.update(interventores).set(values).where(eq(interventores.id, id));
  else await db.insert(interventores).values({ ...values, verificationHash: verificationCode() });
  if (photoPathname && old?.photoPathname && old.photoPathname !== photoPathname) await del(old.photoPathname).catch(() => undefined);
  revalidatePath("/admin/interventores"); revalidatePath("/directorio"); revalidatePath("/identificaciones");
  redirect("/admin/interventores?saved=1");
}

export async function revokeInterventor(formData: FormData) {
  await requireAdmin(); await assertSameOrigin();
  const id = Number(formData.get("id"));
  await db.update(interventores).set({ status: "revocada", updatedAt: new Date() }).where(eq(interventores.id, id));
  revalidatePath("/admin/interventores"); revalidatePath("/directorio");
}

export async function saveContent(formData: FormData) {
  await requireAdmin(); await assertSameOrigin();
  const id = Number(formData.get("id") || 0);
  const parsed = z.object({
    itemType: z.enum(contentTypes), title: z.string().trim().min(2).max(220), subtitle: z.string().trim().max(180), summary: z.string().trim().max(10000),
    fileUrl: z.string().trim().max(500), eventDate: z.string().trim(), sortOrder: z.coerce.number().int().min(-9999).max(9999)
  }).parse(Object.fromEntries(formData));
  const old = id ? (await db.select().from(contentItems).where(eq(contentItems.id, id)).limit(1))[0] : null;
  const documentPathname = uploadedPathname(formData, "documentPathname", "documentos");
  const values = { ...parsed, subtitle: parsed.subtitle || null, summary: parsed.summary || null, fileUrl: documentPathname ? null : (parsed.fileUrl || old?.fileUrl || null), filePathname: documentPathname ?? old?.filePathname ?? null, eventDate: parsed.eventDate || null, isPublished: formData.get("isPublished") === "on", updatedAt: new Date() };
  if (old) await db.update(contentItems).set(values).where(eq(contentItems.id, id)); else await db.insert(contentItems).values(values);
  if (documentPathname && old?.filePathname && old.filePathname !== documentPathname) await del(old.filePathname).catch(() => undefined);
  revalidatePath(`/${parsed.itemType === "reconocimiento" ? "reconocimientos" : parsed.itemType === "convenio" ? "convenios" : parsed.itemType === "evento" ? "eventos" : parsed.itemType === "oficio" ? "oficios" : "directorio"}`);
  redirect("/admin/contenido?saved=1");
}

export async function deleteContent(formData: FormData) {
  await requireAdmin(); await assertSameOrigin();
  const id = Number(formData.get("id"));
  const old = (await db.select().from(contentItems).where(eq(contentItems.id, id)).limit(1))[0];
  if (old) await db.delete(contentItems).where(eq(contentItems.id, id));
  if (old?.filePathname) await del(old.filePathname).catch(() => undefined);
  revalidatePath("/admin/contenido");
}

export async function saveSettings(formData: FormData) {
  await requireAdmin(); await assertSameOrigin();
  const keys = ["organization_name", "email", "phone", "whatsapp", "address", "office_hours", "donation_transparency", "bank_name", "bank_holder", "bank_clabe", "bank_account"];
  for (const key of keys) {
    const value = String(formData.get(key) ?? "").trim().slice(0, 5000);
    await db.insert(settings).values({ key, value, updatedAt: new Date() }).onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } });
  }
  revalidatePath("/", "layout");
  redirect("/admin/ajustes?saved=1");
}

export async function submitContact(formData: FormData) {
  await assertSameOrigin();
  if (String(formData.get("website") ?? "")) return;
  const parsed = z.object({ name: z.string().trim().min(2).max(120), email: emailSchema, phone: z.string().trim().max(40), subject: z.string().trim().min(2).max(160), message: z.string().trim().min(10).max(5000) }).parse(Object.fromEntries(formData));
  await db.insert(contactMessages).values({ ...parsed, phone: parsed.phone || null, ipHash: await requestIpHash() });
  redirect("/contacto?sent=1");
}

export async function markMessageRead(formData: FormData) {
  await requireAdmin(); await assertSameOrigin();
  await db.update(contactMessages).set({ isRead: true }).where(and(eq(contactMessages.id, Number(formData.get("id"))), eq(contactMessages.isRead, false)));
  revalidatePath("/admin/mensajes");
}
