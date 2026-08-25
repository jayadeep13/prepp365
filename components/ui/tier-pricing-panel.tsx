"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCheckout } from "@/lib/hooks/use-checkout";
import { formatINR, cn } from "@/lib/utils";
import type { PricingTier } from "@/lib/pricing";

export function TierPricingPanel({
  title,
  productType,
  courseSlug,
  tiers,
  accent = "primary",
}: {
  title: string;
  productType: "course" | "mocktest";
  courseSlug?: string;
  tiers: PricingTier[];
  accent?: "primary" | "accent";
}) {
  const defaultTier = tiers.find((t) => t.months === 6) ?? tiers[0];
  const [months, setMonths] = useState<number | undefined>(defaultTier?.months);
  const selected = tiers.find((t) => t.months === months) ?? defaultTier;

  const { buy, loading, error, success } = useCheckout({
    productType,
    courseSlug,
    loginNext: productType === "course" && courseSlug ? `/courses/${courseSlug}` : "/mock-tests",
    redirectOnSuccess: productType === "course" ? "/dashboard/courses" : "/mock-tests",
  });

  if (tiers.length === 0 || !selected) {
    return (
      <div className="rounded-2xl border border-dashed border-surface-line bg-white/70 p-5 text-left">
        <p className="font-display text-sm font-bold text-ink">{title}</p>
        <p className="mt-2 text-xs text-ink-faint">Pricing coming soon.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-surface-line bg-white/90 backdrop-blur-sm p-5 text-left shadow-glass">
      <p className="font-display text-sm font-bold text-ink mb-3">{title}</p>

      <div className="grid grid-cols-3 gap-2">
        {tiers.map((t) => {
          const off = t.mrp > t.price ? Math.round(((t.mrp - t.price) / t.mrp) * 100) : 0;
          return (
            <button
              key={t.months}
              type="button"
              onClick={() => setMonths(t.months)}
              className={cn(
                "relative rounded-xl border px-2 py-2.5 text-center transition-colors",
                months === t.months ? "border-purple-500 bg-purple-50" : "border-surface-line hover:border-purple-200"
              )}
            >
              {off > 0 && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  {off}% off
                </span>
              )}
              <p className="text-xs font-semibold text-ink-soft">{t.months} mo</p>
              {off > 0 && <p className="text-[10px] text-ink-faint line-through">{formatINR(t.mrp)}</p>}
              <p className="font-display text-sm font-bold text-ink mt-0.5">{formatINR(t.price)}</p>
            </button>
          );
        })}
      </div>

      {error && <p className="mt-2.5 text-xs text-red-600">{error}</p>}

      {success ? (
        <p className="mt-3.5 text-sm font-semibold text-green-600">Purchased! Redirecting…</p>
      ) : (
        <Button
          variant={accent}
          className="w-full mt-3.5"
          disabled={loading}
          onClick={() => selected && buy(selected.months)}
        >
          {loading ? "Starting checkout…" : `Buy — ${formatINR(selected.price)}`}
        </Button>
      )}
    </div>
  );
}
