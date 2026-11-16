import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/**
 * Previous-year question material.
 *  - kind "paper":    a free question-paper PDF (PYQ tab).
 *  - kind "solution": a solved paper — PDF and/or a video explanation (PYQs with Solution tab).
 */
const pyqItemSchema = new Schema(
  {
    kind: { type: String, enum: ["paper", "solution"], required: true, index: true },
    title: { type: String, required: true },
    examTag: { type: String, required: true }, // e.g. "SSC CGL"
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    year: { type: Number },
    language: { type: String }, // e.g. "English", "Hindi", "Bilingual"
    description: { type: String },
    pdfUrl: { type: String },
    pdfPublicId: { type: String },
    videoUrl: { type: String },
    videoPublicId: { type: String },
    videoRestricted: { type: Boolean, default: true }, // uploaded with Cloudinary "authenticated" delivery
    // Papers are always free. Solutions can be free, or limited to students with a mock-test plan.
    isFree: { type: Boolean, default: true },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type PyqItem = InferSchemaType<typeof pyqItemSchema>;

export const PyqItemModel: Model<PyqItem> = (models.PyqItem as Model<PyqItem>) || model<PyqItem>("PyqItem", pyqItemSchema);
