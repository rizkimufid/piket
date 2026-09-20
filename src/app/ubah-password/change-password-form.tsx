"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Field, inputClass } from "~/app/_components/ui";
import { api } from "~/trpc/react";

export function ChangePasswordForm() {
  const router = useRouter();
  const change = api.auth.changePassword.useMutation();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Ketik sandi baru yang sama dua-duanya, ya.");
      return;
    }
    setError(null);
    change.mutate(
      { password },
      {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
        onError: (err) => {
          setError(err.message ?? "Gagal ganti sandi. Coba lagi.");
        },
      },
    );
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

      <Field label="Sandi baru">
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

      <Field label="Ulangi sandi baru">
        <input
          type="password"
          required
          className={inputClass}
          placeholder="Ketik lagi yang sama"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </Field>

      <Button type="submit" className="w-full" disabled={change.isPending}>
        {change.isPending ? "Menyimpan..." : "Simpan, gas!"}
      </Button>
    </form>
  );
}
