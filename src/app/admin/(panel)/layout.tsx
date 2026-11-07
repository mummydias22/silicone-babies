import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import MobileMenu from "@/components/MobileMenu";
import { logout } from "../actions";

const LINKS = [
  { href: "/admin", label: "Orders" }, { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" }, { href: "/admin/payments", label: "Payment methods" }, { href: "/admin/channels", label: "Order channels" },
  { href: "/admin/faqs", label: "FAQs" }, { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/blog", label: "Blog" }, { href: "/admin/settings", label: "Settings" }, { href: "/admin/account", label: "Account" },
];

const SignOut = () => (
  <form action={logout}><button type="submit" className="btn-outline w-full">Sign out</button></form>
);

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <header className="no-print flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 md:hidden">
        <Link href="/admin" className="font-serif text-xl font-semibold text-brand-dark">Admin</Link>
        <MobileMenu links={LINKS} footer={<SignOut />} />
      </header>
      <aside className="no-print hidden w-56 shrink-0 flex-col gap-1 border-r border-stone-200 bg-white p-4 md:flex">
        <Link href="/admin" className="mb-3 font-serif text-xl font-semibold text-brand-dark">Admin</Link>
        {LINKS.map((l) => <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm hover:bg-soft">{l.label}</Link>)}
        <div className="mt-auto space-y-2"><Link href="/" className="block text-center text-sm underline">View store</Link><SignOut /></div>
      </aside>
      <div className="min-w-0 flex-1 p-4 md:p-8">{children}</div>
    </div>
  );
}
