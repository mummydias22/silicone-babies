import Link from "next/link";
import { desc } from "drizzle-orm";
import { db, products } from "@/db";
import { money } from "@/lib/settings";
import { deleteProduct } from "../../actions";

export const metadata = { title: "Products" };

export default async function AdminProducts() {
  const list = await db.select().from(products).orderBy(desc(products.createdAt));
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link href="/admin/products/new" className="btn">New product</Link>
      </div>
      <div className="mt-4 space-y-2">
        {list.map((p) => (
          <div key={p.id} className="card flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {p.images[0] && <img src={p.images[0]} alt="" className="h-14 w-14 rounded-lg object-cover" />}
            <div className="min-w-0 flex-1">
              <Link href={`/admin/products/${p.id}`} className="font-medium hover:text-brand">{p.name}</Link>
              <p className="text-sm text-stone-600">{money(p.price)} · stock {p.stock}{!p.published && " · hidden"}</p>
            </div>
            <form action={deleteProduct}><input type="hidden" name="id" value={p.id} /><button type="submit" className="text-sm text-red-600 underline">Delete</button></form>
          </div>
        ))}
      </div>
    </>
  );
}
