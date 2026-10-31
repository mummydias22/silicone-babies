import Link from "next/link";
import { desc } from "drizzle-orm";
import { db, orders } from "@/db";
import { money } from "@/lib/settings";

export const metadata = { title: "Orders" };

export default async function AdminOrders() {
  const list = await db.select().from(orders).orderBy(desc(orders.createdAt));
  return (
    <>
      <h1 className="text-2xl font-semibold">Orders</h1>
      <div className="mt-4 space-y-2">
        {list.map((o) => (
          <Link key={o.id} href={`/admin/orders/${o.id}`} className="card flex items-center justify-between gap-4 hover:border-brand">
            <div className="min-w-0"><p className="font-medium">{o.number}</p><p className="truncate text-sm text-stone-600">{o.customerName} · {o.channel} · {o.createdAt.toLocaleDateString()}</p></div>
            <div className="text-right"><p>{money(o.total)}</p><p className="text-xs uppercase text-brand-dark">{o.status}</p></div>
          </Link>
        ))}
        {!list.length && <p className="text-stone-600">No orders yet.</p>}
      </div>
    </>
  );
}
