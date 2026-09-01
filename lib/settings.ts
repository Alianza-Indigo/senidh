import { db } from "@/db";
import { settings } from "@/db/schema";

export const defaults: Record<string, string> = {
  organization_name: "Sede Nacional de Interventores para los Derechos Humanos",
  email: "",
  phone: "",
  whatsapp: "",
  address: "",
  office_hours: "",
  donation_transparency: "La información financiera y los informes aplicables se publicarán conforme a las obligaciones de la organización.",
  bank_name: "Por configurar",
  bank_holder: "Por configurar",
  bank_clabe: "Por configurar",
  bank_account: "Por configurar"
};

export async function getSettings() {
  try {
    const rows = await db.select().from(settings);
    return { ...defaults, ...Object.fromEntries(rows.map(row => [row.key, row.value])) };
  } catch {
    return defaults;
  }
}
