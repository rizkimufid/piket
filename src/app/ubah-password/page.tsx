"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { AuthShell } from "~/app/_components/auth-shell";
import { Spinner } from "~/app/_components/ui";

import { ChangePasswordForm } from "./change-password-form";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <AuthShell>
      <h1 className="text-xl font-extrabold tracking-tight text-foreground">
        Ganti sandi dulu!
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Sandi dari pengelola itu sementara. Bikin yang kamu inget sendiri, biar
        aman.
      </p>
      <ChangePasswordForm />
    </AuthShell>
  );
}