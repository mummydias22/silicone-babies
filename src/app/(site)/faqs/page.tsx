import { db, faqs } from "@/db";

export const metadata = { title: "FAQs" };

export default async function Faqs() {
  const list = await db.select().from(faqs).orderBy(faqs.id);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Frequently asked questions</h1>
      <div className="mt-6 space-y-2">
        {list.map((f) => (
          <details key={f.id} className="card group">
            <summary className="cursor-pointer font-medium">{f.question}</summary>
            <p className="mt-2 text-sm text-stone-700">{f.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
