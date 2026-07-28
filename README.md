# A3 Limousine — Complete Fix

- Dedicated `/book` page based on the dark premium website design.
- Booking submissions proxy to `https://finance.a3group.sg/api/public/limousine` and create a Pending booking reference.
- Rates load from `https://finance.a3group.sg/api/public/rate-matrix` through the local `/api/limousine` proxy.
- Google Review is an external Google link only. No local review page or form.
- Clean source package: no `node_modules`, `.next`, `.vercel`, `.env.local`, or build cache.

## Deploy

```cmd
npm install
npm run build
git add .
git commit -m "Fix limousine booking, finance rates and Google review"
git pull --rebase origin main
git push origin main
vercel --prod
```

Required Vercel variables are listed in `.env.example`.
