"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { PrivateBlobUploadField } from "@/components/private-blob-upload-field";
import type { Interventor } from "@/db/schema";
import { saveInterventor } from "@/lib/actions";

export function InterventorForm({ person }: { person?: Interventor }) {
  const [state, formAction, isPending] = useActionState(saveInterventor, null);
  const [isForeign, setIsForeign] = useState(person?.isForeign ?? false);
  const [curp, setCurp] = useState(person?.curp ?? "");
  const [driverLicenseNumber, setDriverLicenseNumber] = useState(person?.driverLicenseNumber ?? "");
  const today = new Date().toISOString().slice(0, 10);
  const nextYear = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);

  return <form className="admin-card form-grid" action={formAction}>
    <input type="hidden" name="id" value={person?.id ?? ""}/>
    <label>Folio de identificación *<input name="credentialNumber" defaultValue={person?.credentialNumber} placeholder="SENIDH-CHIH-0001" required maxLength={50}/></label>
    <label className="checkbox"><input type="checkbox" name="isForeign" checked={isForeign} onChange={event => setIsForeign(event.target.checked)}/><span>Es extranjero<small>Al seleccionarlo se solicitará la licencia de conducir en lugar de la CURP.</small></span></label>
    <label>{isForeign ? "Número de licencia de conducir" : "CURP"} *<input name={isForeign ? "driverLicenseNumber" : "curp"} value={isForeign ? driverLicenseNumber : curp} onChange={event => isForeign ? setDriverLicenseNumber(event.target.value) : setCurp(event.target.value)} placeholder={isForeign ? "Número de licencia" : "GODE561231HDFRRN09"} required minLength={isForeign ? 3 : 18} maxLength={isForeign ? 80 : 18} autoCapitalize="characters" spellCheck={false} style={{ textTransform: "uppercase" }}/><small>{isForeign ? "Capture el número tal como aparece en la licencia extranjera." : "18 caracteres, sin espacios ni guiones."}</small></label>
    <label>Nombre completo *<input name="fullName" defaultValue={person?.fullName} required maxLength={160}/></label>
    <label>Puesto o cargo *<input name="roleTitle" defaultValue={person?.roleTitle ?? "Delegado(a)"} required maxLength={140}/></label>
    <label>Estado *<input name="stateName" defaultValue={person?.stateName ?? "Chihuahua"} required maxLength={100}/></label>
    <label>Municipio<input name="municipality" defaultValue={person?.municipality ?? ""} maxLength={120}/></label>
    <label>Estado de la credencial<select name="status" defaultValue={person?.status ?? "activa"}><option value="activa">Activa</option><option value="suspendida">Suspendida</option><option value="revocada">Revocada</option></select></label>
    <label>Fecha de expedición *<input type="date" name="issuedAt" defaultValue={person?.issuedAt ?? today} required/></label>
    <label>Fecha de vencimiento *<input type="date" name="expiresAt" defaultValue={person?.expiresAt ?? nextYear} required/></label>
    <PrivateBlobUploadField accept="image/jpeg,image/png,image/webp" fieldName="photoPathname" hasExisting={Boolean(person?.photoPathname || person?.photoUrl)} help="JPG, PNG o WebP; máximo 4 MB. Se almacena en Vercel Blob privado." kind="interventor-photo" label="Fotografía" maxBytes={4 * 1024 * 1024}/>
    <label className="checkbox span-2"><input type="checkbox" name="allowGoogleIndexing" defaultChecked={person?.allowGoogleIndexing ?? false}/><span>Permitir que este miembro aparezca en Google y otros buscadores<small>Si se desactiva, seguirá siendo verificable mediante su QR o folio, pero se retirará del directorio indexable.</small></span></label>
    <label className="span-2">Notas internas<textarea name="internalNotes" defaultValue={person?.internalNotes ?? ""} rows={4} maxLength={5000}/><small>No se muestran públicamente.</small></label>
    {state?.status === "error" && <div className="alert error span-2" role="alert" aria-live="polite">{state.message}</div>}
    <div className="span-2 form-actions"><button className="button navy" type="submit" disabled={isPending}>{isPending ? "Guardando…" : "Guardar delegado"}</button><Link href="/admin/interventores">Cancelar</Link></div>
  </form>;
}
