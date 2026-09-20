# Changelog

Semua perubahan penting dicatat di sini. Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/ID/1.1.0/).

Versi mengikuti `tanggal` (belum semantik versioning). Status live ada di `docs/PROGRESS.md`.

## [2026-09-21] — Manajemen kamar + polish UI + SSR→CSR + pangkas dev stack

### Ditambahkan
- **Room sebagai entitas** (`prisma/schema.prisma`): tabel `Room` relasi ke `Membership.roomId` (`onDelete: SetNull`), unik per `(orgId, name)`.
- Migrasi `20260920202621_rooms` dengan backfill: `Membership.kamar` (string bebas) dipindah ke relasi Room per org.
- Router tRPC `room`: `list` (jumlah anggota per kamar), `create`, `updateName`, `remove` (hapus kamar → anggota terlepas, anggota tetap ada).
- Halaman `/kamar` (superadmin): tambah, ubah nama, hapus kamar; jumlah anggota per kamar.
- Link "Kamar" di navbar + shortcut ikon.
- Dropdown kamar pada form tambah/edit anggota (PRD F-MEM-2 & F-ROOM-1).
- Seed kamar `2A/2B/3A/3B` + penautan 6 anggota seed.
- `docs/CHANGELOG.md`.
- `@tabler/icons-react` dependency.

### Diubah
- **UI polish**: semua emoji & karakter ikon ASCII (⚠✓✕↑↓, dsb.) diganti Tabler icons; modal jadi bottom-sheet benar (fix `flex` Preline); tombol anggota compact di mobile (ikon-only, label `sm:`); reminder window pagi/siang/sore (banner CSR, tanpa cron).
- **Tema Preline**: token tema via `src/styles/themes/piket.css` + `data-theme="theme-piket"` + `font-custom-default`; `--color-brand-*`/`--color-surface` manual diganti setelan tema (bg-card/border/foreground/muted/dll).
- **SSR → CSR**: layout `(app)` dan halaman `/login`, `/register`, `/ubah-password` jadi client component; guard pakai `useSession` + `useQuery me` menggantikan read DB di server. Semua route jadi ○ Static, query DB/auth hanya via tRPC di server.
- **Dev stack dipangkas**: `compose.yaml` kini hanya Postgres; service `app` + `Dockerfile` + `.dockerignore` dihapus, app jalan di mesin (`npm run dev`).
- `auth/config.ts`: `AUTH_SECRET` eksplisit dari env (bukan default dev Auth.js).
- Router `member.list`/`schedule` kini sertakan nama kamar via relasi `Room`.

### Diperbaiki
- Validasi `roomId` di router `auth.addMember` & `member.update` (kamar harus milik org aktif, selain itu tolak).
- tRPC error log tanpa emoji di production path.

### Dilakukan
- `docs/PRD.md`: skema `Room`, API router `room`, halaman `/kamar`, alur daftar anggota pakai dropdown.
- `docs/PROGRESS.md`: M10 (db saja) & M11 selesai + log singkat.