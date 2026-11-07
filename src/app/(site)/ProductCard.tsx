"use client";
import Link from "next/link";
import { useRef } from "react";
import { addToCart } from "@/lib/cart-client";
import { flyToCart } from "@/lib/fly";
import { useMoney } from "@/components/Currency";
import type { CardProduct } from "@/lib/shop";

export default function ProductCard({ p }: { p: CardProduct }) {
  const money = useMoney();
  const img = useRef<HTMLImageElement>(null);
  const sold = p.stock <= 0;
  const sale = p.comparePrice !== null && p.comparePrice > p.price;
  const quick = () => {
    addToCart({ productId: p.id, qty: 1, options: {} });
    flyToCart(img.current);
  };
  return (
    <div className="lift group relative">
      <Link href={`/product/${p.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-soft">
          {p.images[0] ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img ref={img} src={p.images[0]} alt={p.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              {p.images[1] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.images[1]} alt="" loading="lazy" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-soft to-blush p-4 text-center text-sm text-brand-dark">Photo coming soon</div>
          )}
          {sale && <span className="sale-badge left-3 top-3 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">Sale</span>}
          {sold && <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium">Sold out</span>}
        </div>
        <p className="mt-3 font-medium">{p.name}</p>
        <p className="text-sm text-stone-600">
          {sale && <s className="mr-2 text-stone-400">{money(p.comparePrice!)}</s>}
          {p.hasVariants ? "From " : ""}{money(p.price)}
        </p>
      </Link>
      {!sold && (
        p.hasVariants ? (
          <Link href={`/product/${p.slug}`} className="btn-outline absolute bottom-[4.2rem] right-3 !min-h-11 bg-white/95 !px-4 text-xs opacity-100 sm:translate-y-2 sm:opacity-0 sm:transition sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100">
            Choose options
          </Link>
        ) : (
          <button type="button" onClick={quick} aria-label={`Quick add ${p.name}`}
            className="btn absolute bottom-[4.2rem] right-3 !px-4 text-xs sm:translate-y-2 sm:opacity-0 sm:transition sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100">
            Quick add
          </button>
        )
      )}
    </div>
  );
}
