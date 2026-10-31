"use client";
import { useState } from "react";

const COUNTRIES = [
  { n: "United States", c: "1" }, { n: "Canada", c: "1" }, { n: "United Kingdom", c: "44" },
  { n: "Cameroon", c: "237" }, { n: "Nigeria", c: "234" }, { n: "Ghana", c: "233" },
  { n: "Kenya", c: "254" }, { n: "South Africa", c: "27" }, { n: "India", c: "91" }, { n: "Australia", c: "61" },
];
const CODES = [...new Set(COUNTRIES.map((c) => c.c))].sort((a, b) => b.length - a.length);

// Split stored digits (country code + number) into country index + national number.
function split(digits: string): [number, string] {
  const code = CODES.find((c) => digits.startsWith(c) && digits.length > c.length + 6);
  if (!code) return [0, digits];
  return [COUNTRIES.findIndex((c) => c.c === code), digits.slice(code.length)];
}

// Hidden input stores digits only; pasting a full number auto-detects the country.
export default function PhoneField({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  const [init, nat0] = split(defaultValue.replace(/\D/g, ""));
  const [ci, setCi] = useState(init);
  const [nat, setNat] = useState(nat0);

  function onNational(raw: string) {
    let d = raw.replace(/\D/g, "");
    const intl = raw.trim().startsWith("+") || d.startsWith("00") || d.length >= 11;
    if (intl) {
      d = d.replace(/^00/, "");
      const code = CODES.find((c) => d.startsWith(c));
      if (code) {
        // keep the chosen country when its code matches, else switch to the first country with that code
        if (COUNTRIES[ci].c !== code) setCi(COUNTRIES.findIndex((c) => c.c === code));
        d = d.slice(code.length);
      }
    }
    setNat(d.replace(/^0+/, ""));
  }

  const full = nat ? COUNTRIES[ci].c + nat : "";
  return (
    <div>
      <label className="label" htmlFor={`${name}-nat`}>{label}</label>
      <div className="flex gap-2">
        <select aria-label={`${label} country`} value={ci} onChange={(e) => setCi(Number(e.target.value))} className="input w-40 shrink-0">
          {COUNTRIES.map((c, i) => <option key={c.n} value={i}>{c.n} (+{c.c})</option>)}
        </select>
        <input id={`${name}-nat`} type="tel" inputMode="tel" value={nat} onChange={(e) => onNational(e.target.value)} className="input" placeholder="Number" />
      </div>
      <input type="hidden" name={name} value={full} />
      <p className="mt-1 text-xs text-stone-500">{full ? `Customers will message +${full}` : "Not set"}</p>
    </div>
  );
}
