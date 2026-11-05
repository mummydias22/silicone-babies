import { db, categories } from "@/db";
import { categoryTree } from "@/lib/categories";
import { addCategory, deleteCategory } from "../../actions";

export const metadata = { title: "Categories" };

export default async function AdminCategories() {
  const tree = categoryTree(await db.select().from(categories));
  const parents = tree.filter((c) => c.depth === 0);
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold">Categories</h1>
      <form action={addCategory} className="card mt-4 space-y-3">
        <div><label className="label" htmlFor="name">Name</label><input id="name" name="name" required placeholder="e.g. Newborn, or Boy" className="input" /></div>
        <div>
          <label className="label" htmlFor="parentId">Parent category</label>
          <select id="parentId" name="parentId" defaultValue="" className="input">
            <option value="">None (top-level category)</option>
            {parents.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <p className="mt-1 text-xs text-stone-500">Pick a parent to make this a subcategory, e.g. Boy under Newborn.</p>
        </div>
        <button type="submit" className="btn">Add</button>
      </form>
      <div className="mt-4 space-y-2">
        {tree.map((c) => (
          <form key={c.id} action={deleteCategory} className={`card flex items-center justify-between ${c.depth ? "ml-6" : ""}`}>
            <span className={c.depth ? "" : "font-medium"}>{c.depth ? `↳ ${c.name}` : c.name}</span>
            <input type="hidden" name="id" value={c.id} />
            <button type="submit" className="min-h-11 px-2 text-sm text-red-600 underline">
              {c.depth ? "Delete" : "Delete (and its subcategories)"}
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
