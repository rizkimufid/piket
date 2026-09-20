# PIKET

Aplikasi web jadwal piket (v1: kontrakan, bersih-bersih) — acak tapi adil & tetap.

## ⚠️ WAJIB BACA DULU (sebelum menyentuh kode apa pun)

1. `docs/PRD.md` — spesifikasi produk, keputusan yang mengikat, skema, algoritma, API.
2. `docs/PROGRESS.md` — status pengerjaan. **Update baris status di commit yang sama** setiap task selesai.

Keduanya ada di satu folder `docs/` supaya nggak ketuker sumber kebenaran.

## Stack

Next.js (App Router) · TypeScript · tRPC · Prisma (PostgreSQL di VPS owner) · Tailwind v4 · Preline UI · Auth.js (Credentials + bcrypt). Deploy: Vercel.

## Perintah

```bash
npm run dev        # dev server :3000
npm run test       # vitest (schedule.ts)
npm run lint       # eslint
npx tsc --noEmit   # typecheck
npx prisma migrate dev     # dev, butuh DATABASE_URL
npx prisma migrate deploy  # dipakai pada build Vercel
```

## Aturan kerja

- UI Bahasa Indonesia, nada santai ala Gojek (lihat PRD §9.1).
- Semua data query tRPC wajib `scopeByOrg` (jangan cuma andalkan route).
- Boleh tambah folder/file, tapi **jangan edit PRD/PROGRESS tanpa memutakhirkannya**.
- Menambah tugas besar → cek PROGRESS, kalau belum ada milestone-nya, tanyakan dulu.