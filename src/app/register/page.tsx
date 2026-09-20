"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { AuthShell } from "~/app/_components/auth-shell";
import { Spinner } from "~/app/_components/ui";

import { RegisterForm } from "./register-form";

export default function RegisterPage() {
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
            Bikin akun pengelola!
          </h1>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            Kamu akan jadi <em>superadmin</em> org pertama. Anggota lain nanti
            didaftarkan dari sini.
          </p>
          <RegisterForm />
        </>
      )}
    </AuthShell>
  );
}