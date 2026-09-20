"use client";

import { useEffect, useState } from "react";

export function errMsg(
  err: unknown,
  fallback = "Gagal. Coba lagi ya.",
): string {
  if (typeof err === "object" && err !== null && "message" in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
  }
  return fallback;
}

export type ToastState = {
  message: string;
  kind?: "success" | "error";
};

export function useToast(duration = 3000) {
  const [toast, setToastState] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToastState(null), duration);
    return () => clearTimeout(t);
  }, [toast, duration]);

  const setToast = (next: ToastState) => setToastState(next);

  return { toast, setToast };
}

export function Toast({ toast }: { toast: ToastState | null }) {
  if (!toast) return null;
  const tone =
    toast.kind === "error"
      ? "bg-red-600"
      : "bg-gray-900 text-white border border-black/5";
  return (
    <div
      role="status"
      className={`fixed inset-x-4 top-4 z-[80] mx-auto flex max-w-sm items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium shadow-lg saturate-150 sm:inset-x-auto sm:right-4 ${tone}`}
    >
      <span
        aria-hidden="true"
        className={`flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          toast.kind === "error" ? "bg-white/20" : "bg-brand-500 text-white"
        }`}
      >
        {toast.kind === "error" ? "!" : "✓"}
      </span>
      <span>{toast.message}</span>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Tutup"
        className="absolute inset-0 bg-gray-900/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-3xl">
        <header className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex size-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
          >
            ✕
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

export function Button({
  kind = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  kind?: "primary" | "ghost" | "danger" | "subtle";
}) {
  const tones: Record<string, string> = {
    primary:
      "bg-brand-600 text-white shadow-sm shadow-brand-600/20 hover:bg-brand-700 disabled:opacity-50",
    ghost:
      "border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
    subtle: "text-brand-700 underline-offset-4 hover:underline",
  };
  return (
    <button
      {...props}
      className={`focus-visible:ring-brand-500 inline-flex shrink-0 items-center justify-center gap-x-2 rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none ${tones[kind]} ${className}`}
    />
  );
}

export function Chip({
  tone = "brand",
  children,
}: {
  tone?: "brand" | "neutral" | "danger";
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    brand: "bg-brand-100 text-brand-800",
    neutral: "bg-gray-100 text-gray-600",
    danger: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="mt-1 block text-xs text-gray-400">{hint}</span>
      ) : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30";

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`border-brand-500 inline-block size-6 animate-spin rounded-full border-4 border-t-transparent ${className}`}
    />
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
