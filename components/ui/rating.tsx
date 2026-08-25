import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({
  value,
  count,
  size = 14,
  className,
}: {
  value: number;
  count?: number;
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={
              i <= Math.round(value)
                ? "fill-orange text-orange"
                : "fill-surface-line text-surface-line"
            }
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-ink-soft">{value.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-xs text-ink-faint">({count.toLocaleString("en-IN")})</span>
      )}
    </div>
  );
}
