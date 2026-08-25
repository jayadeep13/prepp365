export type PricingTier = { months: number; price: number; mrp: number };

// Legacy fallback for courses/products with no explicit tiers — treated as a
// single lifetime plan so pre-existing flat-price purchases keep working.
export const LIFETIME_MONTHS = 1200;

/** Extends `from` by `months`, handling year rollover correctly. */
export function addMonths(from: Date, months: number): Date {
  const d = new Date(from);
  d.setMonth(d.getMonth() + months);
  return d;
}

/** Picks the tier matching `months`, or the single legacy flat price when no tiers exist. */
export function resolveTier(
  tiers: PricingTier[] | undefined,
  months: number | undefined,
  flatPrice: number,
  flatMrp: number
): PricingTier | null {
  if (!tiers || tiers.length === 0) {
    return { months: LIFETIME_MONTHS, price: flatPrice, mrp: flatMrp };
  }
  return tiers.find((t) => t.months === months) ?? null;
}
