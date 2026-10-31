# Ecommerce store template prompt

Paste this whole file as the first message of a new project. Fill in the **Project brief** block, then answer any questions before building. Everything else is the fixed spec, written from a working build.

---

## Project brief (edit per project)

- **Store name / niche:** `<e.g. Golf Store: golf clubs and gear>`
- **Inspiration site:** `<url>`
- **Brand feel & colors:** `<e.g. deep green + cream, serif headings>`
- **Currency:** `<USD>` (prices are stored in minor units)
- **Product categories to seed:** `<Drivers, Irons, Putters, Balls & Gear>`
- **Variant options for products:** `<Flex, Hand, Shaft>` (or "none")
- **Payment methods to seed:** `<Bank transfer, Cash on delivery>`
- **Checkout handoff channels:** `<email, WhatsApp, text message (SMS)>`
- **Features to drop from the list below:** `<none>`

## What to build

An ecommerce store where **no payment is taken on the site**. The customer picks a payment method (shown with its image) and sends the order to the admin by email or WhatsApp, depending on what the admin enabled. The admin then replies with payment details.

### Stack (fixed)
- **Next.js** App Router + TypeScript, **Tailwind**, **shadcn/ui**. Hosted on **Vercel**.
- **Neon Postgres** with **Drizzle ORM** (`drizzle-orm/neon-http`).
- **BetterAuth**, email + password, **admin only**. Sign-up disabled; the admin is created by a seed script. Shoppers use guest checkout.
- **Neon Object Storage** (S3-compatible) for all images.
- **Nodemailer over SMTP**, credentials entered in the admin dashboard.
- **GitHub** for versioning. Pushes to `main` deploy to Vercel.

