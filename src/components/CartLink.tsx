"use client";
import Link from "next/link";
import { useCart } from "@/lib/cart-client";

export default function CartLink() {
  const items = useCart();
  const n = (items ?? []).reduce((t, i) => t + i.qty, 0);
  return (
    <Link href="/cart" aria-label={`Cart, ${n} items`} className="relative rounded-lg p-2 hover:bg-soft">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6h15l-1.5 9h-12zM6 6 5 3H2M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM18 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" /></svg>
      {n > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-brand px-1.5 text-xs text-white">{n}</span>}
    </Link>
  );
}
