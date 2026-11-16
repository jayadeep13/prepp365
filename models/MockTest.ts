import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

// One row of a "Match the following" list (List-I on the left, List-II on the right).
const matchItemSchema = new Schema(
  {
    text: { type: String, required: true },
    textHindi: { type: String },
  },
  { _id: false }
);

const questionSchema = new Schema(
  {
    text: { type: String, required: true },
    textHindi: { type: String },
    options: { type: [String], required: true },
    optionsHindi: { type: [String] },
    correctIndex: { type: Number, required: true },
    explanation: { type: String },
    marks: { type: Number, default: 1 }, // marks awarded for a correct answer
    // Absolute marks deducted for a wrong answer. When unset, falls back to
    // marks × test.negativeMarking (legacy fraction-based setting).
    negativeMarks: { type: Number },
    // Match-the-following: rendered as a two-column table above the options.
    matchLeft: { type: [matchItemSchema], default: undefined },
    matchRight: { type: [matchItemSchema], default: undefined },
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
    negativeMarking: { type: Number, default: 0.25 }, // legacy: fraction of a question's marks deducted per wrong answer
    // Test-wide defaults applied to every question (admin can still override per question).
    marksPerCorrect: { type: Number, default: 1 },
    negativeMarksPerWrong: { type: Number }, // absolute marks deducted per wrong answer
    questions: [questionSchema],
    isPublished: { type: Boolean, default: false },
    isFree: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type MockTest = InferSchemaType<typeof mockTestSchema>;

export const MockTestModel: Model<MockTest> =
  (models.MockTest as Model<MockTest>) || model<MockTest>("MockTest", mockTestSchema);
