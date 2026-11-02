import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, posts } from "@/db";

export const metadata = { title: "Blog" };

export default async function Blog() {
  const list = await db.select().from(posts).where(eq(posts.published, true)).orderBy(desc(posts.createdAt));
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Blog</h1>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => {
          const cover = p.cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.cover} alt="" className={`object-cover ${p.layout === "magazine" ? "absolute inset-0 h-full w-full" : p.layout === "classic" ? "h-24 w-24 shrink-0 rounded-lg" : "aspect-video w-full rounded-xl"}`} />
          );
          if (p.layout === "magazine") {
            return (
              <Link key={p.id} href={`/blog/${p.slug}`} className="relative flex min-h-64 items-end overflow-hidden rounded-2xl bg-stone-800 sm:col-span-2">
                {cover}<div className="relative w-full bg-gradient-to-t from-black/80 to-transparent p-5 text-white"><h2 className="text-xl font-semibold">{p.title}</h2><p className="text-sm">{p.excerpt}</p></div>
              </Link>
            );
          }
          return (
            <Link key={p.id} href={`/blog/${p.slug}`} className={`card hover:border-brand ${p.layout === "classic" ? "flex gap-4 sm:col-span-2 lg:col-span-3" : ""}`}>
              {cover}
              <div className={`min-w-0 ${p.layout === "grid" ? "mt-3" : "flex-1"}`}><h2 className="text-lg font-semibold">{p.title}</h2><p className="mt-1 text-sm text-stone-600">{p.excerpt}</p></div>
            </Link>
          );
        })}
      </div>
      {!list.length && <p className="mt-6 text-stone-600">No posts yet.</p>}
    </div>
  );
}
