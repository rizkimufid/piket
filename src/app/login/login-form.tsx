"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

import { Button, Field, inputClass } from "~/app/_components/ui";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    setLoading(false);

    if (res?.error) {
      setError("Email atau kata sandinya salah. Coba lagi ya.");
      return;
    }
    router.push("/");
    router.refresh();
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

      <Field label="Email">
        <input
          type="email"
          required
          autoComplete="email"
          className={inputClass}
          placeholder="nama@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>

      <Field label="Kata sandi">
        <input
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Masuk..." : "Masuk, gas!"}
      </Button>

      <p className="pt-2 text-center text-sm text-muted-foreground">
        Baru mulai?{" "}
        <Link
          href="/register"
          className="text-primary-700 font-semibold underline-offset-4 hover:underline"
        >
          Daftar sebagai pengelola
        </Link>
      </p>
    </form>
  );
}
