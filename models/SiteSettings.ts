import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

// Singleton document (always queried/updated via { key: "site" }) so Firdaus
// can edit real contact details from the admin panel instead of them being
// hardcoded in the site's source.
const mockTestTierSchema = new Schema(
  {
    months: { type: Number, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
  },
  { _id: false }
);

const siteSettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "site" },
    contactEmail: { type: String, default: "" },
    whatsappNumber: { type: String, default: "" }, // digits only with country code, e.g. 91XXXXXXXXXX
    phoneNumber: { type: String, default: "" }, // display format, e.g. +91 XXXXX XXXXX
    officeAddress: { type: String, default: "" }, // operational office address (payment-gateway KYC requirement)
    // Duration-based pricing for the site-wide "mock test access" pass — not tied to any single test.
    mockTestTiers: { type: [mockTestTierSchema], default: [] },
  },
  { timestamps: true }
);

export type SiteSettings = InferSchemaType<typeof siteSettingsSchema>;

export const SiteSettingsModel: Model<SiteSettings> =
  (models.SiteSettings as Model<SiteSettings>) || model<SiteSettings>("SiteSettings", siteSettingsSchema);
