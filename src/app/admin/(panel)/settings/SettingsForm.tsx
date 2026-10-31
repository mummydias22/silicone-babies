"use client";
import { useActionState } from "react";
import FormSwitch from "@/components/FormSwitch";
import PhoneField from "@/components/PhoneField";
import type { Settings } from "@/lib/settings";
import { saveSettingsAction, testDiscord, testEmail } from "../../actions";
import TestButton from "./TestButton";

const Text = ({ s, k, label, type = "text", ph }: { s: Settings; k: keyof Settings; label: string; type?: string; ph?: string }) => (
  <div><label className="label" htmlFor={k}>{label}</label><input id={k} name={k} type={type} defaultValue={String(s[k])} placeholder={ph} className="input" /></div>
);
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="card space-y-3"><h2 className="font-semibold">{title}</h2>{children}</section>
);

export default function SettingsForm({ s }: { s: Settings }) {
  const [state, action, pending] = useActionState(saveSettingsAction, { saved: 0 });
  return (
    <form action={action} className="max-w-2xl space-y-5 pb-24">
      <Section title="Store">
        <Text s={s} k="storeName" label="Store name" />
        <Text s={s} k="tagline" label="Tagline" />
        <Text s={s} k="banner" label="Announcement banner (blank to hide)" />
        <Text s={s} k="phone" label="Phone" type="tel" />
        <Text s={s} k="email" label="Public email" type="email" />
        <Text s={s} k="address" label="Store address" />
        <FormSwitch name="mapEnabled" label="Show map on contact page" defaultChecked={s.mapEnabled} />
      </Section>
      <Section title="WhatsApp">
        <PhoneField name="whatsappNumber" label="WhatsApp number" defaultValue={s.whatsappNumber} />
        <FormSwitch name="whatsappFloat" label="Floating WhatsApp button" defaultChecked={s.whatsappFloat} />
        <FormSwitch name="orderByWhatsapp" label="Let customers order by WhatsApp" defaultChecked={s.orderByWhatsapp} />
      </Section>
      <Section title="Text message (SMS)">
        <PhoneField name="smsNumber" label="Text message number" defaultValue={s.smsNumber} />
        <FormSwitch name="orderBySms" label="Let customers order by text" defaultChecked={s.orderBySms} />
      </Section>
      <Section title="Live chat">
        <div><label className="label" htmlFor="liveChat">Provider snippet</label><textarea id="liveChat" name="liveChat" rows={4} defaultValue={s.liveChat} className="input font-mono" /></div>
        <FormSwitch name="liveChatEnabled" label="Live chat on" defaultChecked={s.liveChatEnabled} />
      </Section>
      <Section title="Discord">
        <Text s={s} k="discordWebhook" label="Webhook URL" />
        <TestButton label="Send test (save first)" action={testDiscord} />
      </Section>
      <Section title="Email (SMTP)">
        <Text s={s} k="smtpHost" label="Host" />
        <Text s={s} k="smtpPort" label="Port" />
        <Text s={s} k="smtpUser" label="User" />
        <div><label className="label" htmlFor="smtpPass">Password</label><input id="smtpPass" name="smtpPass" type="password" placeholder={s.smtpPass ? "Saved — leave blank to keep" : ""} autoComplete="new-password" className="input" /></div>
        <Text s={s} k="smtpFrom" label="From address" />
        <Text s={s} k="notifyEmails" label="Notification recipients (comma separated)" />
        <FormSwitch name="orderByEmail" label="Let customers order by email" defaultChecked={s.orderByEmail} />
        <TestButton label="Send test email (save first)" action={testEmail} />
      </Section>
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-end gap-4 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur md:left-56">
        <span role="status" className="text-sm text-green-700">{state.saved && !pending ? "Settings saved." : ""}</span>
        <button type="submit" className="btn" disabled={pending}>{pending ? "Saving…" : "Save settings"}</button>
      </div>
    </form>
  );
}
