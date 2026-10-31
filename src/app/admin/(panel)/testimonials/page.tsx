import { db, testimonials } from "@/db";
import { saveTestimonial, deleteTestimonial } from "../../actions";

export const metadata = { title: "Testimonials" };

type T = { id: number; name: string; quote: string; photo: string | null };

function Fields({ t }: { t?: T }) {
  return (
    <>
      {t && <input type="hidden" name="id" value={t.id} />}
      <div><label className="label">Name<input name="name" required defaultValue={t?.name} className="input mt-1 font-normal" /></label></div>
      <div><label className="label">Quote<textarea name="quote" required rows={3} defaultValue={t?.quote} className="input mt-1 font-normal" /></label></div>
      <div><label className="label">Photo (optional)<input name="photo" type="file" accept="image/*" className="input mt-1 font-normal" /></label></div>
    </>
  );
}

export default async function AdminTestimonials() {
  const list = await db.select().from(testimonials).orderBy(testimonials.id);
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Testimonials</h1>
      <div className="mt-4 space-y-2">
        {list.map((t) => (
          <details key={t.id} className="card">
            <summary className="cursor-pointer font-medium">{t.name}</summary>
            <form action={saveTestimonial} className="mt-3 space-y-3"><Fields t={t} /><button type="submit" className="btn">Save</button></form>
            <form action={deleteTestimonial} className="mt-2"><input type="hidden" name="id" value={t.id} /><button type="submit" className="text-sm text-red-600 underline">Delete</button></form>
          </details>
        ))}
      </div>
      <form action={saveTestimonial} className="card mt-6 space-y-3"><h2 className="font-semibold">Add a testimonial</h2><Fields /><button type="submit" className="btn">Add</button></form>
    </div>
  );
}
