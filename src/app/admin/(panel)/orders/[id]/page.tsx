import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, orders, orderItems } from "@/db";
import { money } from "@/lib/settings";
import { setOrderStatus } from "../../../actions";

const STATUSES = ["new", "confirmed", "paid", "shipped", "completed", "cancelled"];

export default async function AdminOrder({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [o] = await db.select().from(orders).where(eq(orders.id, Number(id)));
  if (!o) notFound();
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, o.id));
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">{o.number}</h1>
      <div className="card mt-4 space-y-1 text-sm">
        <p><b>{o.customerName}</b> · {o.customerEmail} · {o.customerPhone}</p>
        <p className="whitespace-pre-line">{o.address}</p>
        {o.notes && <p>Notes: {o.notes}</p>}
        <p>Payment: {o.paymentMethod} · Sent by: {o.channel}</p>
      </div>
      <div className="card mt-4 text-sm">
        {items.map((i) => <p key={i.id} className="flex justify-between"><span>{i.qty} × {i.name}{i.options && ` (${i.options})`}</span><span>{money(i.unitPrice * i.qty, o.currency)}</span></p>)}
        <p className="mt-2 text-right font-semibold">Total {money(o.total, o.currency)}</p>
      </div>
      <form action={setOrderStatus} className="mt-4 flex gap-2">
        <input type="hidden" name="id" value={o.id} />
        <label className="sr-only" htmlFor="status">Status</label>
        <select id="status" name="status" defaultValue={o.status} className="input max-w-48">
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button type="submit" className="btn">Update status</button>
        <Link href={`/admin/orders/${o.id}/receipt`} className="btn-outline" target="_blank">Receipt</Link>
      </form>
    </div>
  );
}
