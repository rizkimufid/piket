export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="bg-brand-600 shadow-brand-600/30 flex size-9 items-center justify-center rounded-2xl text-base font-extrabold text-white shadow-sm">
        P
      </span>
      <span className="text-lg font-extrabold tracking-tight text-gray-900">
        Piket
      </span>
    </span>
  );
}
