import { db, paymentMethods } from "@/db";
import FormSwitch from "@/components/FormSwitch";
import { addPayment, deletePayment } from "../../actions";
import InstantSwitch from "./InstantSwitch";

export const metadata = { title: "Payment methods" };

export default async function AdminPayments() {
  const list = await db.select().from(paymentMethods).orderBy(paymentMethods.id);
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Payment methods</h1>
      <div className="mt-4 space-y-2">
        {list.map((m) => (
          <div key={m.id} className="card flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {m.image && <img src={m.image} alt="" className="h-10 w-14 rounded object-contain" />}
            <div className="min-w-0 flex-1"><p className="font-medium">{m.name}</p><p className="truncate text-sm text-stone-600">{m.instructions}</p></div>
            <InstantSwitch id={m.id} enabled={m.enabled} label={m.name} />
            <form action={deletePayment}><input type="hidden" name="id" value={m.id} /><button type="submit" className="text-sm text-red-600 underline">Delete</button></form>
          </div>
        ))}
      </div>
      <form action={addPayment} className="card mt-6 space-y-3">
        <h2 className="font-semibold">Add a method</h2>
        <div><label className="label" htmlFor="name">Name</label><input id="name" name="name" required className="input" /></div>
        <div><label className="label" htmlFor="instructions">Instructions shown to the customer</label><textarea id="instructions" name="instructions" rows={3} className="input" /></div>
        <div><label className="label" htmlFor="image">Image / logo</label><input id="image" name="image" type="file" accept="image/*" className="input" /></div>
        <FormSwitch name="enabled" label="Enabled" defaultChecked />
        <button type="submit" className="btn">Add method</button>
      </form>
    </div>
  );
}
