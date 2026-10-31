import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, orders, orderItems, paymentMethods } from "@/db";
import { getSettings, money } from "@/lib/settings";
import { whatsappUrl, smsUrl } from "@/lib/notify";

export const metadata = { title: "Order confirmed" };

export default async function Confirmation({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const [o] = await db.select().from(orders).where(eq(orders.number, number));
  if (!o) notFound();
  const [items, [pm], s] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, o.id)),
    db.select().from(paymentMethods).where(eq(paymentMethods.name, o.paymentMethod)),
    getSettings(),
  ]);
  const text = [`Order ${o.number}`, ...items.map((i) => `${i.qty} x ${i.name}${i.options ? ` (${i.options})` : ""}`), `Total: ${money(o.total)}`, `Payment: ${o.paymentMethod}`].join("\n");
  // Customer phone and address are deliberately not shown here.
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Thank you!</h1>
      <p className="mt-2">Your order <strong>{o.number}</strong> was received. We&apos;ll reply with payment details.</p>
      <div className="card mt-6">
        <ul className="space-y-1 text-sm">
          {items.map((i) => (
            <li key={i.id} className="flex justify-between gap-4">
              <span>{i.qty} × {i.name}{i.options && ` (${i.options})`}</span><span>{money(i.unitPrice * i.qty)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-right font-semibold">Total {money(o.total)}</p>
      </div>
      {pm?.instructions && (
        <div className="card mt-4"><p className="font-semibold">{pm.name}</p><p className="mt-1 whitespace-pre-line text-sm">{pm.instructions}</p></div>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        {o.channel === "whatsapp" && s.whatsappNumber && (
          <a className="btn" href={whatsappUrl(s.whatsappNumber, text)} target="_blank" rel="noreferrer">Send on WhatsApp</a>
        )}
        {o.channel === "sms" && s.smsNumber && <a className="btn" href={smsUrl(s.smsNumber, text)}>Send text message</a>}
      </div>
    </div>
  );
}
