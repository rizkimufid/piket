import { redirect } from "next/navigation";

import { DashboardShell } from "~/app/_components/dashboard-shell";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Cek kekinian dari DB (jangan andalkan JWT yang bisa basi setelah ganti sandi).
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { mustChangePassword: true },
  });
  if (user?.mustChangePassword) redirect("/ubah-password");

  return <DashboardShell>{children}</DashboardShell>;
}
