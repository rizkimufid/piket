"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

import { Button, Field, inputClass } from "~/app/_components/ui";
import { api } from "~/trpc/react";

export function RegisterForm() {
  const router = useRouter();
  const register = api.auth.register.useMutation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await register.mutateAsync({
        name,
        email,
        password,
        orgName,
      });
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (res?.error) {
        setError("Akun jadi, tapi gagal masuk otomatis. Silakan login manual.");
        return;
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error && "message" in err
          ? (err as { message?: string }).message
          : "Gagal daftar. Coba lagi.";
      setError(message ?? "Gagal daftar. Coba lagi.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <Field label="Nama kamu">
        <input
          required
          className={inputClass}
          placeholder="Misal: Rizki"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>

      <Field label="Email">
        <input
          type="email"
          required
          className={inputClass}
          placeholder="kamu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>

      <Field label="Kata sandi">
        <input
          type="password"
          required
          minLength={8}
          className={inputClass}
          placeholder="Minimal 8 karakter"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>

      <Field label="Nama org / kontrakan">
        <input
          required
          className={inputClass}
          placeholder="Misal: Kontrakan Pak RT"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
        />
      </Field>

      <Button type="submit" className="w-full" disabled={register.isPending}>
        {register.isPending ? "Membuat..." : "Gas! Buat akun"}
      </Button>

      <Link
        href="/login"
        className="block pt-2 text-center text-sm text-gray-500 hover:text-gray-700"
      >
        Udah punya akun? Balik ke masuk
      </Link>
    </form>
  );
}
