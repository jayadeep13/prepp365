import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const categorySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    group: {
      type: String,
      enum: ["Government Exams", "Teaching", "Medical & Engineering"],
      required: true,
    },
    icon: { type: String, default: "BookOpen" },
  },
  { timestamps: true }
);

export type Category = InferSchemaType<typeof categorySchema>;

export const CategoryModel: Model<Category> =
  (models.Category as Model<Category>) || model<Category>("Category", categorySchema);
