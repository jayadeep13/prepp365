import Image from "next/image";
import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import { CouponChip } from "@/components/ui/coupon-chip";
import { TierPricingPanel } from "@/components/ui/tier-pricing-panel";
import { formatINR } from "@/lib/utils";
import { connectDB } from "@/lib/db/connect";
import { CouponModel } from "@/models/Coupon";
import { getSiteSettings } from "@/lib/db/site-settings";
import type { PublicCourse } from "@/lib/types";

// Shown until a real course is seeded/published, so this section is visible
// during local setup instead of silently disappearing.
const fallbackCourse: Pick<PublicCourse, "slug" | "title" | "examTag" | "price" | "mrp" | "pricingTiers"> = {
  slug: "nta-ugc-net-paper-1",
  title: "NTA UGC NET Paper 1",
  examTag: "NTA UGC NET Paper 1",
  price: 1499,
  mrp: 1499,
  pricingTiers: [],
};

async function loadActiveCoupon() {
  try {
    await connectDB();
  } catch {
    return null;
  }
  const now = new Date();
  const coupon = await CouponModel.findOne({
    isActive: true,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    $expr: { $or: [{ $eq: ["$maxUses", null] }, { $lt: ["$usedCount", "$maxUses"] }] },
  })
    .sort({ value: -1 })
    .lean();
  if (!coupon) return null;
  return {
    code: coupon.code,
    label: coupon.discountType === "percent" ? `Extra ${coupon.value}% off` : `Extra ${formatINR(coupon.value)} off`,
  };
}

async function loadMockTestTiers() {
  try {
    await connectDB();
  } catch {
    return [];
  }
  const settings = await getSiteSettings();
  return settings.mockTestTiers;
}

export async function CtaSection({ course }: { course?: PublicCourse | null }) {
  const c = course ?? fallbackCourse;
  const [coupon, mockTestTiers] = await Promise.all([loadActiveCoupon(), loadMockTestTiers()]);

  return (
    <section className="container-page py-16">
      <div className="overflow-hidden rounded-card border border-surface-line shadow-glass-lg">
        {/* Banner */}
        <div className="relative flex min-h-[240px] items-center overflow-hidden sm:min-h-[300px]">
          <Image src="/price.png" alt="" fill priority className="object-cover" />
          <div className="relative px-6 py-10 sm:px-14 max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-mono font-semibold text-purple-700 border border-purple-100 shadow-glass">
              <GraduationCap size={13} /> {c.examTag}
            </div>

            <h2 className="mt-5 font-display text-3xl sm:text-4xl font-bold text-ink tracking-tight">
              Ready to start preparing?
            </h2>
            <p className="mt-3 text-ink-soft leading-relaxed">
              Choose a plan below and get instant access to every recorded class, PDF note and doubt-support channel.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {coupon && <CouponChip code={coupon.code} label={coupon.label} variant="light" />}
              <Link
                href={`/courses/${c.slug}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-purple-700 hover:text-purple-800"
              >
                View full course details <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div id="mock-test-pricing" className="scroll-mt-24 bg-white px-6 py-10 sm:px-14">
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
            <TierPricingPanel
              title="Course access"
              productType="course"
              courseSlug={c.slug}
              tiers={c.pricingTiers}
              accent="primary"
            />
            <TierPricingPanel title="Mock test access" productType="mocktest" tiers={mockTestTiers} accent="accent" />
          </div>
        </div>
      </div>
    </section>
  );
}
