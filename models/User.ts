import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const courseAccessSchema = new Schema(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    expiresAt: { type: Date, required: true },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    photoURL: { type: String },
    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      default: "student",
    },
    referralCode: { type: String },
    referredBy: { type: String },
    // Student-facing state — kept lightweight here; expands in Phase 3.
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    // Lifetime membership flag — kept for backward compatibility with existing reads
    // (dashboard listings, chat gating). Real expiry now lives in courseAccess below.
    purchasedCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    // Per-course access window, one entry per course ever purchased. Re-purchasing
    // extends expiresAt rather than adding a duplicate entry.
    courseAccess: { type: [courseAccessSchema], default: [] },
    // Single site-wide "mock test access" pass, not tied to any one test.
    mockTestAccess: {
      expiresAt: { type: Date },
    },
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof userSchema>;

export const UserModel: Model<User> = (models.User as Model<User>) || model<User>("User", userSchema);
