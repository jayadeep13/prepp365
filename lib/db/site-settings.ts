import "server-only";
import { SiteSettingsModel } from "@/models/SiteSettings";
import type { PricingTier } from "@/lib/pricing";

export type PublicSiteSettings = {
  contactEmail: string;
  whatsappNumber: string;
  phoneNumber: string;
  officeAddress: string;
  mockTestTiers: PricingTier[];
};

// Real contact details, used until the DB has a settings doc (or when the DB
// isn't reachable) — editable anytime from /admin/settings once the DB is live.
const empty: PublicSiteSettings = {
  contactEmail: "365prepp@gmail.com",
  whatsappNumber: "919441343880",
  phoneNumber: "+91 88006 20321",
  officeAddress: "MC.015.0075, Munger, Bihar - 811201, India",
  mockTestTiers: [],
};

/** The single site-wide settings doc, or empty strings if not configured yet. */
export async function getSiteSettings(): Promise<PublicSiteSettings> {
  const doc = await SiteSettingsModel.findOne({ key: "site" }).lean();
  if (!doc) return empty;
  return {
    contactEmail: doc.contactEmail ?? "",
    whatsappNumber: doc.whatsappNumber ?? "",
    phoneNumber: doc.phoneNumber ?? "",
    officeAddress: doc.officeAddress ?? "",
    mockTestTiers: doc.mockTestTiers ?? [],
  };
}
