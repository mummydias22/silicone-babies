// Client-safe: settings.ts imports the db, so client components must not import money from it.
export const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
