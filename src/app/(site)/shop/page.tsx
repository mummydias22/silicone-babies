import Link from "next/link";
import { and, eq, desc } from "drizzle-orm";
import { db, products, categories } from "@/db";
import ProductCard from "../ProductCard";

export const metadata = { title: "Shop" };

export default async function Shop({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const cats = await db.select().from(categories);
  const cat = cats.find((c) => c.slug === category);
  const list = await db.select().from(products)
    .where(and(eq(products.published, true), cat ? eq(products.categoryId, cat.id) : undefined))
    .orderBy(desc(products.createdAt));
  const pill = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm ${active ? "border-brand bg-brand text-white" : "border-stone-300 hover:border-brand"}`;
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Shop</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/shop" className={pill(!cat)}>All</Link>
        {cats.map((c) => <Link key={c.id} href={`/shop?category=${c.slug}`} className={pill(cat?.id === c.id)}>{c.name}</Link>)}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      {!list.length && <p className="mt-8 text-stone-600">Nothing here yet.</p>}
    </div>
  );
}
