"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { AuthShell } from "~/app/_components/auth-shell";
import { Spinner } from "~/app/_components/ui";

import { LoginForm } from "./login-form";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") router.replace("/");
  }, [status, router]);

  if (status === "authenticated") {
    return null;
  }

  return (
    <AuthShell>
      {status === "loading" ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <>
          <h1 className="text-xl font-extrabold tracking-tight text-foreground">
            Masuk dulu, yuk!
          </h1>
          <p className="mt-1 mb-6 text-sm text-gray-500">
            Akses jadwal piket pake email kamu.
          </p>
          <LoginForm />
        </>
      )}
    </AuthShell>
  );
}