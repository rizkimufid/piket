"use client";

import { IconShieldLock } from "@tabler/icons-react";

import { Spinner } from "~/app/_components/ui";
import { api } from "~/trpc/react";

export function useSuperadmin() {
  const me = api.user.me.useQuery();
  const memberships = me.data?.user?.memberships ?? [];
  const active =
    memberships.find((m) => m.org.id === me.data?.activeOrgId) ??
    memberships[0];

  return {
    isLoading: me.isLoading,
    isSuperadmin: active?.role === "SUPERADMIN",
    orgId: active?.org.id ?? null,
    orgName: active?.org.name ?? null,
    memberships,
    activeOrgId: me.data?.activeOrgId ?? null,
  };
}

export function SuperadminGate({ children }: { children: React.ReactNode }) {
  const { isLoading, isSuperadmin } = useSuperadmin();

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (!isSuperadmin) {
    return (
      <div className="border-border bg-card rounded-3xl border p-8 text-center shadow-sm">
        <p
          className="bg-muted text-muted-foreground mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl text-xl"
          aria-hidden="true"
        >
          <IconShieldLock size={26} stroke={1.75} />
        </p>
        <h1 className="text-lg font-bold text-foreground">
          Khusus superadmin nih
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Kamu bisa lihat jadwal di Beranda. Kelola anggota & task butuh akses
          superadmin.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
