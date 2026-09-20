export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="bg-primary-600 shadow-primary-600/30 flex size-9 items-center justify-center rounded-2xl text-base font-extrabold text-white shadow-sm">
        P
      </span>
      <span className="text-lg font-extrabold tracking-tight text-foreground">
        Piket
      </span>
    </span>
  );
}
