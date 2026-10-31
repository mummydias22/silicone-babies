import Link from "next/link";
import { money } from "@/lib/settings";

export default function ProductCard({ p }: { p: { slug: string; name: string; price: number; images: string[]; stock: number } }) {
  return (
    <Link href={`/product/${p.slug}`} className="group block">
      <div className="aspect-square overflow-hidden rounded-2xl bg-soft">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {p.images[0] && <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover transition group-hover:scale-105" />}
      </div>
      <p className="mt-3 font-medium">{p.name}</p>
      <p className="text-sm text-stone-600">From {money(p.price)}{p.stock <= 0 && " · Sold out"}</p>
    </Link>
  );
}
