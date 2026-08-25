"use client";

import { useState } from "react";
import { Tag, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCheckout } from "@/lib/hooks/use-checkout";
import { formatINR, cn } from "@/lib/utils";
import type { PricingTier } from "@/lib/pricing";

export function CheckoutButton({
  courseSlug,
  price,
  tiers = [],
}: {
  courseSlug: string;
  price: number;
  tiers?: PricingTier[];
}) {
  const hasTiers = tiers.length > 0;
  const defaultTier = hasTiers ? (tiers.find((t) => t.months === 6) ?? tiers[0]) : null;
  const [months, setMonths] = useState<number>(defaultTier?.months ?? 1);
  const selectedTier = hasTiers ? tiers.find((t) => t.months === months)! : null;
  const activePrice = selectedTier?.price ?? price;

  const [couponCode, setCouponCode] = useState("");
  const [couponOpen, setCouponOpen] = useState(false);
  const [applied, setApplied] = useState<{ code: string; finalAmount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const { buy, loading, error, success } = useCheckout({
    productType: "course",
    courseSlug,
    loginNext: `/courses/${courseSlug}`,
  });

  async function applyCoupon() {
    setCouponError(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, amount: activePrice }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setApplied({ code: data.code, finalAmount: data.finalAmount });
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : "Could not apply that coupon.");
    }
  }

  return (
    <div>
      {hasTiers && (
        <div className="mb-4 grid grid-cols-3 gap-2">
          {tiers.map((t) => {
            const off = t.mrp > t.price ? Math.round(((t.mrp - t.price) / t.mrp) * 100) : 0;
            return (
              <button
                key={t.months}
                type="button"
                onClick={() => {
                  setMonths(t.months);
                  setApplied(null);
                }}
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
                <p className="text-xs font-semibold text-ink-soft">{t.months} months</p>
                {off > 0 && <p className="text-[10px] text-ink-faint line-through">{formatINR(t.mrp)}</p>}
                <p className="font-display text-sm font-bold text-ink mt-0.5">{formatINR(t.price)}</p>
              </button>
            );
          })}
        </div>
      )}

      {(error || couponError) && (
        <div className="mb-3 flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 px-3.5 py-2.5 text-xs text-red-700">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{error || couponError}</span>
        </div>
      )}

      {success ? (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 size={16} /> Enrolled! Redirecting to your dashboard…
        </div>
      ) : (
        <>
          <Button
            size="lg"
            className="w-full h-16"
            disabled={loading}
            onClick={() => buy(hasTiers ? months : 1, applied?.code)}
          >
            {loading ? "Starting checkout…" : applied ? `Buy now — ${formatINR(applied.finalAmount)}` : "Buy now"}
          </Button>

          {!couponOpen ? (
            <button
              onClick={() => setCouponOpen(true)}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-purple-600"
            >
              <Tag size={13} /> Have a coupon code?
            </button>
          ) : (
            <div className="mt-2.5 flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="COUPON CODE"
                className="flex-1 rounded-full border border-surface-line px-3.5 py-2 text-xs font-mono outline-none focus:border-purple-400"
              />
              <Button variant="secondary" size="sm" onClick={applyCoupon}>
                Apply
              </Button>
            </div>
          )}

          {applied && (
            <p className="mt-2 text-xs font-semibold text-green-600 flex items-center gap-1">
              <CheckCircle2 size={13} /> {applied.code} applied
            </p>
          )}
        </>
      )}
    </div>
  );
}
