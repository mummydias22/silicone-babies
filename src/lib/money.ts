// Client-safe (no db import). Prices are stored in minor units (value / 100), formatted in the store currency.
export const money = (cents: number, currency = "USD") => {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`; // unknown code: still show something sensible
  }
};
