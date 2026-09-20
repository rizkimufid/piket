// Mesin jadwal "acak tapi tetap" — Pure & deterministik. Spesifikasi: docs/PRD.md §7.

export const DAY_MS = 24 * 60 * 60 * 1000;
export const WEEK_MS = 7 * DAY_MS;

/** Epoch rotasi: Senin, 5 Jan 2026 (UTC). Basis index periode antarsektor. */
export const DEFAULT_EPOCH = Date.UTC(2026, 0, 5);

/**
 * PRNG kecil (mulberry32). Seed cukup untuk kontrakan; sekali seed dipecah bisa
 * ditebak urutannya — ganti seed via "Acak ulang" kalau perlu. ponytail: bukan
 * crypto; pakai crypto jika jadwal harus benar-benar tak tertebak.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates dengan PRNG dari seed. Hasil sama untuk seed & isi yang sama. */
export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const arr = [...items];
  const rand = mulberry32(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

/**
 * Jam ke-00 Senin dari pekan yang memuat `date`, dalam timezone dengan offset
 * `tzOffsetMin` (menit timur UTC). Hasil berupa UTC epoch dari tengah malam Senin.
 */
export function mondayOf(date: Date, tzOffsetMin: number): number {
  const shifted = new Date(date.getTime() + tzOffsetMin * 60_000);
  const day = shifted.getUTCDay(); // 0=Min .. 6=Sab
  const sinceMonday = (day + 6) % 7;
  const midnight = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate(),
  );
  return midnight - sinceMonday * DAY_MS;
}

/** Pergeseran waktu (menit timur UTC) untuk zona `tzName` pada tanggal tertentu. */
export function tzOffsetMinutes(date: Date, tzName: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tzName,
    timeZoneName: "longOffset",
  }).formatToParts(date);
  const name = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  const match = /GMT([+-])(\d{2}):?(\d{2})?/.exec(name);
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]) || 0;
  const minutes = Number(match[3]) || 0;
  return sign * (hours * 60 + minutes);
}

/**
 * Nomor periode (0-based) sejak Senin di `epoch`. Basis rotasi deterministik —
 * stabil tanpa penyimpanan, aman melewati batas tahun.
 */
export function periodIndexFrom(
  date: Date,
  epoch: Date,
  tzOffsetMin: number,
): number {
  return Math.floor(
    (mondayOf(date, tzOffsetMin) - mondayOf(epoch, tzOffsetMin)) / WEEK_MS,
  );
}

export interface ScheduleInput {
  memberIds: string[]; // anggota aktif, urut stabil (mis. createdAt asc)
  taskIds: string[]; // urut posisi
  seed: number;
  periodIndex: number;
}

/**
 * Peta taskId → memberId. Rotasi: task ke-j → anggota ke-(j + periodIndex) mod N
 * setelah urutan di-shuffle oleh seed. Kosong apabila tak ada anggota/task.
 */
export function buildSchedule({
  memberIds,
  taskIds,
  seed,
  periodIndex,
}: ScheduleInput): Map<string, string> {
  const out = new Map<string, string>();
  const n = memberIds.length;
  if (n === 0 || taskIds.length === 0) return out;
  const order = seededShuffle(memberIds, seed);
  taskIds.forEach((taskId, j) => {
    const memberId = order[(j + periodIndex) % n];
    if (memberId) out.set(taskId, memberId);
  });
  return out;
}

/** Nama panjang versi Indonesia dari epoch ms (dijadikan UTC agar konsisten). */
export function formatLongDate(epochMs: number): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(epochMs));
}
