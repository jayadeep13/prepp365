import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const answerSchema = new Schema(
  {
    questionId: { type: String, required: true },
    selectedIndex: { type: Number, default: null }, // null = unattempted
  },
  { _id: false }
);

const mockTestAttemptSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    test: { type: Schema.Types.ObjectId, ref: "MockTest", required: true, index: true },
    answers: [answerSchema],
    score: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    correctCount: { type: Number, required: true },
    wrongCount: { type: Number, required: true },
    unattemptedCount: { type: Number, required: true },
    timeTakenSeconds: { type: Number, required: true },
  },
  { timestamps: true }
);

export type MockTestAttempt = InferSchemaType<typeof mockTestAttemptSchema>;

export const MockTestAttemptModel: Model<MockTestAttempt> =
  (models.MockTestAttempt as Model<MockTestAttempt>) ||
  model<MockTestAttempt>("MockTestAttempt", mockTestAttemptSchema);