### Admin dashboard (`/admin`)
Every item is editable from the dashboard. Nothing is hardcoded.
1. Products: create, edit, delete. Categories, variants (option, value, price change, stock), stock count, multiple images, published toggle.
2. Categories: create, delete.
3. Payment methods: add with an image, instructions, on/off toggle, delete.
4. Orders: list, detail, status (new, confirmed, paid, shipped, completed, cancelled), **printable receipt** page.
5. FAQs, testimonials (optional photo): create, edit, delete.
6. Blog: create, edit, delete, cover image, published toggle, and a **per-post layout** (classic, grid, magazine) that affects both the list and the post page.
7. Settings, in one page, with a **sticky Save bar that confirms "Settings saved."** (a save button lost at the bottom of a long page, with no feedback, makes admins think toggles saved when they didn't):
   - Store name, tagline, announcement banner, phone, public email.
   - Store address plus a map toggle (Google Maps embed, no API key).
   - WhatsApp number, floating button toggle, and a separate "order by WhatsApp" toggle.
     The number is entered with a **country picker** (about 10 countries: US, Canada, UK, plus the client's market, with dial codes) and a national-number box. Pasting a full number (`+237 677...`, `00237...`, or 11+ digits starting with a known code) auto-detects the country and strips the code; a leading local `0` is dropped. A hidden input stores digits only (country code + number), and a line under the field previews who customers will message.
   - Text message (SMS): its own number (same country-picker field) plus a "let customers order by text" toggle. Checkout opens the customer's messaging app with an `sms:+<digits>?&body=<order>` link; the confirmation page keeps a "Send text message" fallback button.
   - Live chat: a textarea for the provider's snippet plus an on/off toggle.
   - Discord webhook with a "send test" button.
   - SMTP (host, port, user, password, from) with a "send test email" button, notification recipients, and an "order by email" toggle.
8. Account: change login email and password, each requiring the current password.

### Storefront
Home (hero, category tiles, latest products, how ordering works, testimonials, blog teaser), shop with category filter, product page (gallery, option pickers, live price, stock state), cart (localStorage), checkout, order confirmation, blog list and post, FAQs, contact (map plus form), announcement banner, WhatsApp floating button, live chat injection. Footer shows store details.

**Header navigation is only: Home, Shop, About, Blog, FAQs, Contact.** Do not list categories in the header; the shop page has the category filter (the footer may link them).

**Mobile menu (storefront and admin):** on phones the links collapse into a hamburger button that opens a slide-in drawer from the right (dimmed backdrop, big tap targets, active page highlighted, close button, closes on link tap, backdrop tap or Escape, page scroll locked while open). On desktop the storefront shows the links inline in the header and the admin shows a left sidebar. Never a horizontally scrolling link row. Build one shared `MobileMenu` client component and render its drawer through a **portal** to `document.body`, because a sticky header with `backdrop-blur` traps `position: fixed` children. In the admin, the drawer also holds Sign out.

Page designs (match the inspiration images the client gives per project):
- **Cart:** a "Clear cart" button (with a confirm) whenever the cart holds anything. It must also show when every item is out of stock, where nothing is listed and only an error appears, so the customer is never stuck; the same button appears on checkout when items can't be ordered. Show "cart is empty" only when the cart is truly empty.
- **Product page:** thumbnail strip beside a large main image (click a thumbnail to swap), name, description, price, option pickers, then **two buttons: "Add to cart" and "Proceed to checkout"** (the second adds the item and goes straight to `/checkout`; after "Add to cart" a full-width "Continue shopping" button appears, linking to `/shop`; both stay disabled until every option is chosen), an availability/payment info list, and "More from this category".
- **Contact:** hero photo with the heading on the left and a white rounded form card on the right, info cards (address, phone, email, each a link), the map section **only when the map toggle is on and an address is set**, and an FAQ accordion.
- **About:** dark photo hero with a big title, a "Principles" statement with three icon cards, and a how-it-works photo row. Copy is static; no invented team members or claims.

### Checkout rules
- The cart in the browser holds only IDs and quantities. **The server recomputes prices, options and stock** from the database at checkout.
- Order number is random (`ORD-XXXXXXXX`). The confirmation page shows items, total and the chosen method's instructions, but not the customer's phone or address.
- After saving the order: post to Discord, email the admin recipients, and email the customer if they chose email. **Notification failures never fail the order.**
- Checkout form order: customer details, then payment method (enabled ones only, with logo; the selected method's instructions show right below), then a "send my order by" choice limited to the channels the admin enabled (always shown, as cards). The submit button names the channel ("Place order & send by email" / "& continue on WhatsApp"). If no method or no channel is enabled, show "checkout isn't available".
- WhatsApp handoff: **open WhatsApp directly.** In the submit click handler, synchronously `window.open("", "_blank")` (so popup blockers allow it), then once the server action returns the `wa.me` URL with the pre-filled order text, set that tab's location. The shop tab goes on to the confirmation page. If the popup was blocked, the confirmation page still shows a "Send on WhatsApp" button as a fallback. Close the blank tab if the order fails.
- Stock decrements on order.

### Settings storage
One `settings` table of key/value rows. Defaults live in one `DEFAULTS` object, so adding a setting means adding one key. **Store values wrapped as `{ "v": value }`** (see gotchas). Save the whole settings form in one batched upsert.

## UI rules (my preferences)

- **Use toggle switches, never checkboxes, for any on/off setting.** That covers every enable/disable and show/hide option, "published", and the checkout channel options. A shared `FormSwitch` component (label plus switch, submits `on` when enabled) is used in forms. Lists with a live on/off, such as payment methods, use an **instant-save switch** with an optimistic update and rollback on failure, not an On/Off button that has to be clicked and saved. Checkboxes are acceptable only for "mark for deletion" actions such as "remove this image".
- **Any choice between visual layouts or styles must be shown as a picture, never just a name.** For the blog layout picker, each option is a selectable card with a small wireframe thumbnail of how it looks **in the list** and **on the post page**, plus the name and a one-line description. Draw the thumbnails as inline SVG (no image files to host or break). Build it as radio inputs (`sr-only` with `peer`) so it needs no JavaScript, stays keyboard accessible, and shows a clear selected ring. Apply the same rule to any future "choose a layout/theme/style" setting.
- Admin forms are plain server-action forms. Keep the admin simple and fast to use on a phone.
- Responsive at phone width, visible focus states, labelled inputs, semantic buttons and links.
- Design from the inspiration site and brand feel. Use real free photos (Unsplash) via plain `<img>`. **Verify every image URL returns 200 before using it.**
- Seed demo data (products, FAQs, testimonials, a blog post, payment methods) so the site is never empty. The admin can delete it.

## Gotchas learned the hard way (follow these)

1. **shadcn `Button` is Base UI and defaults to `type="button"`, so form submits silently do nothing.** Set `type="submit"` as the default in `components/ui/button.tsx`. There is also no `asChild`: for link-styled buttons use `<Link className={buttonVariants()}>`.
2. **Drizzle `neon-http` re-`JSON.parse`s jsonb string values on read**, so `"15551234567"` comes back as a number and `.replace` crashes the layout. Always store jsonb as an object (`{v: ...}`) and read `.v`.
3. **Next.js 16 renamed `middleware` to `proxy`** (`src/proxy.ts`, export `proxy`). Read `node_modules/next/dist/docs` before assuming old APIs. Turn off `cacheComponents` for DB-driven pages. `params` and `searchParams` are Promises.
4. **BetterAuth over https names its cookie `__Secure-better-auth.session_token`.** The proxy guard must accept both names, or login loops. Real authorization is still checked in `requireAdmin()` on every admin page and server action, not only in the proxy.
5. Set `BETTER_AUTH_URL` to the production URL, or sign-in fails with `INVALID_ORIGIN`.
6. **Don't use `revokeOtherSessions: true` in `changePassword`**: it logs the admin out.
7. Server action files (`"use server"`) may only export `async function`s. Define actions with `async function`, not `export const x = bind(...)`.
8. Neon Object Storage: `S3Client({ forcePathStyle: true })`, endpoint, keys and region from the `AWS_*` env vars, and the bucket must exist (create it with `CreateBucketCommand`). There is no permanent public URL, so **serve images through an app route** (`/api/img/[...key]`) that streams from the bucket with immutable cache headers, and store those app URLs in the database.
9. Server action body limit defaults to 1 MB: raise `experimental.serverActions.bodySizeLimit`. Vercel caps request bodies at 4.5 MB.
10. **Vercel blocks git-triggered deployments whose commit author it can't match to the team member.** Commit as the GitHub account (`<id>+<login>@users.noreply.github.com`), not a placeholder like `dev@localhost`.
11. `neon-http` has no transactions. Order creation is a few sequential writes; accept the small risk and leave a comment saying so.
12. Create the Next app in a folder with a valid lowercase npm name, then move it, if the target directory name has capitals or spaces.
13. Git Bash rewrites arguments that start with `/` (it treats them as paths). Use full URLs when testing with curl.
14. **Flex/grid children with images overflow their column** (a big photo spills over the text beside it). Use `grid-cols-[minmax(0,1fr)_minmax(0,1fr)]` and `min-w-0` on the gallery and image, and check product pages at 1920, 1280 and 390 px wide.

## How to work

- Plan first, ask me questions about anything unclear, then build in this order: scaffold, schema and auth, admin core (settings, payment methods, products, upload), storefront and checkout, remaining admin pages, deploy.
- **Test in a real browser** (Playwright), not just with curl: log in, create content, toggle every switch, place an order through every channel, print a receipt, change the password and change it back. Clean up only the test rows you created, filtered by a marker, never with an unfiltered delete.
- Verify `tsc --noEmit` and `npm run build` pass before every push.
- Keep it lean: no abstractions without a second user, no speculative features. Mark deliberate shortcuts with a `ponytail:` comment naming the ceiling.
- Secrets go in `.env` (gitignored) and Vercel env vars only. Never echo them in replies or commit them. Tell me to rotate any credential I paste into chat once the project is done.

## Environment variables

`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (seed only), `AWS_ENDPOINT_URL_S3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET`.

## Definition of done

- Every admin feature above works and is reflected on the storefront.
- A real order goes through each enabled channel.
- Deployed on Vercel with env vars set, admin login works on the live URL, and the default admin password has been changed.
