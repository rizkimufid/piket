"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { DashboardShell } from "~/app/_components/dashboard-shell";
import { Spinner } from "~/app/_components/ui";
import { api } from "~/trpc/react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { status } = useSession();
  const me = api.user.me.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    // Cek kekinian dari server (jangan andalkan JWT yang bisa basi setelah ganti sandi).
    if (status === "authenticated" && me.data?.user?.mustChangePassword) {
      router.replace("/ubah-password");
    }
  }, [status, me.data, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}