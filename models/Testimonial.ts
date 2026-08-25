import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const testimonialSchema = new Schema(
  {
    name: { type: String, required: true },
    quote: { type: String, required: true },
    examResult: { type: String }, // e.g. "Qualified NET Paper 1 — June 2026"
    photoUrl: { type: String },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type Testimonial = InferSchemaType<typeof testimonialSchema>;

export const TestimonialModel: Model<Testimonial> =
  (models.Testimonial as Model<Testimonial>) || model<Testimonial>("Testimonial", testimonialSchema);
