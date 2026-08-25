import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const questionSchema = new Schema(
  {
    text: { type: String, required: true },
    options: { type: [String], required: true },
    correctIndex: { type: Number, required: true },
    explanation: { type: String },
    marks: { type: Number, default: 1 },
  },
  { _id: true }
);

const mockTestSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    examTag: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    type: {
      type: String,
      enum: ["full-length", "chapter-wise", "previous-paper"],
      default: "chapter-wise",
    },
    durationMinutes: { type: Number, required: true },
    negativeMarking: { type: Number, default: 0.25 }, // marks deducted per wrong answer
    questions: [questionSchema],
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type MockTest = InferSchemaType<typeof mockTestSchema>;

export const MockTestModel: Model<MockTest> =
  (models.MockTest as Model<MockTest>) || model<MockTest>("MockTest", mockTestSchema);
