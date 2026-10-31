"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addToCart } from "@/lib/cart-client";
import { money } from "@/lib/money";

type V = { id: number; option: string; value: string; priceDelta: number; stock: number };
type P = { id: number; name: string; description: string; price: number; stock: number; images: string[] };

export default function ProductBuy({ p, variants }: { p: P; variants: V[] }) {
  const router = useRouter();
  const [main, setMain] = useState(0);
  const [pick, setPick] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);
  const names = [...new Set(variants.map((v) => v.option))];
  const ready = names.every((n) => pick[n]);
  const price = p.price + names.reduce((t, n) => t + (variants.find((v) => v.option === n && v.value === pick[n])?.priceDelta ?? 0), 0);
  const sold = p.stock <= 0;
  const add = () => addToCart({ productId: p.id, qty: 1, options: pick });

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex min-w-0 gap-3">
        <div className="flex w-16 shrink-0 flex-col gap-2">
          {p.images.map((src, i) => (
            <button key={src} type="button" onClick={() => setMain(i)} aria-label={`Image ${i + 1}`}
              className={`overflow-hidden rounded-lg border-2 ${i === main ? "border-brand" : "border-transparent"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="aspect-square w-full object-cover" />
            </button>
          ))}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {p.images[main] && <img src={p.images[main]} alt={p.name} className="aspect-square min-w-0 flex-1 rounded-2xl object-cover" />}
      </div>
      <div className="min-w-0">
        <h1 className="text-3xl font-semibold">{p.name}</h1>
        <p className="mt-2 text-2xl text-brand-dark">{money(price)}</p>
        <p className="mt-4 whitespace-pre-line text-stone-700">{p.description}</p>
        {names.map((n) => (
          <fieldset key={n} className="mt-5">
            <legend className="label">{n}</legend>
            <div className="flex flex-wrap gap-2">
              {variants.filter((v) => v.option === n).map((v) => (
                <button key={v.id} type="button" disabled={v.stock <= 0} aria-pressed={pick[n] === v.value}
                  onClick={() => { setPick({ ...pick, [n]: v.value }); setAdded(false); }}
                  className={`rounded-full border px-4 py-1.5 text-sm disabled:opacity-40 ${pick[n] === v.value ? "border-brand bg-brand text-white" : "border-stone-300 hover:border-brand"}`}>
                  {v.value}{v.priceDelta ? ` (+${money(v.priceDelta)})` : ""}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
        <p className="mt-4 text-sm">
          {sold ? <span className="text-red-600">Sold out</span> : <span className="text-green-700">In stock ({p.stock} available)</span>}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" className="btn" disabled={!ready || sold} onClick={() => { add(); setAdded(true); }}>Add to cart</button>
          <button type="button" className="btn-outline" disabled={!ready || sold} onClick={() => { if (!added) add(); router.push("/checkout"); }}>Proceed to checkout</button>
        </div>
        {added && <Link href="/shop" className="btn-outline mt-3 w-full">Continue shopping</Link>}
        <ul className="mt-6 space-y-1 text-sm text-stone-600">
          <li>• No payment on the site: we reply with payment details after you order.</li>
          <li>• Collector and comfort doll, not a toy for children under 14.</li>
        </ul>
      </div>
    </div>
  );
}
