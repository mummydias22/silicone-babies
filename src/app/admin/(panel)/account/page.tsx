import { requireAdmin } from "@/lib/admin";
import AccountForms from "./AccountForms";

export const metadata = { title: "Account" };

export default async function Account() {
  const { user } = await requireAdmin();
  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold">Account</h1>
      <AccountForms email={user.email} />
    </div>
  );
}
