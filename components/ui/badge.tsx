import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  tone = "purple",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "purple" | "blue" | "orange" | "ink";
}) {
  const tones: Record<string, string> = {
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    ink: "bg-surface-tint text-ink-soft border-surface-line",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide font-mono",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
