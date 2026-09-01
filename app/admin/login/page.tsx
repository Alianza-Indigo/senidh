import { redirect } from "next/navigation";
import Image from "next/image";
import { loginAdmin } from "@/lib/actions";
import { getSession } from "@/lib/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; setup?: string }> }) {
  if (await getSession()) redirect("/admin");
  const params = await searchParams;
  const message = params.error === "locked" ? "Demasiados intentos. Espere cinco minutos." : params.error ? "Correo o contraseña incorrectos." : "";
  return <main className="auth-page"><form className="auth-card" action={loginAdmin}><Image src="/assets/logo-senidh.webp" width={96} height={96} alt="SENIDH"/><h1>Panel SENIDH</h1><p>Acceso para personal autorizado</p>{params.setup && <div className="alert success">Administrador creado. Ya puede iniciar sesión.</div>}{message && <div className="alert error">{message}</div>}<label>Correo<input name="email" type="email" autoComplete="username" required/></label><label>Contraseña<input name="password" type="password" autoComplete="current-password" required/></label><button className="button navy" type="submit">Ingresar</button></form></main>;
}
