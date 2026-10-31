"use server";
import { db, orders, orderItems, products, variants, paymentMethods } from "@/db";
import { and, eq, sql } from "drizzle-orm";
import { randomBytes } from "crypto";
import { getSettings, money } from "@/lib/settings";
import { priceCart, type CartItem } from "@/lib/shop";
import { discord, sendMail, whatsappUrl, smsUrl } from "@/lib/notify";

export async function getCart(items: CartItem[]) {
  return priceCart(items);
}

export type CheckoutInput = {
  items: CartItem[]; name: string; email: string; phone: string; address: string; notes: string;
  paymentMethodId: number; channel: "email" | "whatsapp" | "sms";
};

function orderText(num: string, name: string, lines: { name: string; optionsText: string; qty: number; unitPrice: number }[], total: number, method: string) {
  return [
    `New order ${num}`, `Customer: ${name}`, "",
    ...lines.map((l) => `${l.qty} x ${l.name}${l.optionsText ? ` (${l.optionsText})` : ""} - ${money(l.unitPrice * l.qty)}`),
    "", `Total: ${money(total)}`, `Payment: ${method}`,
  ].join("\n");
}

export async function placeOrder(input: CheckoutInput): Promise<{ ok: true; number: string; handoff?: string } | { ok: false; error: string }> {
  const s = await getSettings();
  const enabled = { email: s.orderByEmail, whatsapp: s.orderByWhatsapp && !!s.whatsappNumber, sms: s.orderBySms && !!s.smsNumber };
  if (!enabled[input.channel]) return { ok: false, error: "That ordering channel isn't available." };
  const name = input.name.trim(), email = input.email.trim(), phone = input.phone.trim(), address = input.address.trim();
  if (!name || !phone || !address || !/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "Please fill in your name, email, phone and address." };

  const [pm] = await db.select().from(paymentMethods).where(and(eq(paymentMethods.id, input.paymentMethodId), eq(paymentMethods.enabled, true)));
  if (!pm) return { ok: false, error: "Choose a payment method." };

  const lines = await priceCart(input.items);
  if (!lines.length) return { ok: false, error: "Your cart is empty." };
  const bad = lines.find((l) => l.error);
  if (bad) return { ok: false, error: `${bad.name}: ${bad.error}` };
  const total = lines.reduce((t, l) => t + l.unitPrice * l.qty, 0);
  const number = `ORD-${randomBytes(4).toString("hex").toUpperCase()}`;

  // ponytail: neon-http has no transactions; sequential writes, a crash mid-way can leave a partial order.
  const [o] = await db.insert(orders).values({
    number, customerName: name, customerEmail: email, customerPhone: phone, address, notes: input.notes.trim(),
    paymentMethod: pm.name, channel: input.channel, total,
  }).returning();
  await db.insert(orderItems).values(lines.map((l) => ({
    orderId: o.id, productId: l.productId, name: l.name, options: l.optionsText, unitPrice: l.unitPrice, qty: l.qty,
  })));
  for (const l of lines) {
    await db.update(products).set({ stock: sql`${products.stock} - ${l.qty}` }).where(eq(products.id, l.productId));
    for (const [option, value] of Object.entries(l.options))
      await db.update(variants).set({ stock: sql`${variants.stock} - ${l.qty}` })
        .where(and(eq(variants.productId, l.productId), eq(variants.option, option), eq(variants.value, value)));
  }

  const text = orderText(number, name, lines, total, pm.name);
  const full = `${text}\nPhone: ${phone}\nEmail: ${email}\nAddress: ${address}${input.notes ? `\nNotes: ${input.notes}` : ""}`;
  await discord(s, full);
  for (const to of s.notifyEmails.split(/[,\s]+/).filter(Boolean)) await sendMail(s, to, `New order ${number}`, full);
  if (input.channel === "email") await sendMail(s, email, `Your order ${number}`, `${text}\n\n${pm.instructions}\n\nWe'll be in touch with payment details.`);

  const handoff = input.channel === "whatsapp" ? whatsappUrl(s.whatsappNumber, text)
    : input.channel === "sms" ? smsUrl(s.smsNumber, text) : undefined;
  return { ok: true, number, handoff };
}
