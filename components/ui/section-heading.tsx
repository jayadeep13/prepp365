import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" && "text-center mx-auto", "max-w-2xl", className)}>
      {eyebrow && (
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-purple-500 mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-ink-soft leading-relaxed">{description}</p>
      )}
    </div>
  );
}
