"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

import { Logo } from "~/app/_components/logo";
import { api } from "~/trpc/react";

export type NavLink = {
  href: string;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
};

const JADWAL_ICON = (
  <svg
    className="size-full"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="4" width="18" height="18" rx="3" />
    <path d="M8 2v4M16 2v4M3 10h18" />
  </svg>
);

const ANGGOTA_ICON = (
  <svg
    className="size-full"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const TASK_ICON = (
  <svg
    className="size-full"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
  </svg>
);

const KAMAR_ICON = (
  <svg
    className="size-full"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20" />
    <path d="M6 8v9M9 8v9M6 11h3M18 11v3M22 11h-4" />
  </svg>
);

const ALL_LINKS: NavLink[] = [
  { href: "/", label: "Jadwal", shortLabel: "Jadwal", icon: JADWAL_ICON },
  {
    href: "/anggota",
    label: "Anggota",
    shortLabel: "Anggota",
    icon: ANGGOTA_ICON,
  },
  {
    href: "/task",
    label: "Task Piket",
    shortLabel: "Task",
    icon: TASK_ICON,
  },
  {
    href: "/kamar",
    label: "Kamar",
    shortLabel: "Kamar",
    icon: KAMAR_ICON,
  },
];

function ChevronIcon() {
  return (
    <svg
      className="size-4 shrink-0 text-muted-foreground"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const me = api.user.me.useQuery();
  const setActive = api.user.setActiveOrg.useMutation({
    onSuccess: async () => {
      await me.refetch();
      router.refresh();
    },
  });

  const memberships = me.data?.user?.memberships ?? [];
  const activeOrgId = me.data?.activeOrgId ?? null;
  const active =
    memberships.find((m) => m.org.id === activeOrgId) ?? memberships[0];
  const isSuperadmin = active?.role === "SUPERADMIN";
  const userName = me.data?.user?.name ?? "teman";

  const links = ALL_LINKS.filter((l) => l.href === "/" || isSuperadmin);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" aria-label="Beranda" className="shrink-0">
            <Logo />
          </Link>

          <nav
            aria-label="Menu utama"
            className="bg-muted hidden items-center gap-1 rounded-2xl p-1.5 sm:flex"
          >
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-card text-primary-700 shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span
                    className="size-5 shrink-0 [&>svg]:size-full"
                    aria-hidden="true"
                  >
                    {link.icon}
                  </span>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {memberships.length > 0 && (
              <div className="hs-dropdown relative inline-flex">
                <button
                  type="button"
                  className="hs-dropdown-toggle border-border bg-card text-foreground hover:border-line-3 hover:bg-muted-hover inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-semibold transition"
                  aria-haspopup="menu"
                >
                  <span
                    className="bg-primary-500 flex size-2 shrink-0 rounded-full"
                    aria-hidden="true"
                  />
                  <span className="max-w-32 shrink-0 truncate">
                    {active?.org.name}
                  </span>
                  <ChevronIcon />
                </button>
                <div
                  role="menu"
                  className="hs-dropdown-menu hs-dropdown-open:mt-3 hs-dropdown-open:opacity-100 border-border bg-card hidden min-w-56 overflow-hidden rounded-2xl border pt-2 pb-1 opacity-0 shadow-lg transition-[opacity,margin] duration-200"
                >
                  <p className="px-4 pb-1 text-xs font-semibold text-muted-foreground">
                    Ganti org/kontrakan
                  </p>
                  {memberships.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      role="menuitem"
                      disabled={setActive.isPending}
                      onClick={() => setActive.mutate({ orgId: m.org.id })}
                      className={`flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm ${
                        m.org.id === activeOrgId
                          ? "bg-primary-50 text-primary-800 font-semibold"
                          : "text-foreground hover:bg-muted-hover"
                      }`}
                    >
                      <span className="truncate">{m.org.name}</span>
                      {m.role === "SUPERADMIN" && (
                        <span className="bg-primary-100 text-primary-800 rounded-full px-2 py-0.5 text-xs font-medium">
                          superadmin
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="hs-dropdown relative inline-flex">
              <button
                type="button"
                className="hs-dropdown-toggle bg-primary-600 shadow-primary-600/25 hover:bg-primary-700 flex size-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm transition"
                aria-label="Menu pengguna"
                aria-haspopup="menu"
              >
                {userName.charAt(0).toUpperCase()}
              </button>
              <div
                role="menu"
                className="hs-dropdown-menu hs-dropdown-open:mt-3 hs-dropdown-open:opacity-100 border-border bg-card hidden min-w-48 overflow-hidden rounded-2xl border pt-2 pb-1 opacity-0 shadow-lg transition-[opacity,margin] duration-200"
              >
                <div className="border-border border-b px-4 pb-2">
                  <p className="text-sm font-semibold text-foreground">
                    {userName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {me.data?.user?.email}
                  </p>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => void signOut({ callbackUrl: "/login" })}
                  className="text-destructive hover:bg-red-50 flex w-full items-center gap-2 px-4 py-2 text-left text-sm"
                >
                  Keluar
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav
        aria-label="Menu utama"
        className="bg-background/95 fixed inset-x-0 bottom-0 z-50 border-t border-border pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
      >
        <div className="flex items-stretch">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 pt-2 pb-2.5 text-[11px] font-semibold transition"
              >
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-2xl transition ${
                    active
                      ? "bg-primary-100 text-primary-700"
                      : "text-muted-foreground"
                  }`}
                  aria-hidden="true"
                >
                  <span className="size-6 [&>svg]:size-full">{link.icon}</span>
                </span>
                <span
                  className={`max-w-full truncate ${
                    active ? "text-primary-700" : "text-muted-foreground"
                  }`}
                >
                  {link.shortLabel}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
