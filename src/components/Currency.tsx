"use client";
import { createContext, useContext } from "react";
import { money } from "@/lib/money";

// The store currency is set in admin Settings; the site layout hands it to client components here.
const Ctx = createContext("USD");

export function CurrencyProvider({ currency, children }: { currency: string; children: React.ReactNode }) {
  return <Ctx.Provider value={currency}>{children}</Ctx.Provider>;
}

export function useMoney() {
  const currency = useContext(Ctx);
  return (cents: number) => money(cents, currency);
}
