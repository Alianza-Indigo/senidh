import { BadgeCheck, ShieldAlert, ShieldX } from "lucide-react";
import Image from "next/image";
import type { Interventor } from "@/db/schema";
import { publicStatus } from "@/lib/credentials";

export function PublicProfile({ person, fromQr = false }: { person: Interventor; fromQr?: boolean }) {
  const status = publicStatus(person);
  const Icon = status.tone === "success" ? BadgeCheck : status.tone === "danger" ? ShieldX : ShieldAlert;
  const photoSrc = person.photoPathname ? `/api/media/interventores/${person.id}` : person.photoUrl;
  return <article className="credential-result">
    <header><strong>Directorio oficial SENIDH</strong><span className={`status ${status.tone}`}><Icon/>{status.label}</span></header>
    <div className="profile-body">{photoSrc ? <Image className="profile-photo" src={photoSrc} width={160} height={190} alt={`Fotografía de ${person.fullName}`}/> : <div className="photo-placeholder">{person.fullName[0]}</div>}<dl><div><dt>Nombre</dt><dd>{person.fullName}</dd></div><div><dt>Identificación</dt><dd>{person.credentialNumber}</dd></div><div><dt>Puesto o cargo</dt><dd>{person.roleTitle}</dd></div><div><dt>Representación territorial</dt><dd>{[person.municipality, person.stateName].filter(Boolean).join(", ")}</dd></div><div><dt>Expedición</dt><dd>{formatDate(person.issuedAt)}</dd></div><div><dt>Vigencia</dt><dd>{formatDate(person.expiresAt)}</dd></div></dl></div>
    {fromQr && <footer><strong>Registro localizado mediante el QR de la credencial.</strong><span>La consulta electrónica muestra el estado vigente registrado por SENIDH.</span></footer>}
  </article>;
}

function formatDate(value: string) { return new Intl.DateTimeFormat("es-MX", { timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)); }
