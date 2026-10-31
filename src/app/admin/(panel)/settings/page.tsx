import { getSettings } from "@/lib/settings";
import SettingsForm from "./SettingsForm";

export const metadata = { title: "Settings" };

export default async function AdminSettings() {
  const s = await getSettings();
  // Never send the stored SMTP password to the browser.
  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold">Settings</h1>
      <SettingsForm s={{ ...s, smtpPass: s.smtpPass ? "set" : "" }} />
    </>
  );
}
