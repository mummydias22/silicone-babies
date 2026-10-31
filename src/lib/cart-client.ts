"use client";
import { useEffect, useState } from "react";
import type { CartItem } from "./shop";

const KEY = "sb-cart";
export const readCart = (): CartItem[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
};
export const writeCart = (items: CartItem[]) => {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  window.dispatchEvent(new Event("cart-change"));
};
export const addToCart = (item: CartItem) => {
  const c = readCart();
  const same = c.find((x) => x.productId === item.productId && JSON.stringify(x.options) === JSON.stringify(item.options));
  if (same) same.qty += item.qty; else c.push(item);
  writeCart(c);
};
export function useCart() {
  const [items, setItems] = useState<CartItem[] | null>(null);
  useEffect(() => {
    const sync = () => setItems(readCart());
    sync();
    window.addEventListener("cart-change", sync);
    return () => window.removeEventListener("cart-change", sync);
  }, []);
  return items; // null until hydrated
}
