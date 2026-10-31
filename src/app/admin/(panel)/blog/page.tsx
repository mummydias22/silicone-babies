import Link from "next/link";
import { desc } from "drizzle-orm";
import { db, posts } from "@/db";
import { deletePost } from "../../actions";

export const metadata = { title: "Blog" };

export default async function AdminBlog() {
  const list = await db.select().from(posts).orderBy(desc(posts.createdAt));
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Blog</h1>
        <Link href="/admin/blog/new" className="btn">New post</Link>
      </div>
      <div className="mt-4 space-y-2">
        {list.map((p) => (
          <div key={p.id} className="card flex items-center justify-between gap-3">
            <div className="min-w-0"><Link href={`/admin/blog/${p.id}`} className="font-medium hover:text-brand">{p.title}</Link><p className="text-sm text-stone-600">{p.layout}{!p.published && " · draft"}</p></div>
            <form action={deletePost}><input type="hidden" name="id" value={p.id} /><button type="submit" className="text-sm text-red-600 underline">Delete</button></form>
          </div>
        ))}
      </div>
    </>
  );
}
