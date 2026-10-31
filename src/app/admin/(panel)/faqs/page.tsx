import { db, faqs } from "@/db";
import { saveFaq, deleteFaq } from "../../actions";

export const metadata = { title: "FAQs" };

function Fields({ f }: { f?: { id: number; question: string; answer: string } }) {
  return (
    <>
      {f && <input type="hidden" name="id" value={f.id} />}
      <div><label className="label">Question<input name="question" required defaultValue={f?.question} className="input mt-1 font-normal" /></label></div>
      <div><label className="label">Answer<textarea name="answer" required rows={3} defaultValue={f?.answer} className="input mt-1 font-normal" /></label></div>
    </>
  );
}

export default async function AdminFaqs() {
  const list = await db.select().from(faqs).orderBy(faqs.id);
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">FAQs</h1>
      <div className="mt-4 space-y-2">
        {list.map((f) => (
          <details key={f.id} className="card">
            <summary className="cursor-pointer font-medium">{f.question}</summary>
            <form action={saveFaq} className="mt-3 space-y-3"><Fields f={f} /><button type="submit" className="btn">Save</button></form>
            <form action={deleteFaq} className="mt-2"><input type="hidden" name="id" value={f.id} /><button type="submit" className="text-sm text-red-600 underline">Delete</button></form>
          </details>
        ))}
      </div>
      <form action={saveFaq} className="card mt-6 space-y-3"><h2 className="font-semibold">Add an FAQ</h2><Fields /><button type="submit" className="btn">Add</button></form>
    </div>
  );
}
