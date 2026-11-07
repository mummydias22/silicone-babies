"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { readCart, writeCart, useCart } from "@/lib/cart-client";
import { getCart, placeOrder } from "../actions";
import type { Line } from "@/lib/shop";
import { useMoney } from "@/components/Currency";

type Method = { id: number; name: string; image: string | null; instructions: string };
type Channel = { id: string; label: string; button: string };


// Input with a validation tick that pops in once the value is valid.
function Field({ id, label, type = "text", area = false, rows = 3, required = true, auto }: { id: string; label: string; type?: string; area?: boolean; rows?: number; required?: boolean; auto?: string }) {
  const [ok, setOk] = useState(false);
  const on = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setOk(e.currentTarget.value.trim() !== "" && e.currentTarget.checkValidity());
  return (
    <div className="relative">
      <label className="label" htmlFor={id}>{label}</label>
      {area
        ? <textarea id={id} name={id} required={required} rows={rows} className="input pr-10" autoComplete={auto} onChange={on} />
        : <input id={id} name={id} type={type} required={required} className="input pr-10" autoComplete={auto} onChange={on} />}
      {ok && (
        <svg aria-hidden width="20" height="20" viewBox="0 0 20 20" className="pop absolute right-3 top-[2.45rem] text-green-600">
          <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

export default function CheckoutForm({ methods, channels }: { methods: Method[]; channels: Channel[] }) {
  const money = useMoney();
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
    const tab = channel === "whatsapp" || channel.startsWith("custom:") ? window.open("", "_blank") : null;
    const r = await placeOrder({
      items: readCart(), name: String(f.get("name")), email: String(f.get("email")), phone: String(f.get("phone")),
      address: String(f.get("address")), notes: String(f.get("notes") || ""), paymentMethodId: method, channel,
    });
    if (!r.ok) { tab?.close(); setError(r.error); setBusy(false); return; }
    writeCart([]);
    if (tab && r.handoff) tab.location.href = r.handoff;
    else tab?.close();
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
        <Field id="name" label="Full name" auto="name" />
        <Field id="email" label="Email" type="email" auto="email" />
        <Field id="phone" label="Phone" type="tel" auto="tel" />
        <Field id="address" label="Delivery address" area auto="street-address" />
        <Field id="notes" label="Notes (optional)" area rows={2} required={false} />
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
