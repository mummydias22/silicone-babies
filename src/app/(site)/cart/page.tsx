"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { readCart, writeCart, useCart } from "@/lib/cart-client";
import { getCart } from "../actions";
import type { Line } from "@/lib/shop";
import { money } from "@/lib/money";

export default function Cart() {
  const items = useCart();
  const [lines, setLines] = useState<Line[] | null>(null);

  useEffect(() => {
    if (items?.length) getCart(items).then(setLines);
  }, [items]);

  const clear = () => { if (confirm("Clear your cart?")) writeCart([]); };
  const same = (a: Line, b: { productId: number; options: Record<string, string> }) =>
    a.productId === b.productId && JSON.stringify(a.options) === JSON.stringify(b.options);
  const setQty = (l: Line, qty: number) =>
    writeCart(readCart().flatMap((c) => (same(l, c) ? (qty > 0 ? [{ ...c, qty }] : []) : [c])));

  if (items === null || (items.length > 0 && lines === null)) return <div className="mx-auto max-w-3xl px-4 py-10">Loading…</div>;
  if (!items.length || !lines) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-semibold">Your cart</h1>
        <p className="mt-4">Your cart is empty.</p>
        <Link href="/shop" className="btn mt-4">Go to shop</Link>
      </div>
    );
  }
  const orderable = lines.filter((l) => !l.error);
  const total = orderable.reduce((t, l) => t + l.unitPrice * l.qty, 0);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Your cart</h1>
        <button type="button" onClick={clear} className="text-sm text-red-600 underline">Clear cart</button>
      </div>
      <ul className="mt-6 space-y-3">
        {lines.map((l, i) => (
          <li key={i} className="card flex gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {l.image && <img src={l.image} alt="" className="h-20 w-20 rounded-lg object-cover" />}
            <div className="min-w-0 flex-1">
              <Link href={`/product/${l.slug}`} className="font-medium hover:text-brand">{l.name}</Link>
              {l.optionsText && <p className="text-sm text-stone-600">{l.optionsText}</p>}
              {l.error ? <p className="text-sm text-red-600">{l.error}</p> : <p className="text-sm">{money(l.unitPrice)}</p>}
              <div className="mt-2 flex items-center gap-2">
                <button type="button" aria-label="Decrease" className="btn-outline !px-3 !py-1" onClick={() => setQty(l, l.qty - 1)}>−</button>
                <span aria-live="polite">{l.qty}</span>
                <button type="button" aria-label="Increase" className="btn-outline !px-3 !py-1" onClick={() => setQty(l, l.qty + 1)}>+</button>
                <button type="button" className="ml-auto text-sm text-red-600 underline" onClick={() => setQty(l, 0)}>Remove</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {orderable.length > 0 ? (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xl">Total: <strong>{money(total)}</strong></p>
          <Link href="/checkout" className="btn">Checkout</Link>
        </div>
      ) : <p className="mt-6 text-sm text-red-600">None of the items in your cart can be ordered right now.</p>}
    </div>
  );
}
