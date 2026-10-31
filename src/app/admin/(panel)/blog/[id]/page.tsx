import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, posts } from "@/db";
import FormSwitch from "@/components/FormSwitch";
import { savePost } from "../../../actions";

// Wireframes: [list thumbnail, post-page thumbnail] drawn as inline SVG.
const LAYOUTS = [
  { id: "classic", name: "Classic", desc: "Row with a small image; narrow article.",
    list: <><rect x="4" y="6" width="14" height="14" rx="2" /><rect x="22" y="8" width="34" height="3" /><rect x="22" y="14" width="26" height="3" /></>,
    post: <><rect x="14" y="4" width="32" height="4" /><rect x="14" y="12" width="32" height="2" /><rect x="14" y="17" width="32" height="2" /><rect x="14" y="22" width="24" height="2" /></> },
  { id: "grid", name: "Grid", desc: "Image-on-top cards; wide cover on the post.",
    list: <><rect x="4" y="4" width="24" height="12" rx="2" /><rect x="32" y="4" width="24" height="12" rx="2" /><rect x="4" y="20" width="24" height="3" /><rect x="32" y="20" width="24" height="3" /></>,
    post: <><rect x="6" y="3" width="48" height="12" rx="2" /><rect x="14" y="19" width="32" height="3" /><rect x="14" y="25" width="32" height="2" /></> },
  { id: "magazine", name: "Magazine", desc: "Big image with overlaid title; full-width hero.",
    list: <><rect x="4" y="3" width="52" height="24" rx="3" /><rect x="8" y="20" width="26" height="3" fill="white" /></>,
    post: <><rect x="0" y="0" width="60" height="16" /><rect x="6" y="10" width="28" height="3" fill="white" /><rect x="14" y="21" width="32" height="2" /><rect x="14" y="26" width="32" height="2" /></> },
];

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const [p] = isNew ? [] : await db.select().from(posts).where(eq(posts.id, Number(id)));
  if (!isNew && !p) notFound();
  return (
    <form action={savePost} className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">{isNew ? "New post" : "Edit post"}</h1>
      {p && <input type="hidden" name="id" value={p.id} />}
      <div><label className="label" htmlFor="title">Title</label><input id="title" name="title" required defaultValue={p?.title} className="input" /></div>
      <div><label className="label" htmlFor="excerpt">Excerpt</label><input id="excerpt" name="excerpt" defaultValue={p?.excerpt} className="input" /></div>
      <div><label className="label" htmlFor="body">Body (blank line between paragraphs)</label><textarea id="body" name="body" rows={10} defaultValue={p?.body} className="input" /></div>
      <div>
        <label className="label" htmlFor="cover">Cover image</label>
        {p?.cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.cover} alt="" className="mb-2 h-24 rounded-lg" />
        )}
        <input id="cover" name="cover" type="file" accept="image/*" className="input" />
      </div>
      <fieldset>
        <legend className="label">Layout</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {LAYOUTS.map((l) => (
            <label key={l.id} className="cursor-pointer">
              <input type="radio" name="layout" value={l.id} defaultChecked={(p?.layout ?? "classic") === l.id} className="peer sr-only" />
              <span className="block rounded-xl border-2 border-stone-200 bg-white p-3 peer-checked:border-brand peer-checked:ring-2 peer-checked:ring-brand/30 peer-focus-visible:outline-2 peer-focus-visible:outline-brand">
                <span className="grid grid-cols-2 gap-2 text-stone-400">
                  {[l.list, l.post].map((shape, i) => (
                    <svg key={i} viewBox="0 0 60 30" className="w-full rounded bg-stone-50" fill="currentColor" aria-hidden>{shape}</svg>
                  ))}
                </span>
                <span className="mt-2 block text-xs text-stone-500">List · Post</span>
                <span className="block font-medium">{l.name}</span>
                <span className="block text-xs text-stone-600">{l.desc}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <FormSwitch name="published" label="Published" defaultChecked={p?.published ?? true} />
      <button type="submit" className="btn">Save post</button>
    </form>
  );
}
