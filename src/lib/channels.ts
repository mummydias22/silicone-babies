import { db, orderChannels, paymentMethods } from "@/db";
import { eq } from "drizzle-orm";
import type { Settings } from "./settings";

export type Channel = { id: string; label: string; button: string; link?: string };

// Every way the customer can send an order: the built-ins switched on in Settings, plus admin-added ones.
export async function enabledChannels(s: Settings): Promise<Channel[]> {
  const custom = await db.select().from(orderChannels).where(eq(orderChannels.enabled, true)).orderBy(orderChannels.id);
  return [
    s.orderByEmail && { id: "email", label: "Email", button: "Place order & send by email" },
    s.orderByWhatsapp && s.whatsappNumber && { id: "whatsapp", label: "WhatsApp", button: "Place order & continue on WhatsApp" },
    s.orderBySms && s.smsNumber && { id: "sms", label: "Text message", button: "Place order & send by text" },
    ...custom.map((c) => ({ id: `custom:${c.id}`, label: c.name, button: `Place order & continue on ${c.name}`, link: c.link })),
  ].filter(Boolean) as Channel[];
}

export const customUrl = (link: string, text: string) => link.replace("{text}", encodeURIComponent(text));

// Why checkout can't work right now (empty = it works). Shown to the admin.
export async function checkoutProblems(s: Settings) {
  const [methods, channels] = await Promise.all([
    db.select().from(paymentMethods).where(eq(paymentMethods.enabled, true)),
    enabledChannels(s),
  ]);
  const out: { text: string; href: string }[] = [];
  if (!methods.length) out.push({ text: "No payment method is enabled, so customers can't check out.", href: "/admin/payments" });
  if (!channels.length) out.push({ text: "No order channel is enabled, so customers can't check out.", href: "/admin/channels" });
  return out;
}
