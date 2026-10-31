import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db, posts } from "@/db";

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [p] = await db.select().from(posts).where(and(eq(posts.slug, slug), eq(posts.published, true)));
  if (!p) notFound();
  const body = (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-8 leading-relaxed">
      {p.body.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}
    </div>
  );
  if (p.layout === "magazine") {
    return (
      <article>
        <header className="relative flex min-h-80 items-end bg-stone-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {p.cover && <img src={p.cover} alt="" className="absolute inset-0 h-full w-full object-cover" />}
          <h1 className="relative mx-auto w-full max-w-4xl bg-gradient-to-t from-black/80 to-transparent px-4 py-8 text-4xl font-semibold text-white">{p.title}</h1>
        </header>
        {body}
      </article>
    );
  }
  return (
    <article className={p.layout === "grid" ? "mx-auto max-w-4xl px-4 py-10" : "py-6"}>
      {p.layout === "grid" && p.cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.cover} alt="" className="mb-6 aspect-video w-full rounded-2xl object-cover" />
      )}
      <h1 className="mx-auto max-w-2xl px-4 text-3xl font-semibold">{p.title}</h1>
      {body}
    </article>
  );
}
