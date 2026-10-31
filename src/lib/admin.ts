import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

// Real authorization: called on every admin page and server action (proxy is only a fast guard).
export async function requireAdmin() {
  const s = await auth.api.getSession({ headers: await headers() });
  if (!s) redirect("/admin/login");
  return s;
}
