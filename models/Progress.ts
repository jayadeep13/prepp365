import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const progressSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    lessonId: { type: String, required: true },
    positionSeconds: { type: Number, default: 0 },
    durationSeconds: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

progressSchema.index({ user: 1, lessonId: 1 }, { unique: true });

export type Progress = InferSchemaType<typeof progressSchema>;

export const ProgressModel: Model<Progress> =
  (models.Progress as Model<Progress>) || model<Progress>("Progress", progressSchema);
