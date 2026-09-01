import { count } from "drizzle-orm";
import { redirect } from "next/navigation";
import Image from "next/image";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { setupAdmin } from "@/lib/actions";

export default async function SetupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [{ value }] = await db.select({ value: count() }).from(admins);
  if (value) redirect("/admin/login");
  const params = await searchParams;
  return <main className="auth-page"><form className="auth-card" action={setupAdmin}><Image src="/assets/logo-senidh.webp" width={96} height={96} alt="SENIDH"/><h1>Configuración inicial</h1><p>Cree la primera cuenta administrativa. Esta pantalla se bloquea automáticamente después.</p>{params.error && <div className="alert error">La clave de configuración no es válida.</div>}<label>Clave SETUP_SECRET<input name="setupSecret" type="password" required/></label><label>Nombre<input name="name" required maxLength={120}/></label><label>Correo<input name="email" type="email" required maxLength={160}/></label><label>Contraseña<input name="password" type="password" minLength={12} maxLength={128} required/><small>Mínimo 12 caracteres.</small></label><button className="button navy" type="submit">Crear administrador</button></form></main>;
}
