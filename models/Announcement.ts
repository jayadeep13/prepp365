import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const announcementSchema = new Schema(
  {
    title: { type: String, required: true },
    body: { type: String },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type Announcement = InferSchemaType<typeof announcementSchema>;

export const AnnouncementModel: Model<Announcement> =
  (models.Announcement as Model<Announcement>) || model<Announcement>("Announcement", announcementSchema);
