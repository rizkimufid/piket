"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

import {
  Button,
  Chip,
  errMsg,
  Modal,
  Spinner,
  Toast,
  useToast,
} from "~/app/_components/ui";
import { api } from "~/trpc/react";
import { DAY_MS, formatLongDate } from "~/server/schedule";

type ScheduleItem = {
  taskId: string;
  taskName: string;
  memberId: string | null;
  memberName: string | null;
  kamar: string | null;
};

function WeekCard({
  weekStart,
  items,
  myId,
  variant = "this",
}: {
  weekStart: number;
  items: ScheduleItem[];
  myId?: string;
  variant?: "this" | "next";
}) {
  const weekEnd = weekStart + 7 * DAY_MS - 1;

  return (
    <section className="rounded-3xl border border-gray-200/70 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-gray-900">
          {variant === "this" ? "Minggu ini" : "Minggu depan"}
          <span className="mt-0.5 block text-xs font-medium text-gray-400">
            {formatLongDate(weekStart)} – {formatLongDate(weekEnd)}
          </span>
        </p>
        {variant === "this" && <Chip tone="brand">hari ini</Chip>}
      </div>

      <ul className="space-y-1.5">
        {items.map((item, i) => {
          const mine = item.memberId != null && item.memberId === myId;
          return (
            <li
              key={item.taskId}
              className={`flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition ${
                mine ? "bg-brand-50 ring-brand-200 ring-1" : "hover:bg-gray-50"
              }`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                    mine
                      ? "bg-brand-100 text-brand-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <span className="truncate text-sm font-semibold text-gray-800">
                  {item.taskName}
                </span>
              </span>

              <span className="flex shrink-0 items-center gap-2 text-sm">
                {mine && <Chip tone="brand">kamu</Chip>}
                {item.memberName ? (
                  <span className="truncate font-bold text-gray-800">
                    {item.memberName}
                    {item.kamar ? (
                      <span className="ml-1 font-medium text-gray-400">
                        · {item.kamar}
                      </span>
                    ) : null}
                  </span>
                ) : (
                  <span className="whitespace-nowrap text-gray-400">
                    belum ada
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const me = api.user.me.useQuery();
  const schedule = api.schedule.current.useQuery();
  const regenerate = api.org.regenerateSeed.useMutation();
  const utils = api.useUtils();
  const { toast, setToast } = useToast();
  const [askReset, setAskReset] = useState(false);

  if (me.isLoading || schedule.isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner />
      </div>
    );
  }

  const myId = session?.user?.id;
  const memberships = me.data?.user?.memberships ?? [];
  const activeOrgId = me.data?.activeOrgId;
  const activeOrgName =
    memberships.find((m) => m.org.id === activeOrgId)?.org.name ??
    memberships[0]?.org.name ??
    null;
  const activeRole =
    memberships.find((m) => m.org.id === activeOrgId)?.role ??
    memberships[0]?.role ??
    null;
  const isSuperadmin = activeRole === "SUPERADMIN";
  const userName = me.data?.user?.name ?? "teman";

  if (!memberships.length) {
    return (
      <div className="rounded-3xl border border-gray-200/70 bg-white p-8 text-center">
        <p
          className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-gray-100 text-xl"
          aria-hidden="true"
        >
          🏠
        </p>
        <h1 className="text-xl font-bold text-gray-800">Halo {userName}!</h1>
        <p className="mt-2 text-sm text-gray-500">
          Kamu belum tergabung di org mana pun. Minta superadmin (pengelola)
          kamu buat daftarin kamu, ya.
        </p>
      </div>
    );
  }

  const data = schedule.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-brand-700 mb-1 inline-flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase">
            <span
              className="bg-brand-500 flex size-2 rounded-full"
              aria-hidden="true"
            />
            {activeOrgName}
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            Halo, {userName}! 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Piket minggu ini gini nih.
          </p>
        </div>

        {isSuperadmin && data?.taskCount ? (
          <Button kind="ghost" onClick={() => setAskReset(true)}>
            🎲 Acak ulang jadwal
          </Button>
        ) : null}
      </div>

      {data && data.memberCount > 0 && data.taskCount > 0 ? (
        <>
          <WeekCard
            weekStart={data.thisWeek.weekStart}
            items={data.thisWeek.items}
            myId={myId}
          />

          <details className="group rounded-3xl border border-gray-200/70 bg-white shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-3xl px-4 py-4 sm:px-6">
              <span className="text-sm font-bold text-gray-900">
                Preview minggu depan
              </span>
              <span
                aria-hidden="true"
                className="flex size-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition group-open:rotate-180"
              >
                ▾
              </span>
            </summary>
            <div className="px-4 pb-4 sm:px-6">
              <WeekCard
                weekStart={data.nextWeek.weekStart}
                items={data.nextWeek.items}
                myId={myId}
                variant="next"
              />
            </div>
          </details>
        </>
      ) : (
        <div className="rounded-3xl border border-gray-200/70 bg-white p-8 text-center shadow-sm">
          <p
            className="bg-brand-100 mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl text-xl"
            aria-hidden="true"
          >
            {data?.memberCount === 0 ? "🛌" : "🧹"}
          </p>
          <h2 className="text-lg font-bold text-gray-800">
            {data?.memberCount === 0
              ? "Belum ada penghuni nih."
              : "Belum ada tugas piket."}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
            {isSuperadmin
              ? "Isi dulu anggota & tugasnya lewat menu Anggota dan Task biar jadwalnya jalan."
              : "Minta superadmin nambahin anggota & tugas dulu, ya."}
          </p>
          {isSuperadmin && (
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Link href="/anggota">
                <Button>Isi anggota, gas!</Button>
              </Link>
              <Link href="/task">
                <Button kind="ghost">Atur task piket</Button>
              </Link>
            </div>
          )}
        </div>
      )}

      <Toast toast={toast} />

      <Modal
        open={askReset}
        onClose={() => setAskReset(false)}
        title="Acak ulang jadwal?"
      >
        <p className="text-sm text-gray-600">
          Urutan piket bakal diacak dari awal. Fair tetap jalan kok — hasil baru
          berlaku mulai minggu ini.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button kind="ghost" onClick={() => setAskReset(false)}>
            Batal
          </Button>
          <Button
            disabled={regenerate.isPending}
            onClick={() =>
              regenerate.mutate(undefined, {
                onSuccess: () => {
                  setAskReset(false);
                  void utils.schedule.current.invalidate();
                  setToast({ message: "Jadwal udah diacak ulang. Gas!" });
                },
                onError: (err) =>
                  setToast({
                    message: errMsg(err, "Gagal acak ulang."),
                    kind: "error",
                  }),
              })
            }
          >
            {regenerate.isPending ? "Mengacak..." : "Acak, gas!"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
