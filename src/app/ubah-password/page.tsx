import { redirect } from "next/navigation";

import { AuthShell } from "~/app/_components/auth-shell";
import { auth } from "~/server/auth";

import { ChangePasswordForm } from "./change-password-form";

export default async function ChangePasswordPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <AuthShell>
      <h1 className="text-xl font-extrabold tracking-tight text-gray-900">
        Ganti sandi dulu!
      </h1>
      <p className="mt-1 mb-6 text-sm text-gray-500">
        Sandi dari pengelola itu sementara. Bikin yang kamu inget sendiri, biar
        aman.
      </p>
      <ChangePasswordForm />
    </AuthShell>
  );
}
