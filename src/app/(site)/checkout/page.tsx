import { eq } from "drizzle-orm";
import { db, paymentMethods } from "@/db";
import { getSettings } from "@/lib/settings";
import CheckoutForm from "./CheckoutForm";

export const metadata = { title: "Checkout" };

export default async function Checkout() {
  const [s, methods] = await Promise.all([getSettings(), db.select().from(paymentMethods).where(eq(paymentMethods.enabled, true)).orderBy(paymentMethods.id)]);
  const channels = [
    s.orderByEmail && { id: "email", label: "Email", button: "Place order & send by email" },
    s.orderByWhatsapp && s.whatsappNumber && { id: "whatsapp", label: "WhatsApp", button: "Place order & continue on WhatsApp" },
    s.orderBySms && s.smsNumber && { id: "sms", label: "Text message", button: "Place order & send by text" },
  ].filter(Boolean) as { id: "email" | "whatsapp" | "sms"; label: string; button: string }[];

  if (!methods.length || !channels.length) {
    return <div className="mx-auto max-w-2xl px-4 py-10"><h1 className="text-3xl font-semibold">Checkout</h1><p className="mt-4">Checkout isn&apos;t available right now. Please check back soon.</p></div>;
  }
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Checkout</h1>
      <CheckoutForm methods={methods.map((m) => ({ id: m.id, name: m.name, image: m.image, instructions: m.instructions }))} channels={channels} />
    </div>
  );
}
