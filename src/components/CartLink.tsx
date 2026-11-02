"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-client";

export default function CartLink() {
  const items = useCart();
  const n = (items ?? []).reduce((t, i) => t + i.qty, 0);
  const [pop, setPop] = useState(0);
  useEffect(() => {
    const f = () => setPop((p) => p + 1);
    addEventListener("cart-pop", f);
    return () => removeEventListener("cart-pop", f);
  }, []);
  return (
    <Link href="/cart" aria-label={`Cart, ${n} items`} className="relative flex h-11 w-11 items-center justify-center rounded-full hover:bg-soft">
      {/* key re-mounts the element so the animation replays on every add */}
      <span key={`i${pop}`} data-cart-icon className={pop ? "wiggle inline-flex" : "inline-flex"}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 6h15l-1.5 9h-12zM6 6 5 3H2M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM18 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" /></svg>
      </span>
      {n > 0 && <span key={`b${pop}-${n}`} className="pop absolute right-0 top-0 min-w-5 rounded-full bg-brand px-1.5 text-center text-xs text-white">{n}</span>}
    </Link>
  );
}
