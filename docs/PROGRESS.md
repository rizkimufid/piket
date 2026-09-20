# PROGRESS — Sistem Piket

> Penanda status: `🔲 Belum` · `🔨 Dikerjakan` · `✅ Selesai` · `⛔ Terblokir`
> **Aturan wajib:** setiap kali satu task selesai, update barisnya **di commit yang sama**.
> Baca `docs/PRD.md` dulu sebelum bekerja.

## Daftar Milestone

| ID | Milestone | Status | Catatan |
|---|---|---|---|
| M0 | Dokumentasi & penataan repo | ✅ | PRD + PROGRESS + AGENTS dibuat |
| M1 | Scaffold T3 + integrasi Preline | ✅ | build bersih; dev runtime nunggu DB |
| M2 | Prisma schema + migrasi + seed contoh | ✅ | `prisma migrate dev` sukses di Postgres Docker (`compose`); seed: superadmin dipakai sebagai anchor org, 6 anggota contoh (pajol, fajrial, aceng, fariel, latief, reyhan) sandi sementara `piket123` wajib ganti |
| M3 | Auth (login, bootstrap superadmin, daftarkan anggota) | ✅ | guard per-layout + cek DB `mustChangePassword`; uji manual nunggu DB |
| M4 | Algoritma `schedule` + test | ✅ | mulberry32+Fisher-Yates+periodIndex+rotasi; 10 test hijau |
| M5 | tRPC routers + proteksi role | ✅ | public/protected/org/admin + 6 router scopeByOrg |
| M6 | UI halaman (login/register/dashboard/kelola) | ✅ | tone gojek, modal, toast, tab, empty state, a11y dasar |
| M7 | QA (lint, typecheck, test, uji HP) | 🔨 | lint/typecheck/test/build hijau; uji browser nunggu DB |
| M8 | Deploy Vercel + koneksi Postgres VPS | ⛔ | butuh `DATABASE_URL` |
| M9 | Sektor berikutnya (ekstensi) | 🔲 | v2 |
| M10 | Dev stack Docker lokal (db saja) | ✅ | compose Postgres jalan; app jalan di mesin (`npm run dev`) |
| M11 | Manajemen kamar (Room) | ✅ | tabel Room + `/kamar` + dropdown anggota; migrasi/backfill/seed |

## Checklist per Milestone

### M0 — Dokumentasi & penataan repo
- [x] `docs/PRD.md` final (semua keputusan mengikat)
- [x] `docs/PROGRESS.md` live tracker
- [x] `AGENTS.md` petunjuk wajib baca dulu

### M1 — Scaffold T3 + integrasi Preline
- [x] create-t3-app (Next.js, TS, Tailwind, tRPC, Prisma, PostgreSQL, Auth.js)
- [x] `preline` + `@tailwindcss/forms` terpasang
- [x] `globals.css` (`@source`, `variants.css`, `@plugin`)
- [x] preline auto-init jalan di root layout (client module)
- [x] `next build` bersih tanpa error
- [x] PROGRESS di-update

### M2 — Prisma schema + migrasi + seed contoh
- [x] Schema PRD §6 diterapkan
- [x] `prisma migrate dev` berhasil (Postgres Docker, `piket/piket@db:5432/piket`)
- [x] Seed contoh: 6 anggota (pajol, fajrial, aceng, fariel, latief, reyhan) → org superadmin; sandi sementara `piket123` wajib ganti
- [x] Seed idempoten (upsert) — aman diulang
- [x] PROGRESS di-update

### M3 — Auth
- [x] `auth.ts` credentials + bcrypt + JWT session
- [x] `/register` (bootstrap superadmin) hanya saat DB kosong user
- [x] `/login` verifikasi
- [x] Paksa ganti sandi (`mustChangePassword`) → `/ubah-password` (cek DB, bukan JWT)
- [x] Superadmin: daftarkan anggota + sandi sementara (tampil sekali)
- [x] Superadmin: reset sandi
- [x] Guard login per-(app) layout + cek role per halaman (pengganti PROTECT middleware; tidak butuh matcher ekstra)
- [x] PROGRESS di-update

