# PRD — Sistem Piket (v1: Piket Kontrakan)

**Status dokumen:** Final untuk v1 · **Tanggal:** 2026-09-20 · **Penulis:** owner + agent

> Dokumen ini adalah sumber kebenaran (source of truth). Semua keputusan mengikat.
> Progress pengerjaan ada di `docs/PROGRESS.md` — baca juga.

---

## 1. Ringkasan Produk

Aplikasi web untuk mengatur **jadwal piket (bersih-bersih) di sebuah kontrakan** secara
**acak tapi adil dan tetap**. Anggota tinggal buka halaman → tahu hari ini/minggu ini
siapa yang nyekup tugas apa. Admin (superadmin) yang mengatur anggotanya.

Produk dirancang **multi-sektor**: mesin jadwal dan struktur data org-nya generik,
sehingga nanti bisa dipakai untuk sektor lain (mis. patroli keamanan, kebersihan kantor,
giliran jaga toko) tanpa menulis ulang inti aplikasi. v1 hanya menerapkan sektor
"kontrakan".

### 1.1 Kenapa "acak tapi tetap"
- **Tetap (deterministik):** dengan seed + minggu ke-n yang sama, hasil jadwal selalu sama.
  Tidak ada hasil yang berubah-ubah tiap kali halaman di-refresh atau server restart.
- **Acak:** seed diganti lewat tombol "Acak ulang" → urutan berubah total.
- **Adil:** semua anggota kebagian tugas yang seimbang; tidak ada yang terus-terusan
  dapat tugas "berat" yang sama.

---

## 2. Tujuan & Non-Tujuan

### 2.1 Tujuan (v1 — pasti)
| ID | Tujuan |
|---|---|
| T1 | Kelola anggota kontrakan (daftar, navigasi kamar, aktif/nonaktif). |
| T2 | Kelola daftar tugas piket (tambah, hapus, urutkan prioritas). |
| T3 | Tampilkan jadwal minggu ini + preview minggu depan (siapa → tugas apa). |
| T4 | Pengacakan deterministik yang adil (algoritma `schedule`), bisa "Acak ulang". |
| T5 | Hanya **superadmin** yang bisa mengubah data; anggota cukup melihat. |
| T6 | Login semua user (aplikasi privat; butuh autentikasi untuk akses apa pun). |
| T7 | UI Bahasa Indonesia santai ala Gojek, mobile-first (dibuka via HP). |
| T8 | Pondasi multi-org + mesin jadwal generik agar siap sektor lain. |

### 2.2 Non-Tujuan (v1 — sengaja ditunda)
| Tidak dikerjakan di v1 | Waktu rencana |
|---|---|
| Notifikasi WhatsApp / email otomatis | v2 |
| Penanda "tugas sudah dikerjakan" (riwayat/selesaikan) | v2 |
| Undangan mandiri / anggota self-register | v2 (v1: superadmin yang daftarkan) |
| Billing, quota, limit jumlah org | v2+ |
| Audit log lengkap | v2+ |
| Rate-limit login terdistribusi (Upstash) | v2+ (v1: kasih jeda antar gagal) |

---

## 3. Persona & Use Case

### 3.1 Persona
| Persona | Deskripsi | Hak |
|---|---|---|
| **Superadmin** | Pemilik/ketua kontrakan yang mengatur semuanya. | Semua aksi tulis: kelola anggota, task, acak ulang, reset sandi. |
| **Anggota** | Penghuni kontrakan. | Login, lihat jadwal & tugas di org-nya. |

> Catatan: user pertama yang register otomatis menjadi **Superadmin** org pertama.
> User berikutnya **hanya bisa dibuat oleh superadmin** (bukan register sendiri).

### 3.2 Alur utama
1. **Bootstrapping**: user pertama membuka `/register` → buat akun (email + sandi + nama
   + nama org). Sistem membuat `Org` + `Membership(SUPERADMIN)`.
2. **Daftarkan anggota**: superadmin di menu Kelola → "Tambah Anggota" → isi nama, email,
   kamar (dropdown dari daftar kamar) → sistem generate **sandi sementara** → tampilkan sekali
   supaya diteruskan ke anggota (WhatsApp/diucapkan langsung).
3. **Login anggota**: email + sandi sementara → sistem paksa ganti sandi di
   `/ubah-password` sebelum masuk.
4. **Lihat jadwal**: semua user melihat dashboard "Minggu Ini" + "Minggu Depan".
5. **Atur jadwal**: superadmin bisa "Acak ulang" (ganti seed) kapan pun.

