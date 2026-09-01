import Image from "next/image";
import Link from "next/link";
import { logoutAdmin } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";

export async function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  const session = await requireAdmin();
  return <div className="admin-shell"><aside className="admin-sidebar"><div className="admin-brand"><Image src="/assets/logo-senidh.webp" width={56} height={56} alt=""/><strong>SENIDH</strong></div><nav><Link href="/admin">Resumen</Link><Link href="/admin/interventores">Interventores</Link><Link href="/admin/contenido">Contenido</Link><Link href="/admin/mensajes">Mensajes</Link><Link href="/admin/ajustes">Configuración</Link>{session.isSuperadmin && <Link href="/admin/administradores">Administradores</Link>}<Link href="/" target="_blank">Ver sitio ↗</Link><form action={logoutAdmin}><button>Cerrar sesión</button></form></nav></aside><main className="admin-main"><header className="admin-top"><div><span>{session.isSuperadmin ? "Panel de superadministración" : "Panel administrativo"}</span><h1>{title}</h1></div><small>{session.name}</small></header>{children}</main></div>;
}
