import { redirect } from "next/navigation";

import { AuthShell } from "~/app/_components/auth-shell";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

import { RegisterForm } from "./register-form";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  const userCount = await db.user.count();

  return (
    <AuthShell>
      {userCount === 0 ? (
        <>
          <h1 className="text-xl font-extrabold tracking-tight text-gray-900">
            Bikin akun pengelola!
          </h1>
          <p className="mt-1 mb-6 text-sm text-gray-500">
            Kamu akan jadi <em>superadmin</em> org pertama. Anggota lain nanti
            didaftarkan dari sini.
          </p>
          <RegisterForm />
        </>
      ) : (
        <div className="text-center">
          <p
            className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-gray-100 text-xl"
            aria-hidden="true"
          >
            🧑‍💼
          </p>
          <h1 className="text-xl font-extrabold tracking-tight text-gray-900">
            Udah ada bosnya
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Pendaftaran ditutup — anggota hanya bisa dibuat oleh superadmin.
          </p>
          <a
            href="/login"
            className="text-brand-700 mt-4 inline-block font-semibold underline-offset-4 hover:underline"
          >
            Balik ke halaman masuk
          </a>
        </div>
      )}
    </AuthShell>
  );
}
