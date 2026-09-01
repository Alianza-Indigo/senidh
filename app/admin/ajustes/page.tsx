import { AdminShell } from "@/components/admin-shell";
import { saveSettings } from "@/lib/actions";
import { getSettings } from "@/lib/settings";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [settings, params] = await Promise.all([getSettings(), searchParams]);
  const fields = [["organization_name", "Nombre institucional"], ["email", "Correo público"], ["phone", "Teléfono"], ["whatsapp", "WhatsApp"], ["address", "Domicilio o ciudad"], ["office_hours", "Horario"], ["bank_name", "Banco"], ["bank_holder", "Titular"], ["bank_clabe", "CLABE"], ["bank_account", "Cuenta"]] as const;
  return <AdminShell title="Configuración">{params.saved && <div className="alert success">Configuración actualizada.</div>}<form className="admin-card form-grid" action={saveSettings}>{fields.map(([key, label]) => <label key={key}>{label}<input name={key} defaultValue={settings[key]} maxLength={500}/></label>)}<label className="span-2">Texto de transparencia<textarea name="donation_transparency" defaultValue={settings.donation_transparency} rows={5} maxLength={5000}/></label><div className="span-2"><button className="button navy" type="submit">Guardar configuración</button></div></form></AdminShell>;
}
