"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { readCart, writeCart, useCart } from "@/lib/cart-client";
import { getCart, placeOrder } from "../actions";
import type { Line } from "@/lib/shop";
import { money } from "@/lib/money";

type Method = { id: number; name: string; image: string | null; instructions: string };
type Channel = { id: "email" | "whatsapp" | "sms"; label: string; button: string };

export default function CheckoutForm({ methods, channels }: { methods: Method[]; channels: Channel[] }) {
  const router = useRouter();
  const items = useCart();
  const [lines, setLines] = useState<Line[] | null>(null);
  const [method, setMethod] = useState<number>(methods[0].id);
  const [channel, setChannel] = useState<Channel["id"]>(channels[0].id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (items?.length) getCart(items).then(setLines);
  }, [items]);

  if (items === null || (items.length > 0 && lines === null)) return <p className="mt-4">Loading…</p>;
  if (!items.length || !lines) return <div className="mt-4"><p>Your cart is empty.</p><Link href="/shop" className="btn mt-3">Go to shop</Link></div>;

  const bad = lines.some((l) => l.error) || !lines.length;
  const total = lines.reduce((t, l) => t + l.unitPrice * l.qty, 0);
  const chosen = methods.find((m) => m.id === method)!;
  const ch = channels.find((c) => c.id === channel)!;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true); setError("");
    // Open the tab synchronously in the click handler so popup blockers allow it.
    const tab = channel === "whatsapp" ? window.open("", "_blank") : null;
    const r = await placeOrder({
      items: readCart(), name: String(f.get("name")), email: String(f.get("email")), phone: String(f.get("phone")),
      address: String(f.get("address")), notes: String(f.get("notes") || ""), paymentMethodId: method, channel,
    });
    if (!r.ok) { tab?.close(); setError(r.error); setBusy(false); return; }
    writeCart([]);
    if (channel === "whatsapp" && r.handoff && tab) tab.location.href = r.handoff;
    router.push(`/order/${r.number}`);
    if (channel === "sms" && r.handoff) {
      // open the messaging app after the router navigation so a protocol-handler abort can't cancel it
      const a = document.createElement("a");
      a.href = r.handoff;
      setTimeout(() => a.click(), 400);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-6">
      <section className="card">
        <h2 className="font-semibold">Your order</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {lines.map((l, i) => (
            <li key={i} className="flex justify-between gap-4">
              <span>{l.qty} × {l.name}{l.optionsText && ` (${l.optionsText})`}{l.error && <span className="text-red-600"> — {l.error}</span>}</span>
              <span>{money(l.unitPrice * l.qty)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-right font-semibold">Total {money(total)}</p>
        {bad && (
          <div className="mt-2 text-sm text-red-600">
            Some items can&apos;t be ordered. <Link href="/cart" className="underline">Edit your cart</Link> or{" "}
            <button type="button" className="underline" onClick={() => confirm("Clear your cart?") && writeCart([])}>clear it</button>.
          </div>
        )}
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Your details</h2>
        <div><label className="label" htmlFor="name">Full name</label><input id="name" name="name" required className="input" autoComplete="name" /></div>
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required className="input" autoComplete="email" /></div>
        <div><label className="label" htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" required className="input" autoComplete="tel" /></div>
        <div><label className="label" htmlFor="address">Delivery address</label><textarea id="address" name="address" required rows={3} className="input" autoComplete="street-address" /></div>
        <div><label className="label" htmlFor="notes">Notes (optional)</label><textarea id="notes" name="notes" rows={2} className="input" /></div>
      </section>

      <fieldset className="card">
        <legend className="px-1 font-semibold">Payment method</legend>
        <div className="mt-2 space-y-2">
          {methods.map((m) => (
            <label key={m.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${method === m.id ? "border-brand bg-soft" : "border-stone-200"}`}>
              <input type="radio" name="method" className="accent-brand" checked={method === m.id} onChange={() => setMethod(m.id)} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {m.image && <img src={m.image} alt="" className="h-8 w-12 rounded object-contain" />}
              <span>{m.name}</span>
            </label>
          ))}
        </div>
        {chosen.instructions && <p className="mt-3 whitespace-pre-line rounded-lg bg-soft p-3 text-sm">{chosen.instructions}</p>}
      </fieldset>

      <fieldset className="card">
        <legend className="px-1 font-semibold">Send my order by</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {channels.map((c) => (
            <label key={c.id} className={`cursor-pointer rounded-xl border p-3 text-center text-sm ${channel === c.id ? "border-brand bg-soft font-medium" : "border-stone-200"}`}>
              <input type="radio" name="channel" className="sr-only" checked={channel === c.id} onChange={() => setChannel(c.id)} />
              {c.label}
            </label>
          ))}
        </div>
      </fieldset>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={busy || bad} className="btn w-full">{busy ? "Placing order…" : ch.button}</button>
    </form>
  );
}
