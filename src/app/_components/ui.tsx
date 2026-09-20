"use client";

import { useEffect, useState } from "react";
import {
  IconAlertTriangle,
  IconCheck,
  IconX,
} from "@tabler/icons-react";

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
          toast.kind === "error" ? "bg-white/20" : "bg-primary-500 text-white"
        }`}
      >
        {toast.kind === "error" ? (
          <IconAlertTriangle size={14} aria-hidden="true" />
        ) : (
          <IconCheck size={14} aria-hidden="true" />
        )}
      </span>
      <span>{toast.message}</span>
    </div>
  );
}

import { HSOverlay } from "preline";

export function closeModal(id: string) {
  HSOverlay.close(`#${id}`);
}

export function openModal(id: string) {
  HSOverlay.open(`#${id}`);
}

/** Re-scan tombol `data-hs-overlay` yang baru masuk DOM secara async. */
export function refreshOverlays() {
  HSOverlay.autoInit();
}

export function Modal({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      tabIndex={-1}
      className="hs-overlay fixed inset-0 z-[80] hidden flex items-end justify-center sm:items-center sm:p-4"
    >
      <div className="hs-overlay-animation-target max-h-[90vh] w-full self-end rounded-t-3xl bg-card p-5 opacity-0 shadow-2xl transition-all duration-200 hs-overlay-open:translate-y-0 hs-overlay-open:opacity-100 sm:max-w-md sm:self-auto sm:rounded-3xl">
        <header className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <button
            type="button"
            data-hs-overlay={`#${id}`}
            aria-label="Tutup"
            className="bg-muted flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted-hover hover:text-foreground"
          >
            <IconX size={18} aria-hidden="true" />
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
      "bg-primary-600 text-white shadow-sm shadow-primary-600/20 hover:bg-primary-700 disabled:opacity-50",
    ghost:
      "border border-border bg-card text-foreground hover:border-line-3 hover:bg-muted-hover",
    danger: "bg-red-600 text-white hover:bg-red-700",
    subtle: "text-primary-700 underline-offset-4 hover:underline",
  };
  return (
    <button
      {...props}
      className={`focus-visible:ring-primary-500 inline-flex shrink-0 items-center justify-center gap-x-2 rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none ${tones[kind]} ${className}`}
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
    brand: "bg-primary-100 text-primary-800",
    neutral: "bg-muted text-muted-foreground",
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
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30";

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`border-primary-500 inline-block size-6 animate-spin rounded-full border-4 border-t-transparent ${className}`}
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
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