### M4 — Algoritma schedule + test
- [x] `seededShuffle` (mulberry32 + Fisher-Yates)
- [x] `periodIndex` (Senin-minggu, `TIMEZONE`)
- [x] `schedule()` map task→anggota + rotasi `(j+W) mod N`
- [x] Test vitest: deterministik, adil, tak berulang beruntun, edge case 0
- [x] `npm run test` hijau (10/10)

### M5 — tRPC routers + proteksi role
- [x] `publicProcedure`, `protectedProcedure`, `orgProcedure`, `adminProcedure` (pengganti requireAuth/withOrg/requireSuperadmin)
- [x] router: auth, user, org, member, task, schedule
- [x] Semua input zod, semua query scopeByOrg
- [x] Hook org aktif (cookie) jalan
- [x] `npm run typecheck` hijau
- [x] PROGRESS di-update

### M6 — UI halaman
- [x] Layout + navbar Preline (logo, pemilih org, avatar menu)
- [x] `/login`, `/register` (tone gojek)
- [x] `/ubah-password`
- [x] `/` dashboard: Minggu Ini + Minggu Depan
- [x] `/kelola`: tab Anggota & Task + modal + toast + Acak ulang
- [x] Empty states & konfirmasi hapus
- [x] Aksesibilitas dasar (label, kontras, focus, aria)
- [x] PROGRESS di-update

### M7 — QA
- [x] `npm run lint` hijau
- [x] `npm run typecheck` hijau
- [x] `npm run test` hijau (10/10)
- [x] `next build` hijau (6 route compile)
- [ ] Manual: buka di browser + HP, alur superadmin & anggota (nunggu DB)
- [ ] PROGRESS di-update

### M8 — Deploy Vercel + DB VPS
- [ ] Repo push + import Vercel
- [ ] Env: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `TIMEZONE`
- [ ] Build `prisma migrate deploy` ✓
- [ ] Firewall VPS allowlist IP Vercel + SSL
- [ ] Ujian end-to-end di domain
- [ ] PROGRESS di-update

### M9 — Sektor berikutnya (v2)
- [ ] TBA (contoh: patroli, jaga, kebersihan kantor) — isi saat masuk.

---

## Log Singkat

| Tanggal | Perubahan |
|---|---|
| 2026-09-20 | M0: dokumen dibuat; M4: algoritma+test done |
| 2026-09-20 | M1 scaffold, M3 auth (guard layout), M5 routers, M6 UI — code done, build hijau (M2 & M7-browser butuh DB); M4 test done |
| 2026-09-20 | M7 QA: lint + typecheck + test + build semua hijau (manual browser nunggu DB) |
| 2026-09-20 | Dev stack Docker: `compose.yaml` + `Dockerfile` + `.dockerignore` (Postgres + app, HMR polling; uji nunggu Docker Desktop) |
| 2026-09-21 | Docker dipangkas: frontend ditarik dari container (hapus `app` service, Dockerfile, .dockerignore, image `piket-app`), `compose.yaml` hanya Postgres; app jalan di mesin |
| 2026-09-20 | M2 tuntas di Docker: `migrate dev` + seed 6 anggota (pajol, fajrial, aceng, fariel, latief, reyhan) ke org superadmin — `@piket.local`, sandi sementara `piket123`, wajib ganti; M7 browser tinggal nunggu `DATABASE_URL` VPS |
| 2026-09-21 | UI polish: modal jadi bottom-sheet benar (fix `flex` Preline), semua emoji & karakter ikon ASCII (✓✕↑↓) diganti Tabler icons (IconBed/Brush/Dice/Home/Pencil/Trash/Key/ShieldLock/ChevronDown/Sun/Sunrise/Sunset/dll); tombol anggota compact di mobile (ikon-only, label `sm:`); reminder window pagi/siang/sore (banner CSR, tanpa cron) |
| 2026-09-21 | SSR halaman dihilangkan: layout `(app)`, `/login`, `/register`, `/ubah-password` jadi client component (guard pakai `useSession` + `useQuery me`); semua route jadi ○ Static, query DB/auth cuma via tRPC di server |
| 2026-09-21 | Manajemen kamar: `Membership.kamar` (string bebas) → tabel `Room` + relasi `roomId` (migrasi + backfill data lama); router `room` (list/create/updateName/remove), halaman `/kamar` (superadmin), navbar link, form anggota pakai dropdown kamar, seed kamar 2A/2B/3A/3B; hapus kamar → anggota terlepas (SetNull) |