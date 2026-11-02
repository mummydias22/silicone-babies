"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { addToCart } from "@/lib/cart-client";
import { flyToCart } from "@/lib/fly";
import { money } from "@/lib/money";

type V = { id: number; option: string; value: string; priceDelta: number; stock: number };
type P = { id: number; name: string; description: string; price: number; comparePrice: number | null; stock: number; images: string[] };

export default function ProductBuy({ p, variants }: { p: P; variants: V[] }) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState<{ i: number; x: number; y: number } | null>(null);
  const [pick, setPick] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const names = [...new Set(variants.map((v) => v.option))];
  const ready = names.every((n) => pick[n]);
  const price = p.price + names.reduce((t, n) => t + (variants.find((v) => v.option === n && v.value === pick[n])?.priceDelta ?? 0), 0);
  const sold = p.stock <= 0;
  const sale = p.comparePrice !== null && p.comparePrice > p.price;

  useEffect(() => setMounted(true), []); // eslint-disable-line react-hooks/set-state-in-effect

  // Keep the dot/thumbnail index in sync with the swipe position (rAF-throttled).
  useEffect(() => {
    const t = track.current;
    if (!t) return;
    let raf = 0;
    const on = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; setIdx(Math.round(t.scrollLeft / (t.clientWidth || 1))); }); };
    t.addEventListener("scroll", on, { passive: true });
    return () => { t.removeEventListener("scroll", on); cancelAnimationFrame(raf); };
  }, []);

  const scrollTo = (i: number) => { setZoom(null); track.current?.scrollTo({ left: i * (track.current.clientWidth || 0), behavior: "smooth" }); };
  const mainImg = () => track.current?.querySelectorAll("img")[idx] ?? null;
  const add = () => { addToCart({ productId: p.id, qty: 1, options: pick }); flyToCart(mainImg()); };
  const onAdd = () => { add(); setAdded(true); };
  const onBuy = () => { if (!added) add(); router.push("/checkout"); };

  const onZoom = (e: React.MouseEvent<HTMLButtonElement>, i: number) => {
    if (zoom?.i === i) return setZoom(null);
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ i, x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };
  const onMove = (e: React.PointerEvent<HTMLButtonElement>, i: number) => {
    if (zoom?.i !== i || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ i, x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  const bar = (
    <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-stone-200 bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{p.name}</p><p className="text-sm text-brand-dark">{money(price)}</p></div>
      <button type="button" className="btn" disabled={!ready || sold} onClick={onAdd} data-sticky-add>{ready ? "Add to cart" : "Choose options"}</button>
    </div>
  );

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-3 md:flex-row-reverse">
        <div className="relative min-w-0 flex-1">
          <div ref={track} className="flex snap-x snap-mandatory overflow-x-auto rounded-3xl bg-soft [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {p.images.length ? p.images.map((src, i) => (
              <button key={src} type="button" aria-label={zoom?.i === i ? "Zoom out" : "Zoom in"} onClick={(e) => onZoom(e, i)} onPointerMove={(e) => onMove(e, i)}
                className={`relative aspect-square w-full shrink-0 snap-center overflow-hidden ${zoom?.i === i ? "cursor-zoom-out" : "cursor-zoom-in"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`${p.name}, photo ${i + 1}`} loading={i === 0 ? "eager" : "lazy"} draggable={false}
                  className="h-full w-full object-cover transition-transform duration-300 ease-out"
                  style={zoom?.i === i ? { transform: "scale(2.2)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined} />
              </button>
            )) : (
              <div className="flex aspect-square w-full shrink-0 items-center justify-center bg-gradient-to-br from-soft to-blush text-brand-dark">Photo coming soon</div>
            )}
          </div>
          {p.images.length > 1 && (
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5 md:hidden" aria-hidden>
              {p.images.map((_, i) => <span key={i} className={`h-1.5 rounded-full bg-white shadow transition-all ${i === idx ? "w-5" : "w-1.5 opacity-60"}`} />)}
            </div>
          )}
        </div>
        {p.images.length > 1 && (
          <div className="hidden w-16 shrink-0 flex-col gap-2 md:flex">
            {p.images.map((src, i) => (
              <button key={src} type="button" onClick={() => scrollTo(i)} aria-label={`Show photo ${i + 1}`} aria-current={i === idx}
                className={`overflow-hidden rounded-xl border-2 transition ${i === idx ? "border-brand" : "border-transparent opacity-70 hover:opacity-100"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="min-w-0">
        <h1 className="text-3xl font-semibold sm:text-4xl">{p.name}</h1>
        <p className="mt-2 flex items-center gap-3 text-2xl text-brand-dark">
          {sale && <s className="text-lg text-stone-400">{money(p.comparePrice!)}</s>}
          <span key={price} className="num-in">{money(price)}</span>
          {sale && <span className="sale-badge relative rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">Sale</span>}
        </p>
        <p className="mt-4 whitespace-pre-line text-stone-700">{p.description}</p>
        {names.map((n) => (
          <fieldset key={n} className="mt-6">
            <legend className="label">{n}{pick[n] && <span className="ml-2 font-normal text-stone-500">{pick[n]}</span>}</legend>
            <div className="flex flex-wrap gap-2">
              {variants.filter((v) => v.option === n).map((v) => {
                const on = pick[n] === v.value;
                return (
                  <button key={`${v.id}-${on}`} type="button" disabled={v.stock <= 0} aria-pressed={on}
                    onClick={() => { setPick({ ...pick, [n]: v.value }); setAdded(false); }}
                    className={`min-h-11 rounded-full border px-5 text-sm transition duration-200 active:scale-95 disabled:opacity-40 ${on ? "pop border-brand bg-brand text-white" : "border-stone-300 hover:border-brand hover:bg-soft"}`}>
                    {v.value}{v.priceDelta ? ` (+${money(v.priceDelta)})` : ""}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
        <p className="mt-5 text-sm">{sold ? <span className="text-red-600">Sold out</span> : <span className="text-green-700">In stock ({p.stock} available)</span>}</p>
        <div className="mt-5 hidden flex-wrap gap-3 md:flex">
          <button type="button" className="btn" disabled={!ready || sold} onClick={onAdd}>Add to cart</button>
          <button type="button" className="btn-outline" disabled={!ready || sold} onClick={onBuy}>Proceed to checkout</button>
        </div>
        {/* mobile: Add to cart lives in the sticky bar; checkout stays here */}
        <div className="mt-5 flex flex-col gap-3 md:hidden">
          <button type="button" className="btn-outline" disabled={!ready || sold} onClick={onBuy}>Proceed to checkout</button>
        </div>
        {added && <Link href="/shop" className="btn-outline mt-3 w-full">Continue shopping</Link>}
        <ul className="mt-6 space-y-1 text-sm text-stone-600">
          <li>• No payment on the site: we reply with payment details after you order.</li>
          <li>• Collector and comfort doll, not a toy for children under 14.</li>
        </ul>
      </div>
      {mounted && createPortal(bar, document.body)}
    </div>
  );
}
