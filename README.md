# A3 Premium Limousine Website

Included:
- Premium dark luxury layout
- Rates linked to https://finance.a3group.sg
- WhatsApp booking form
- WeChat copy button
- Telegram, Instagram and Facebook links
- Google Review section
- Mobile responsive design
- Turbopack workspace-root fix

## Edit contact details
Open `src/app/page.tsx` and update the `CONTACTS` object at the top.

## Copy into your project using CMD
```bat
cd /d C:\Users\Admin\Downloads\A3\projects\LIMOUSINE
xcopy /E /I /Y "EXTRACTED-FOLDER\src" "src"
copy /Y "EXTRACTED-FOLDER\next.config.ts" "next.config.ts"
npm install
rmdir /S /Q .next 2>nul
npm run dev
```

## Deploy
```bat
npm run build
vercel --prod
```
