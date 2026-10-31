import { db, categories } from "@/db";
import { addCategory, deleteCategory } from "../../actions";

export const metadata = { title: "Categories" };

export default async function AdminCategories() {
  const list = await db.select().from(categories).orderBy(categories.id);
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold">Categories</h1>
      <form action={addCategory} className="mt-4 flex gap-2">
        <label className="sr-only" htmlFor="name">Name</label>
        <input id="name" name="name" required placeholder="New category" className="input" />
        <button type="submit" className="btn">Add</button>
      </form>
      <div className="mt-4 space-y-2">
        {list.map((c) => (
          <form key={c.id} action={deleteCategory} className="card flex items-center justify-between">
            <span>{c.name}</span><input type="hidden" name="id" value={c.id} />
            <button type="submit" className="text-sm text-red-600 underline">Delete</button>
          </form>
        ))}
      </div>
    </div>
  );
}
