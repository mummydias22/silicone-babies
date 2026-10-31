import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/settings";

const sans = Inter({ variable: "--font-sans-var", subsets: ["latin"] });
const serif = Fraunces({ variable: "--font-serif-var", subsets: ["latin"] });

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: { default: s.storeName, template: `%s | ${s.storeName}` }, description: s.tagline };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">{children}</body>
    </html>
  );
}
