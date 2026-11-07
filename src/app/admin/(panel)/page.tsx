import Link from "next/link";
import { desc } from "drizzle-orm";
import { db, orders, orderChannels } from "@/db";
import { checkoutProblems } from "@/lib/channels";
import { getSettings, money } from "@/lib/settings";

export const metadata = { title: "Orders" };

export default async function AdminOrders() {
  const [list, chans, s] = await Promise.all([db.select().from(orders).orderBy(desc(orders.createdAt)), db.select().from(orderChannels), getSettings()]);
  const problems = await checkoutProblems(s);
  const channelName = (c: string) => (c.startsWith("custom:") ? chans.find((x) => `custom:${x.id}` === c)?.name ?? "other" : c);
  return (
    <>
      <h1 className="text-2xl font-semibold">Orders</h1>
      {problems.length > 0 && (
        <div role="alert" className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm">
          <p className="font-semibold">Customers can&apos;t check out right now</p>
          <ul className="mt-1 list-disc pl-5">
            {problems.map((p) => <li key={p.href}>{p.text} <Link href={p.href} className="underline">Fix it</Link></li>)}
          </ul>
        </div>
      )}
      <div className="mt-4 space-y-2">
        {list.map((o) => (
          <Link key={o.id} href={`/admin/orders/${o.id}`} className="card flex items-center justify-between gap-4 hover:border-brand">
            <div className="min-w-0"><p className="font-medium">{o.number}</p><p className="truncate text-sm text-stone-600">{o.customerName} · {channelName(o.channel)} · {o.createdAt.toLocaleDateString()}</p></div>
            <div className="text-right"><p>{money(o.total, o.currency)}</p><p className="text-xs uppercase text-brand-dark">{o.status}</p></div>
          </Link>
        ))}
        {!list.length && <p className="text-stone-600">No orders yet.</p>}
      </div>
    </>
  );
}