---

## 4. Fitur Fungsional (prioritas MoSCoW)

### Must (wajib v1)
| Kode | Fitur | Detail |
|---|---|---|
| F-AUTH-1 | Register superadmin pertama | `/register` hanya tampil bila belum ada user. |
| F-AUTH-2 | Login | Auth.js Credentials + bcrypt. |
| F-AUTH-3 | Ganti sandi wajib | User dengan `mustChangePassword` dipaksa ganti sebelum akses. |
| F-AUTH-4 | Superadmin buat anggota | Nama + email + kamar → sandi sementara (diperlihatkan sekali). |
| F-AUTH-5 | Reset sandi | Superadmin bisa reset sandi anggota. |
| F-ORG-1 | Multi-org scoping | Semua data (task, anggota, setting) hanya terlihat di org aktif. |
| F-ORG-2 | Pemilih org | Dropdown ganti org aktif (untuk user yang di >1 org). |
| F-MEM-1 | Daftar anggota | Nama, kamar, status. |
| F-MEM-2 | Edit anggota | Ubah nama / kamar (dropdown). |
| F-MEM-3 | Hapus/nonaktifkan anggota | Anggota keluar dari rotasi. |
| F-ROOM-1 | Manajemen kamar | Tambah/rename/hapus kamar; anggota pilih dari daftar. |
| F-TSK-1 | Daftar task | Urutan display dikontrol superadmin (drag/drop atau tombol naik/turun). |
| F-TSK-2 | Tambah/hapus task | Nama task (Menyapu, Ngepel, Kamar Mandi, Dapur, Sampah...). |
| F-JAD-1 | Dashboard minggu ini | Siapa → tugas apa, semua anggota. |
| F-JAD-2 | Preview minggu depan | Siapa → tugas apa pada minggu berikutnya. |
| F-JAD-3 | Acak ulang | Memulai seed baru (konfirmasi dulu). |
| F-JAD-4 | Beri label sektor | Org punya nama (mis. "Kontrakan Pak RT"); opsional per-org `rotation`. |

### Should (v1 jika waktu)
- F-UI-1 Konfirmasi hapus anggota/task (modal).
- F-UI-2 Empty state ramah ("Belum ada penghuni", "Belum ada tugas piket").
- F-UI-3 Navigasi tanggal (minggu sebelumnya / selanjutnya) read-only.

### Could / Won't (v1)
- Notifikasi, riwayat penyelesaian, multi-periode dalam 1 hari → v2.

---

## 5. Alur Autentikasi (detail)

```
[Superadmin pertama]
  /register (email, sandi, nama, nama org)
   → User+Org+Membership(SUPERADMIN) dibuat
   → sandi di-hash bcrypt(10)

[Login]
  /login (email, sandi)
   → verifikasi bcrypt via CredentialsProvider
   → session JWT (Auth.js, cookie httpOnly)
   → jika mustChangePassword → redirect /ubah-password

[Superadmin menambah anggota]
  Kelola → Tambah Anggota (nama, email, kamar)
   → cek email belum terdaftar
   → hash sandi sementara random (8 karakter)
   → User created + Membership(org, role MEMBER, roomId)
   → tampilkan sandi sementara SEKALI (toast/modal) untuk diteruskan

[Reset sandi]
  Kelola → Reset Sandi (anggota)
   → sandi sementara baru + mustChangePassword=true
```

- Superadmin TIDAK mengisi sandi manual; sistem yang generate (lebih aman & cepat).
- Tidak ada verifikasi email di v1 (lapor risiko).
- Sesinya JWT; di serverless, memang begini cara Auth.js yang umum.
- Semua procedure tRPC bermutasi → `requireSuperadmin`. Baca → `requireAuth`.

---

## 6. Skema Database (Prisma ⟶ PostgreSQL)

