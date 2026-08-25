import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    discountType: { type: String, enum: ["percent", "flat"], required: true },
    value: { type: Number, required: true }, // percent (0-100) or flat rupees
    maxUses: { type: Number, default: null }, // null = unlimited
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type Coupon = InferSchemaType<typeof couponSchema>;

export const CouponModel: Model<Coupon> = (models.Coupon as Model<Coupon>) || model<Coupon>("Coupon", couponSchema);
