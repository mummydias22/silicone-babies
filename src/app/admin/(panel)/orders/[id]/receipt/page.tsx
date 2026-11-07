import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, orders, orderItems } from "@/db";
import { getSettings, money } from "@/lib/settings";
import PrintButton from "./PrintButton";

export default async function Receipt({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [o] = await db.select().from(orders).where(eq(orders.id, Number(id)));
  if (!o) notFound();
  const [items, s] = await Promise.all([db.select().from(orderItems).where(eq(orderItems.orderId, o.id)), getSettings()]);
  return (
    <div className="mx-auto max-w-xl bg-white p-6 text-sm">
      <h1 className="text-2xl font-semibold">{s.storeName}</h1>
      <p className="text-stone-600">Receipt {o.number} · {o.createdAt.toLocaleDateString()}</p>
      <p className="mt-4"><b>{o.customerName}</b><br />{o.customerEmail} · {o.customerPhone}<br /><span className="whitespace-pre-line">{o.address}</span></p>
      <table className="mt-4 w-full">
        <tbody>
          {items.map((i) => <tr key={i.id} className="border-t"><td className="py-1">{i.qty} × {i.name}{i.options && ` (${i.options})`}</td><td className="py-1 text-right">{money(i.unitPrice * i.qty, o.currency)}</td></tr>)}
          <tr className="border-t font-semibold"><td className="py-1">Total</td><td className="py-1 text-right">{money(o.total, o.currency)}</td></tr>
        </tbody>
      </table>
      <p className="mt-3">Payment method: {o.paymentMethod} · Status: {o.status}</p>
      <div className="no-print mt-6"><PrintButton /></div>
    </div>
  );
}
