import { createHash, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { admins, authAttempts, contactMessages, contentItems, interventores, settings } from "@/db/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function secureEqual(value: string, expected: string) {
  return timingSafeEqual(createHash("sha256").update(value).digest(), createHash("sha256").update(expected).digest());
}

function isAuthorized(request: Request, secret: string) {
  const authorization = request.headers.get("authorization");
  const bearer = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
  const headerSecret = request.headers.get("x-webhook-secret") ?? "";
  return secureEqual(bearer, secret) || secureEqual(headerSecret, secret);
}

async function databaseHealth(request: Request) {
  const secret = process.env.DATABASE_HEALTH_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ ok: false, error: "Webhook no configurado" }, { status: 503 });
  if (!isAuthorized(request, secret)) return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });

  const startedAt = Date.now();
  try {
    await Promise.all([
      db.select({ value: admins.id }).from(admins).limit(1),
      db.select({ value: authAttempts.key }).from(authAttempts).limit(1),
      db.select({ value: contactMessages.id }).from(contactMessages).limit(1),
      db.select({ value: contentItems.id }).from(contentItems).limit(1),
      db.select({ value: interventores.id }).from(interventores).limit(1),
      db.select({ value: settings.key }).from(settings).limit(1)
    ]);
    return NextResponse.json({
      ok: true,
      service: "senidh-neon",
      database: "available",
      schema: "complete",
      tablesChecked: 6,
      durationMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Database health webhook failed", error instanceof Error ? error.message : "Unknown database error");
    return NextResponse.json({
      ok: false,
      service: "senidh-neon",
      database: "unavailable",
      durationMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString()
    }, { status: 503 });
  }
}

export async function GET(request: Request) {
  return databaseHealth(request);
}

export async function POST(request: Request) {
  return databaseHealth(request);
}
