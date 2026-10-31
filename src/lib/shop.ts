import { db, products, variants } from "@/db";
import { inArray } from "drizzle-orm";

export type CartItem = { productId: number; qty: number; options: Record<string, string> };
export type Line = {
  productId: number; name: string; slug: string; image: string | null; qty: number;
  options: Record<string, string>; optionsText: string; unitPrice: number; error?: string;
};

// The browser cart only holds ids and qty; price, options and stock are recomputed here.
export async function priceCart(items: CartItem[]): Promise<Line[]> {
  const ids = [...new Set(items.map((i) => i.productId))];
  if (!ids.length) return [];
  const [ps, vs] = await Promise.all([
    db.select().from(products).where(inArray(products.id, ids)),
    db.select().from(variants).where(inArray(variants.productId, ids)),
  ]);
  return items.flatMap((it): Line[] => {
    const p = ps.find((x) => x.id === it.productId);
    if (!p || !p.published) return [];
    const qty = Math.max(1, Math.floor(it.qty) || 1);
    const opts = vs.filter((v) => v.productId === p.id);
    const names = [...new Set(opts.map((v) => v.option))];
    let unit = p.price, error: string | undefined;
    const clean: Record<string, string> = {};
    for (const n of names) {
      const v = opts.find((o) => o.option === n && o.value === it.options?.[n]);
      if (!v) { error = `Choose ${n}`; continue; }
      clean[n] = v.value; unit += v.priceDelta;
      if (v.stock < qty) error = `${n} ${v.value} is out of stock`;
    }
    if (p.stock < qty) error = p.stock <= 0 ? "Out of stock" : `Only ${p.stock} left`;
    return [{
      productId: p.id, name: p.name, slug: p.slug, image: p.images[0] ?? null, qty, options: clean,
      optionsText: Object.entries(clean).map(([k, v]) => `${k}: ${v}`).join(", "), unitPrice: unit, error,
    }];
  });
}
