"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import {
  IconBed,
  IconBrush,
  IconChevronDown,
  IconDice,
  IconHome,
  IconSun,
  IconSunrise,
  IconSunset,
} from "@tabler/icons-react";

import {
  Button,
  Chip,
  closeModal,
  errMsg,
  Modal,
  refreshOverlays,
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

const WINDOWS = [
  { label: "Pagi", from: 6, to: 11, icon: () => <IconSunrise size={18} /> },
  { label: "Siang", from: 11, to: 15, icon: () => <IconSun size={18} /> },
  { label: "Sore", from: 15, to: 19, icon: () => <IconSunset size={18} /> },
] as const;

function ReminderBanner() {
  const h = new Date().getHours();
  const window_ = WINDOWS.find((w) => h >= w.from && h < w.to);
  if (!window_) return null;

  return (
    <div className="border-primary-200 bg-primary-50 text-primary-800 flex items-center gap-3 rounded-3xl border px-4 py-3 text-sm font-medium">
      <span aria-hidden="true">{window_.icon()}</span>
      <p>
        Window {window_.label} — cek jadwal piket minggu ini biar nggak
        kelupaan, ya!
      </p>
    </div>
  );
}

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
    <section className="border-border bg-card rounded-3xl border p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-foreground">
          {variant === "this" ? "Minggu ini" : "Minggu depan"}
          <span className="text-muted-foreground mt-0.5 block text-xs font-medium">
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
                mine
                  ? "bg-primary-50 ring-primary-200 ring-1"
                  : "hover:bg-muted-hover"
              }`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                    mine
                      ? "bg-primary-100 text-primary-700"
                      : "bg-muted text-muted-foreground"
                  }`}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <span className="truncate text-sm font-semibold text-foreground">
                  {item.taskName}
                </span>
              </span>

              <span className="flex shrink-0 items-center gap-2 text-sm">
                {mine && <Chip tone="brand">kamu</Chip>}
                {item.memberName ? (
                  <span className="truncate font-bold text-foreground">
                    {item.memberName}
                    {item.kamar ? (
                      <span className="text-muted-foreground ml-1 font-medium">
                        · {item.kamar}
                      </span>
                    ) : null}
                  </span>
                ) : (
                  <span className="text-muted-foreground whitespace-nowrap">
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

  useEffect(() => {
    if (schedule.data) refreshOverlays();
  }, [schedule.data]);

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
      <div className="border-border bg-card rounded-3xl border p-8 text-center">
          <p
            className="bg-muted text-muted-foreground mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl text-xl"
            aria-hidden="true"
          >
            <IconHome size={24} stroke={1.75} />
          </p>
        <h1 className="text-xl font-bold text-foreground">Halo {userName}!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
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
          <p className="text-primary-700 mb-1 inline-flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase">
            <span
              className="bg-primary-500 flex size-2 rounded-full"
              aria-hidden="true"
            />
            {activeOrgName}
          </p>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Halo, {userName}!
            </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Piket minggu ini gini nih.
          </p>
        </div>

        {isSuperadmin && data?.taskCount ? (
          <Button kind="ghost" data-hs-overlay="#modal-reset">
            <IconDice size={18} aria-hidden="true" />
            Acak ulang jadwal
          </Button>
        ) : null}
      </div>

      {data && data.memberCount > 0 && data.taskCount > 0 ? (
        <>
          <ReminderBanner />
          <WeekCard
            weekStart={data.thisWeek.weekStart}
            items={data.thisWeek.items}
            myId={myId}
          />

          <details className="border-border bg-card rounded-3xl border shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-3xl px-4 py-4 sm:px-6">
              <span className="text-sm font-bold text-foreground">
                Preview minggu depan
              </span>
              <span
                aria-hidden="true"
                className="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-full transition group-open:rotate-180"
              >
                <IconChevronDown size={20} stroke={2} />
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
        <div className="border-border bg-card rounded-3xl border p-8 text-center shadow-sm">
          <p
            className="bg-primary-100 mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl text-xl"
            aria-hidden="true"
          >
            {data?.memberCount === 0 ? (
              <IconBed size={24} stroke={1.75} aria-hidden="true" />
            ) : (
              <IconBrush size={24} stroke={1.75} aria-hidden="true" />
            )}
          </p>
          <h2 className="text-lg font-bold text-foreground">
            {data?.memberCount === 0
              ? "Belum ada penghuni nih."
              : "Belum ada tugas piket."}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
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

      <Modal id="modal-reset" title="Acak ulang jadwal?">
        <p className="text-sm text-muted-foreground">
          Urutan piket bakal diacak dari awal. Fair tetap jalan kok — hasil baru
          berlaku mulai minggu ini.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button kind="ghost" data-hs-overlay="#modal-reset">
            Batal
          </Button>
          <Button
            disabled={regenerate.isPending}
            onClick={() =>
              regenerate.mutate(undefined, {
                onSuccess: () => {
                  closeModal("modal-reset");
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
