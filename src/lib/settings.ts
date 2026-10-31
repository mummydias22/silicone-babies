import { db, settings } from "@/db";
import { sql } from "drizzle-orm";

// Adding a setting = adding one key here.
export const DEFAULTS = {
  storeName: "Silicone Babies",
  tagline: "Lifelike silicone babies, made with love",
  banner: "",
  phone: "",
  email: "",
  address: "",
  mapEnabled: false,
  whatsappNumber: "",
  whatsappFloat: false,
  orderByWhatsapp: false,
  smsNumber: "",
  orderBySms: false,
  liveChat: "",
  liveChatEnabled: false,
  discordWebhook: "",
  smtpHost: "",
  smtpPort: "587",
  smtpUser: "",
  smtpPass: "",
  smtpFrom: "",
  notifyEmails: "",
  orderByEmail: true,
};
export type Settings = typeof DEFAULTS;

export async function getSettings(): Promise<Settings> {
  const rows = await db.select().from(settings);
  const out: Record<string, unknown> = { ...DEFAULTS };
  for (const r of rows) if (r.key in DEFAULTS) out[r.key] = (r.value as { v: unknown }).v;
  return out as Settings;
}

// One batched upsert for the whole form.
export async function saveSettings(values: Partial<Settings>) {
  const rows = Object.entries(values).map(([key, v]) => ({ key, value: { v } }));
  if (!rows.length) return;
  await db
    .insert(settings)
    .values(rows)
    .onConflictDoUpdate({ target: settings.key, set: { value: sql`excluded.value` } });
}

export { money } from "./money";
