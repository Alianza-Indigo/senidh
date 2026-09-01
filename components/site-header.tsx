"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const nav = [
  ["/", "Inicio"], ["/donaciones", "Donaciones"], ["/reconocimientos", "Reconocimientos"], ["/convenios", "Convenios"],
  ["/directorio", "Directorio"], ["/eventos", "Eventos"], ["/oficios", "Oficios"], ["/donar", "Donar"],
  ["/identificaciones", "Identificaciones"], ["/contacto", "Contacto"]
];

export function SiteHeader({ organizationName }: { organizationName: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return <header className="site-header">
    <div className="utility"><div className="container"><span>Derechos · Justicia · Dignidad</span><Link href="/identificaciones">Verificar una credencial</Link></div></div>
    <div className="container nav-shell">
      <Link className="brand" href="/" onClick={() => setOpen(false)}><Image src="/assets/logo-senidh.webp" width={72} height={72} alt="Escudo SENIDH" priority/><span><strong>SENIDH</strong><small>{organizationName}</small></span></Link>
      <button className="menu-toggle" aria-label="Abrir menú" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}<b>Menú</b></button>
      <nav className={`main-nav ${open ? "open" : ""}`} aria-label="Navegación principal">{nav.map(([href, label]) => <Link key={href} className={pathname === href ? "active" : ""} href={href} onClick={() => setOpen(false)}>{label}</Link>)}</nav>
    </div>
  </header>;
}
