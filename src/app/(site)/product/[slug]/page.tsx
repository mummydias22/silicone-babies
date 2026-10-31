import { notFound } from "next/navigation";
import { and, eq, ne } from "drizzle-orm";
import { db, products, variants } from "@/db";
import ProductBuy from "./ProductBuy";
import ProductCard from "../../ProductCard";

export default async function Product({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [p] = await db.select().from(products).where(and(eq(products.slug, slug), eq(products.published, true)));
  if (!p) notFound();
  const vs = await db.select().from(variants).where(eq(variants.productId, p.id));
  const more = p.categoryId
    ? await db.select().from(products)
        .where(and(eq(products.categoryId, p.categoryId), ne(products.id, p.id), eq(products.published, true))).limit(4)
    : [];
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <ProductBuy
        p={{ id: p.id, name: p.name, description: p.description, price: p.price, stock: p.stock, images: p.images }}
        variants={vs}
      />
      {more.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">More from this category</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">{more.map((m) => <ProductCard key={m.id} p={m} />)}</div>
        </section>
      )}
    </div>
  );
}
