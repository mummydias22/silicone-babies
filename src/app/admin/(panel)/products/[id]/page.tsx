import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, products, variants, categories } from "@/db";
import { categoryTree } from "@/lib/categories";
import { getSettings } from "@/lib/settings";
import FormSwitch from "@/components/FormSwitch";
import { saveProduct } from "../../../actions";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const cats = categoryTree(await db.select().from(categories));
  const { currency } = await getSettings();
  const [p] = isNew ? [] : await db.select().from(products).where(eq(products.id, Number(id)));
  if (!isNew && !p) notFound();
  const vs = p ? await db.select().from(variants).where(eq(variants.productId, p.id)) : [];
  const vText = vs.map((v) => `${v.option} | ${v.value} | ${(v.priceDelta / 100).toFixed(2)} | ${v.stock}`).join("\n");
  return (
    <form action={saveProduct} className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">{isNew ? "New product" : "Edit product"}</h1>
      {p && <input type="hidden" name="id" value={p.id} />}
      <div><label className="label" htmlFor="name">Name</label><input id="name" name="name" required defaultValue={p?.name} className="input" /></div>
      <div><label className="label" htmlFor="description">Description</label><textarea id="description" name="description" rows={4} defaultValue={p?.description} className="input" /></div>
      <div>
        <label className="label" htmlFor="comparePrice">Compare-at price ({currency}, optional)</label>
        <input id="comparePrice" name="comparePrice" type="number" step="0.01" min="0" defaultValue={p?.comparePrice ? (p.comparePrice / 100).toFixed(2) : ""} className="input" />
        <p className="mt-1 text-xs text-stone-500">If higher than the price, the product shows a Sale badge and the old price struck through.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label" htmlFor="price">Price ({currency})</label><input id="price" name="price" type="number" step="0.01" min="0" required defaultValue={p ? (p.price / 100).toFixed(2) : ""} className="input" /></div>
        <div><label className="label" htmlFor="stock">Stock</label><input id="stock" name="stock" type="number" min="0" defaultValue={p?.stock ?? 1} className="input" /></div>
      </div>
      <div>
        <label className="label" htmlFor="categoryId">Category</label>
        <select id="categoryId" name="categoryId" defaultValue={p?.categoryId ?? ""} className="input">
          <option value="">None</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="variants">Variants</label>
        <textarea id="variants" name="variants" rows={5} defaultValue={vText} className="input font-mono" placeholder="Skin tone | Light | 0.00 | 5" />
        <p className="mt-1 text-xs text-stone-500">One per line: Option | Value | price change ({currency}) | stock</p>
      </div>
      <div>
        <p className="label">Images</p>
        <div className="mb-2 flex flex-wrap gap-3">
          {p?.images.map((u) => (
            <label key={u} className="text-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="h-20 w-20 rounded-lg object-cover" />
              <input type="checkbox" name="remove" value={u} /> remove
            </label>
          ))}
        </div>
        <input name="images" type="file" accept="image/*" multiple className="input" aria-label="Add images" />
      </div>
      <FormSwitch name="published" label="Published" defaultChecked={p?.published ?? true} />
      <button type="submit" className="btn">Save product</button>
    </form>
  );
}
