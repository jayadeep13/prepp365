import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const lessonSchema = new Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ["video", "pdf", "test"], required: true },
    duration: { type: String },
    isFreePreview: { type: Boolean, default: false },
    videoUrl: { type: String }, // Cloudinary secure_url
    videoPublicId: { type: String }, // Cloudinary public_id, needed to delete the asset on lesson removal
    pdfUrl: { type: String }, // Cloudinary secure_url
    pdfPublicId: { type: String },
  },
  { _id: true }
);

const chapterSchema = new Schema(
  {
    title: { type: String, required: true },
    lessons: [lessonSchema],
  },
  { _id: true }
);

const materialSchema = new Schema(
  {
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    filePublicId: { type: String },
    isFreePreview: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const pricingTierSchema = new Schema(
  {
    months: { type: Number, required: true }, // access length in months, e.g. 3 / 6 / 12
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
  },
  { _id: false }
);

const courseSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    examTag: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    thumbnail: { type: String, required: true },
    banner: { type: String }, // wide hero-carousel image
    bannerPublicId: { type: String },
    tagline: { type: String }, // short marketing line shown on the hero slide
    heroHighlights: [{ type: String }], // up to ~4 short feature bullets shown on the hero slide
    introVideoUrl: { type: String }, // public promo/intro video shown on the homepage
    introVideoPublicId: { type: String },
    description: { type: String, required: true },
    instructor: { type: String, required: true },
    price: { type: Number, required: true }, // legacy flat price — kept as the "starting from" figure for cards/sorting; mirrors the cheapest pricingTier when tiers are set
    mrp: { type: Number, required: true },
    // Duration-based access plans (e.g. 3/6/12 months). Empty means the course
    // is sold as a single flat-price plan using price/mrp above with lifetime access.
    pricingTiers: { type: [pricingTierSchema], default: [] },
    duration: { type: String },
    language: { type: String },
    curriculum: [chapterSchema],
    materials: [materialSchema],
    isPublished: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },
    bestseller: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    students: { type: Number, default: 0 },
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

export type Course = InferSchemaType<typeof courseSchema>;

export const CourseModel: Model<Course> = (models.Course as Model<Course>) || model<Course>("Course", courseSchema);
