import { notFound } from "next/navigation";
import { and, eq, ne } from "drizzle-orm";
import { db, products, variants } from "@/db";
import { toCards } from "@/lib/shop";
import ProductBuy from "./ProductBuy";
import ProductCard from "../../ProductCard";

export default async function Product({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [p] = await db.select().from(products).where(and(eq(products.slug, slug), eq(products.published, true)));
  if (!p) notFound();
  const vs = await db.select().from(variants).where(eq(variants.productId, p.id));
  const more = p.categoryId
    ? await toCards(await db.select().from(products)
        .where(and(eq(products.categoryId, p.categoryId), ne(products.id, p.id), eq(products.published, true))).limit(4))
    : [];
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-28 md:py-10 md:pb-10">
      <ProductBuy
        p={{ id: p.id, name: p.name, description: p.description, price: p.price, comparePrice: p.comparePrice, stock: p.stock, images: p.images }}
        variants={vs}
      />
      {more.length > 0 && (
        <section className="mt-16">
          <h2 className="reveal text-2xl font-semibold sm:text-3xl">More from this category</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {more.map((m, k) => <div key={m.id} className="reveal" style={{ "--i": k } as React.CSSProperties}><ProductCard p={m} /></div>)}
          </div>
        </section>
      )}
    </div>
  );
}
