import { Navbar } from "~/app/_components/navbar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pt-6 pb-28 sm:pt-8 sm:pb-12">
        {children}
      </main>
    </div>
  );
}
