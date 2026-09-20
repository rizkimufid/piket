import { Logo } from "~/app/_components/logo";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div
        aria-hidden="true"
        className="from-brand-100/70 pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b to-transparent"
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center gap-3">
          <Logo />
          <p className="text-brand-700 text-[11px] font-bold tracking-[0.18em] uppercase">
            Bersihin bareng, gas!
          </p>
        </div>
        <div className="rounded-3xl border border-gray-200/70 bg-white p-6 shadow-xl shadow-gray-900/5 sm:p-7">
          {children}
        </div>
      </div>
    </div>
  );
}