```prisma
enum Role {
  SUPERADMIN
  MEMBER
}

model User {
  id                 String   @id @default(cuid())
  email              String   @unique
  name               String
  passwordHash       String
  mustChangePassword Boolean  @default(false)
  memberships        Membership[]
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}

model Org {
  id        String         @id @default(cuid())
  name      String
  members   Membership[]
  rooms     Room[]
  tasks     Task[]
  setting   OrgSetting?
  createdAt DateTime       @default(now())
}

model Room {
  id        String       @id @default(cuid())
  orgId     String
  org       Org          @relation(fields: [orgId], references: [id], onDelete: Cascade)
  name      String
  members   Membership[]
  createdAt DateTime     @default(now())

  @@unique([orgId, name])
  @@index([orgId])
}

model Membership {
  id         String   @id @default(cuid())
  role       Role     @default(MEMBER)
  roomId     String?
  room       Room?    @relation(fields: [roomId], references: [id], onDelete: SetNull)
  isActive   Boolean  @default(true) // ibu rotasi di-skip
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId     String
  org        Org      @relation(fields: [orgId], references: [id], onDelete: Cascade)
  orgId      String
  createdAt  DateTime @default(now())

  @@unique([userId, orgId])
  @@index([orgId])
}

model Task {
  id       String @id @default(cuid())
  orgId    String
  org      Org    @relation(fields: [orgId], references: [id], onDelete: Cascade)
  name     String
  position Int    @default(0)
  @@index([orgId, position])
}

model OrgSetting {
  orgId    String @id
  org      Org    @relation(fields: [orgId], references: [id], onDelete: Cascade)
  seed     Int    @default(0)
  rotation String @default("weekly") // v1: "weekly". Cadangan: "daily"
}
```

Catatan desain:
- **`isActive`** di Membership = penghuni masih nginap; yang non-aktif tidak ikut rotasi.
- **Kamar = entitas `Room`** (bukan string bebas): daftar kamar dikelola organik di `/kamar`,
  anggota memilih dari daftar itu. Hapus kamar → `roomId` anggota jadi `null` (anggota tetap
  ada). Rename kamar otomatis ter-update di semua tampilan.
- Tidak ada tabel jadwal — jadwal **dihitung** (lihat §8). Tidak ada duplikasi/penyimpangan.
- Superadmin = `Membership.role = SUPERADMIN` di sebuah org. Global superadmin dihapus;
  skalabilitas role per-org.
- Migrasi: `prisma migrate dev` saat development, `prisma migrate deploy` di build Vercel.

---

## 7. Algoritma Jadwal ("acak tapi tetap")

### 7.1 Definisi
```
BASE_ORDER  = seededShuffle(members aktif diurutkan createdAtAsc, seed)
W           = angka minggu berjalan (0-based, dihitung dari epoch Senin)
N           = jumlah anggota aktif

untuk task ke-j (0..):  anggota = BASE_ORDER[(j + W) mod N]
```

- **`seededShuffle`** = Fisher-Yates + PRNG `mulberry32(seed)`.
- **`W`** = `floor((seninPekanIni - epochSenin) / 7hari)`, dihitung di zona waktu org
  (default `Asia/Jakarta`). Tidak butuh penyimpanan — stabil selama minggunya sama.
- Hasil: map `taskId → memberId` + sebaliknya untuk UI.

### 7.2 Contoh numerik
Anggota (setelah shuffle, seed tertentu): `[Rizki, Andi, Budi, Citra]` → index 0..3.
Task: `[Menyapu, Ngepel, Kamar mandi, Dapur]` (index 0..3).

| Minggu (W) | Menyapu | Ngepel | Kamar mandi | Dapur |
|---|---|---|---|---|
| 0 | Rizki | Andi | Budi | Citra |
| 1 | Andi | Budi | Citra | Rizki |
| 2 | Budi | Citra | Rizki | Andi |
| 3 | Citra | Rizki | Andi | Budi |
| 4 | Rizki | Andi | Budi | Citra |

Sifat yang dijamin:
- **Deterministik**: seed + W sama → hasil sama (uji test).
- **Tidak berulang beruntun**: seseorang baru dapat tugas yang sama lagi minimal
  setelah `N` minggu.
- **Adil**: dalam `N` minggu, setiap anggota menjalani setiap tugas tepat 1×.

### 7.3 Edge cases
| Kondisi | Penanganan |
|---|---|
| Tidak ada anggota aktif | Dashboard tampil empty state. |
| Task > anggota | Beberapa anggota pegang >1 task, bergilir merata (index tetap). |
| Task < anggota | Beberapa anggota libur, bergilir via `+W` (adil antar minggu). |
| Tidak ada task | Empty state + ajakan superadmin nambah task. |
| Anggota ditambah/dihapus | `BASE_ORDER` dihitung ulang (otomatis); "Acak ulang" jika mau beda. |
| Anggota non-aktif | Di-skip dari BASE_ORDER dan rotasi. |
| Zona waktu / lintas tahun | `W` dihitung dari epoch Senin → aman melewati pergantian tahun. |

