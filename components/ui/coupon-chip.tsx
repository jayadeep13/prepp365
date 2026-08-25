"use client";

import { useState } from "react";
import { Check, Copy, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

export function CouponChip({
  code,
  label,
  variant = "dark",
}: {
  code: string;
  label: string;
  variant?: "dark" | "light";
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — silently ignore, code is still visible to copy manually.
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border border-dashed px-4 py-2 text-sm backdrop-blur-sm transition-colors",
        variant === "dark"
          ? "border-white/40 bg-white/10 text-white hover:bg-white/20"
          : "border-purple-200 bg-purple-50 text-ink hover:bg-purple-100"
      )}
    >
      <Ticket size={15} className="shrink-0 text-orange-500" />
      <span className="font-medium">{label}</span>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 font-mono text-xs font-bold tracking-wide",
          variant === "dark" ? "bg-white/15" : "bg-white text-purple-700"
        )}
      >
        {code}
      </span>
      {copied ? (
        <Check size={14} className="shrink-0 text-green-500" />
      ) : (
        <Copy size={14} className={cn("shrink-0", variant === "dark" ? "text-white/60" : "text-ink-faint")} />
      )}
    </button>
  );
}
