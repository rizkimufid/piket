import { redirect } from "next/navigation";

import { AuthShell } from "~/app/_components/auth-shell";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  const userCount = await db.user.count();

  return (
    <AuthShell>
      <h1 className="text-xl font-extrabold tracking-tight text-gray-900">
        Masuk dulu, yuk!
      </h1>
      <p className="mt-1 mb-6 text-sm text-gray-500">
        Akses jadwal piket pake email kamu.
      </p>
      <LoginForm canRegister={userCount === 0} />
    </AuthShell>
  );
}
