import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productType: { type: String, enum: ["course", "mocktest"], default: "course", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course" }, // only set for productType "course"
    months: { type: Number, required: true }, // resolved access length, decided server-side from the chosen tier
    amount: { type: Number, required: true },
    couponCode: { type: String },
    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created",
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
  },
  { timestamps: true }
);

export type Order = InferSchemaType<typeof orderSchema>;

export const OrderModel: Model<Order> = (models.Order as Model<Order>) || model<Order>("Order", orderSchema);
