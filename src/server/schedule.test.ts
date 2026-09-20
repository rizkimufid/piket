import { describe, expect, it } from "vitest";

import {
  buildSchedule,
  formatLongDate,
  mondayOf,
  periodIndexFrom,
  seededShuffle,
} from "./schedule";

const MEMBERS = ["m1", "m2", "m3", "m4", "m5"];
const TASKS = ["t1", "t2", "t3", "t4", "t5"];

describe("seededShuffle", () => {
  it("deterministik untuk seed yang sama", () => {
    expect(seededShuffle(MEMBERS, 42)).toEqual(seededShuffle(MEMBERS, 42));
  });

  it("berbeda untuk seed yang berbeda", () => {
    expect(seededShuffle(MEMBERS, 42)).not.toEqual(seededShuffle(MEMBERS, 43));
  });

  it("mempertahankan semua elemen", () => {
    expect(seededShuffle(MEMBERS, 42).sort()).toEqual([...MEMBERS].sort());
  });
});

describe("periodIndex", () => {
  const epoch = new Date(Date.UTC(2026, 0, 5)); // Senin, 5 Jan 2026 (UTC+0)

  it("minggu yang sama → index sama, minggu berikutnya → +1", () => {
    const d1 = new Date("2026-01-08T13:00:00Z"); // Kamis di pekan epoch
    const d2 = new Date("2026-01-12T13:00:00Z"); // Senin pekan berikutnya
    expect(periodIndexFrom(d1, epoch, 0)).toBe(0);
    expect(periodIndexFrom(d2, epoch, 0)).toBe(1);
  });

  it("offset timezone menggeser batas pekan", () => {
    // 2026-01-05T00:30Z di UTC+1 masih Senin dini hari, di UTC -1 sudah Senin.
    const d = new Date("2026-01-05T00:30:00Z");
    expect(mondayOf(d, 60)).toBe(epoch.getTime());
    expect(periodIndexFrom(d, epoch, 60)).toBe(0);
  });
});

describe("buildSchedule", () => {
  it("deterministik, adil, dan tak berulang beruntun", () => {
    const weeks = 5; // membentang lebih dari satu siklus penuh (N=5)
    const allWeeks: Map<string, string>[] = [];
    for (let w = 0; w < weeks; w++) {
      allWeeks.push(
        buildSchedule({
          memberIds: MEMBERS,
          taskIds: TASKS,
          seed: 99,
          periodIndex: w,
        }),
      );
    }

    // deterministik
    expect(
      buildSchedule({
        memberIds: MEMBERS,
        taskIds: TASKS,
        seed: 99,
        periodIndex: 2,
      }),
    ).toEqual(allWeeks[2]!);

    // semua task ada penanggungnya, semua anggota valid
    for (const week of allWeeks) {
      expect(week.size).toBe(TASKS.length);
      for (const member of week.values()) {
        expect(MEMBERS).toContain(member);
      }
    }

    // keadilan satu siklus: tiap pasangan (anggota, task) muncul tepat 1× dalam N minggu
    const seen = new Set<string>();
    for (const task of TASKS) {
      for (let w = 0; w < MEMBERS.length; w++) {
        const member = allWeeks[w]!.get(task)!;
        seen.add(`${task}:${member}`);
      }
    }
    expect(seen.size).toBe(TASKS.length * MEMBERS.length);
  });

  it("tidak ada anggota yang dapat task sama 2 minggu beruntun", () => {
    for (const task of TASKS) {
      for (let w = 0; w < 10; w++) {
        const a = buildSchedule({
          memberIds: MEMBERS,
          taskIds: TASKS,
          seed: 7,
          periodIndex: w,
        });
        const b = buildSchedule({
          memberIds: MEMBERS,
          taskIds: TASKS,
          seed: 7,
          periodIndex: w + 1,
        });
        expect(b.get(task)).not.toBe(a.get(task));
      }
    }
  });

  it("task tanpa penanggung saat tidak ada anggota", () => {
    expect(
      buildSchedule({ memberIds: [], taskIds: TASKS, seed: 1, periodIndex: 0 })
        .size,
    ).toBe(0);
  });

  it("kosong saat tidak ada task", () => {
    expect(
      buildSchedule({
        memberIds: MEMBERS,
        taskIds: [],
        seed: 1,
        periodIndex: 0,
      }).size,
    ).toBe(0);
  });
});

describe("formatLongDate", () => {
  it("format tanggal Indonesia", () => {
    const senin = mondayOf(new Date("2026-01-05T00:00:00Z"), 0);
    expect(formatLongDate(senin)).toBe("Senin, 5 Januari 2026");
  });
});