---

## 8. API (tRPC)

Konvensi: `requireAuth` (harus login) → `withOrg` (scope ke org aktif) →
`requireSuperadmin` (hanya yang role SUPERADMIN di org tsb). Semua input divalidasi zod.

| Router | Procedure | Role | Keterangan |
|---|---|---|---|
| `auth` | `register` | publik* | Hanya jalan jika belum ada user (bootstrap superadmin). |
| `auth` | `changePassword` | auth | Anggota ganti sandi (dipakai saat wajib ganti). |
| `auth` | `createMember` | superadmin | Buat akun anggota → sandi sementara. |
| `auth` | `resetPassword` | superadmin | Reset sandi anggota. |
| `user` | `me` | auth | Profil + memberships + org aktif. |
| `org` | `setActive` | auth | Ganti org aktif (cookie). |
| `org` | `regenerateSeed` | superadmin | "Acak ulang". |
| `org` | `updateName` | superadmin | Ganti nama org. |
| member | `list` | auth | Anggota org aktif (+status aktif, kamar). |
| member | `update` | superadmin | Nama / roomId / isActive. |
| room | `list` | auth | Kamar org aktif (+jumlah anggota). |
| room | `create` | superadmin | Tambah kamar (unik per org). |
| room | `updateName` | superadmin | Ubah nama kamar (unik per org). |
| room | `remove` | superadmin | Hapus kamar → anggota terlepas (set null). |
| task | `list` | auth | Task org aktif, diurut `position`. |
| task | `create` | superadmin | Tambah task. |
| task | `update` | superadmin | Ubah nama / pindah posisi. |
| task | `remove` | superadmin | Hapus task. |
| `schedule` | `current` | auth | Minggu ini + minggu depan + info tanggal. |
| `schedule` | `byWeek` | auth | (Should) minggu tertentu, read-only. |

\* Publik hanya `/login` dan `/register` (hanya saat kosong); semua halaman lain butuh login.

---

## 9. UI/UX (Preline UI, tone gojek)

### 9.1 Tone bahasa (penting)
Bahasa **Indonesia santai**, gaya brand Gojek: dekat, ringan, sedikit humor, tidak formal.
| Formal ❌ | Gojek ✅ |
|---|---|
| "Anda belum memiliki akun" | "Belum punya akun? Gas daftar" |
| "Silakan masukkan kata sandi" | "Ketik sandi kamu" |
| "Data anggota berhasil ditambahkan" | "Mantul! Anggota masuk" |
| "Tidak ada data" | "Masih kosong nih, ayo isi dulu" |
| Tombol submit | "Simpan, gas!" / "Tambahkan" |

### 9.2 Visual
- Warna primer: **hijau gojek** `#00AA13` (celup tipis, putih, abu netral).
- Font sans, mobile-first (target layar HP kontrakan), tombol besar ≥44px.
- Interaktif pake `preline` auto-init: dropdown (org/user), modal (tambah/edit/hapus,
  acak ulang, sandi sementara), toast (hasil aksi), badge role, tabel responsif.

### 9.3 Peta halaman
| Rute | Isi | Akses |
|---|---|---|
| `/login` | Form email+sandi, tautan ke register (bila kosong) | publik |
| `/register` | Bootstrap superadmin (nama, email, sandi, nama org) | publik (kosong) |
| `/` | Dashboard: sapaan, "Minggu Ini", "Minggu Depan", dropdown org + menu user | auth |
| `/ubah-password` | Form sandi baru (dipakai saat wajib ganti) | auth |
| `/kamar` | Manajemen kamar: tambah, ubah nama, hapus (jumlah anggota per kamar) | superadmin |
| `/kelola` | Tab "Anggota" & "Task", tombol Acak ulang | superadmin |

- Layout: navbar atas khas Preline (logo, pemilih org, avatar menu keluar).
- Dashboard: kartu per task "Siapa nyekup apa", badge nama anggota.

---

## 10. Kebutuhan Non-Fungsional

