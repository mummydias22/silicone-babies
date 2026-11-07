"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { readCart, writeCart, useCart } from "@/lib/cart-client";
import { getCart } from "../actions";
import type { Line } from "@/lib/shop";
import { useMoney } from "@/components/Currency";
import CountUp from "@/components/motion/CountUp";

const key = (l: { productId: number; options: Record<string, string> }) => `${l.productId}:${JSON.stringify(l.options)}`;

export default function Cart() {
  const money = useMoney();
  const items = useCart();
  const [lines, setLines] = useState<Line[] | null>(null);
  const [leaving, setLeaving] = useState<string | null>(null);

  useEffect(() => {
    if (items?.length) getCart(items).then(setLines);
  }, [items]);

  const clear = () => { if (confirm("Clear your cart?")) writeCart([]); };
  const setQty = (l: Line, qty: number) =>
    writeCart(readCart().flatMap((c) => (key(c) === key(l) ? (qty > 0 ? [{ ...c, qty }] : []) : [c])));
  // Remove slides the row out first, then drops it from the cart when the animation ends.
  const remove = (l: Line) => (matchMedia("(prefers-reduced-motion: reduce)").matches ? setQty(l, 0) : setLeaving(key(l)));

  if (items === null || (items.length > 0 && lines === null)) return <div className="mx-auto max-w-3xl px-4 py-12">Loading…</div>;
  if (!items.length || !lines) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-4xl font-semibold">Your cart</h1>
        <p className="mt-4">Your cart is empty.</p>
        <Link href="/shop" className="btn mt-4">Go to shop</Link>
      </div>
    );
  }
  // lines can lag behind items by one fetch; only show rows still in the cart (avoids a flicker on remove)
  const shown = lines.flatMap((l) => { const it = items.find((i) => key(i) === key(l)); return it ? [{ ...l, qty: it.qty }] : []; });
  const orderable = shown.filter((l) => !l.error);
  const total = orderable.reduce((t, l) => t + l.unitPrice * l.qty, 0);
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-semibold">Your cart</h1>
        <button type="button" onClick={clear} className="min-h-11 px-2 text-sm text-red-600 underline">Clear cart</button>
      </div>
      <ul className="mt-6 space-y-3">
        {shown.map((l) => (
          <li key={key(l)} className={`card flex gap-4 ${leaving === key(l) ? "slide-out" : ""}`}
            onAnimationEnd={() => { if (leaving === key(l)) { setLeaving(null); setQty(l, 0); } }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {l.image && <img src={l.image} alt="" className="h-20 w-20 rounded-xl object-cover" />}
            <div className="min-w-0 flex-1">
              <Link href={`/product/${l.slug}`} className="font-medium hover:text-brand">{l.name}</Link>
              {l.optionsText && <p className="text-sm text-stone-600">{l.optionsText}</p>}
              {l.error ? <p className="text-sm text-red-600">{l.error}</p> : <p className="text-sm">{money(l.unitPrice)}</p>}
              <div className="mt-2 flex items-center gap-2">
                <button type="button" aria-label="Decrease" className="btn-outline !min-h-11 !w-11 !px-0" onClick={() => (l.qty > 1 ? setQty(l, l.qty - 1) : remove(l))}>−</button>
                <span key={l.qty} aria-live="polite" className="num-in w-6 text-center">{l.qty}</span>
                <button type="button" aria-label="Increase" className="btn-outline !min-h-11 !w-11 !px-0" onClick={() => setQty(l, l.qty + 1)}>+</button>
                <button type="button" className="ml-auto min-h-11 px-2 text-sm text-red-600 underline" onClick={() => remove(l)}>Remove</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {orderable.length > 0 ? (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xl">Total: <strong><CountUp cents={total} /></strong></p>
          <Link href="/checkout" className="btn">Checkout</Link>
        </div>
      ) : <p className="mt-6 text-sm text-red-600">None of the items in your cart can be ordered right now.</p>}
    </div>
  );
}
