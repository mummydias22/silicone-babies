import Link from "next/link";
import { and, eq, desc, inArray } from "drizzle-orm";
import { db, products, categories } from "@/db";
import { toCards } from "@/lib/shop";
import { categoryIds } from "@/lib/categories";
import ProductCard from "../ProductCard";

export const metadata = { title: "Shop" };

export default async function Shop({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const cats = await db.select().from(categories).orderBy(categories.id);
  const cat = cats.find((c) => c.slug === category);
  const top = cats.filter((c) => !c.parentId);
  const parent = cat?.parentId ? cats.find((c) => c.id === cat.parentId) : cat; // the top-level category in play
  const subs = parent ? cats.filter((c) => c.parentId === parent.id) : [];
  const list = await db.select().from(products)
    .where(and(eq(products.published, true), cat ? inArray(products.categoryId, categoryIds(cats, cat)) : undefined))
    .orderBy(desc(products.createdAt));
  const cards = await toCards(list);
  const pill = (active: boolean) =>
    `inline-flex min-h-11 items-center rounded-full border px-5 text-sm transition ${active ? "border-brand bg-brand text-white" : "border-stone-300 hover:border-brand hover:bg-soft"}`;
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="eyebrow">The collection</p>
      <h1 className="mt-1 text-4xl font-semibold sm:text-5xl">Shop</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/shop" className={pill(!cat)}>All</Link>
        {top.map((c) => <Link key={c.id} href={`/shop?category=${c.slug}`} className={pill(parent?.id === c.id)}>{c.name}</Link>)}
      </div>
      {subs.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2" aria-label={`${parent!.name} subcategories`}>
          <Link href={`/shop?category=${parent!.slug}`} className={pill(cat?.id === parent!.id)}>All {parent!.name}</Link>
          {subs.map((c) => <Link key={c.id} href={`/shop?category=${c.slug}`} className={pill(cat?.id === c.id)}>{c.name}</Link>)}
        </div>
      )}
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
        {cards.map((p, k) => <div key={p.id} className="reveal" style={{ "--i": k % 4 } as React.CSSProperties}><ProductCard p={p} /></div>)}
      </div>
      {!cards.length && <p className="mt-8 text-stone-600">Nothing here yet.</p>}
    </div>
  );
}
