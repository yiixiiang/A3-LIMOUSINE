<<<<<<< HEAD
# AEJKY Limousine — A3 Finance Connected Website

Production domain: `https://limousine.a3group.sg`

A3 Finance: `https://finance.a3group.sg`

## What is connected

- The public website loads live AEJKY vehicle types and rate cards from A3 Finance.
- Quotation submissions are sent to the A3 Finance public limousine API.
- A successful submission returns an AEJKY reference number such as `AEJ-20260723-00001`.
- Staff links open the A3 Finance login page.
- WhatsApp remains available if A3 Finance is temporarily unavailable.
- The website proxy hides internal A3 Finance errors from customers.
- A honeypot and minimum-form-time check reduce basic automated spam.

## Required A3 Finance setup

The A3 Finance deployment must include:

- `src/app/api/public/limousine/route.ts`
- Supabase migration `022_public_limousine_website.sql`
- An active company containing `AEJKY` with company type `limousine`
- Active limousine vehicle types and rate cards

Run migration 022 in Supabase before accepting public quotations.

## Vercel deployment

1. Create a new Vercel project from this folder.
2. Add environment variables from `.env.example`.
3. Attach only `limousine.a3group.sg` to this project.
4. Do not attach `a3group.sg`, `www.a3group.sg`, `finance.a3group.sg`, or `sakura.a3group.sg`.
5. In Cloudflare DNS, create a CNAME for `limousine` pointing to Vercel's assigned target. Use DNS-only while verifying, then enable the proxy only if required.

## Local checks

```bash
npm install
npm run typecheck
npm run build
```
=======
"# a3group-homepage" 
"# a3group-homepage" 
"# sakura-entertainment" 
"# aejky-limousine" 
>>>>>>> 7176270957e1486e9dac0df7b740aaa0fc8e99ce