| Area | Keputusan |
|---|---|
| Performa | Query kecil semua; index `@@index([orgId])`. Rencana pooling PgBouncer **saat** koneksi serverless `too many connections` (bukan sekarang). |
| Keamanan | bcrypt(10); cookie httpOnly; semua input zod; data selalu 1. scopeByOrg (cek kembar, bukan hanya andalkan URL). Jangan pernah leak `passwordHash`. Reset/init sandi tampil sekali saja. |
| Privasi | Tak ada PII selain nama/email/kamar (minimal). |
| Skalabilitas | Multi-org sekarang; mesin jadwal generik (`rotation` field cadangan); role per-org. |
| Aksesibilitas | Preline bawaan aria; label form jelas; kontras dijamin; bisa dipakai keyboard. |
| Timezone | Default `Asia/Jakarta`; definisi "minggu" = Senin 00:00 WIB. |
| Ketersediaan | App di Vercel (free/preview); DB di VPS user. Tidak ada SLA formal. |

---

## 11. Testing

| Jenis | Lingkup | Lokasi |
|---|---|---|
| Unit (vitest) | `schedule.ts`: deterministik, semua task keisi, distribusi rata (±1), tidak berulang beruntun, crash-proof (0 anggota / 0 task) | `src/server/schedule.test.ts` |
| Typecheck | `tsc` | seluruh repo |
| Lint | `eslint` | seluruh repo |
| Manual | checklist §12 | —

### 11.1 Checklist unit `schedule`
- [ ] Seed + W sama → output sama (deterministik).
- [ ] Dalam rentang `N` minggu, tiap anggota dapat tiap task tepat 1×.
- [ ] Tidak ada task tanpa penanggung (saat ada anggota).
- [ ] Anggota non-aktif tidak muncul.
- [ ] 0 task / 0 anggota → hasil kosong tanpa error.

---

## 12. Deployment

- **Hosting app:** Vercel (build: `prisma migrate deploy` → `next build`).
- **Database:** PostgreSQL self-hosted di **VPS milik owner** (hanya DB).
- Env var (local `.env` ↔ Vercel):
  | Var | Untuk |
  |---|---|
  | `DATABASE_URL` | koneksi Prisma ke Postgres VPS |
  | `AUTH_SECRET` | session Auth.js (`npx auth secret`) |
  | `NEXTAUTH_URL` / `AUTH_URL` | domain (dev `http://localhost:3000`, prod domain Vercel) |
  | `TIMEZONE` | default `Asia/Jakarta` |

- **Security DB:** wajib SSL + strong password; firewall jangan buka `5432` ke internet
  bebas. Disarankan: allowlist IP Vercel + IP dev owner, atau SSH tunnel saat dev.

---

## 13. Roadmap & Milestones

Status dipelihara live di `docs/PROGRESS.md`. Ringkasan:

| ID | Milestone | Rilis |
|---|---|---|
| M0 | Dokumentasi & penataan repo | v1 |
| M1 | Scaffold T3 + integrasi Preline | v1 |
| M2 | Prisma schema + migrasi + seed contoh | v1 |
| M3 | Auth (login, register bootstrap, daftarkan anggota) | v1 |
| M4 | Algoritma `schedule` + test | v1 |
| M5 | tRPC routers + proteksi role | v1 |
| M6 | UI halaman (login/register/dashboard/kelola) | v1 |
| M7 | QA (lint, typecheck, test, uji HP) | v1 |
| M8 | Deploy Vercel + koneksi Postgres VPS | v1 |
| M9 | Sektor berikut (contoh fitur ekstensi) | v2 |

---

## 14. Risiko & Keputusan Terbuka

| Risiko | Mitigasi |
|---|---|
| Postgres VPS terbuka ke internet | Firewall allowlist IP + SSL; opsional tunnel. `ponytail:` not in code — ops sec. |
| Koneksi serverless habis | PgBouncer di VPS saat skala; setting Prisma optimization kala itu. |
| Belum ada rate-limit login | Jeda tunggu sederhana di sisi server; upgrade Upstash v2. |
| Tidak ada verifikasi email | Diterima v1 (superadmin yang buat akun, email diketik tangan). |
| Timezone user ≠ WIB | `TIMEZONE` env; jadwal konsisten per org. |
| User gabung >1 org | Mendukung (Membership unik per (user,org)); UX pemilih org v1. |

---

## 15. Glossary

| Istilah | Arti |
|---|---|
| Org | Unit: kontrakan / sektor / tim yang punya jadwal piket sendiri. |
| Task | Item pekerjaan piket (Menyapu, Ngepel, ...). |
| Membership | Relasi user↔org beserta role dan kamar (via Room). |
| Seed | Angka dasar pengacakan; ganti = "acak ulang". |
| Period index (W) | Nomor minggu berjalan; dasar rotasi deterministik. |
| Superadmin | Orang yang mengatur org (single role tulis di v1). |