import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const chatMessageSchema = new Schema(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    channel: { type: String, enum: ["class", "support"], required: true },
    // Required for "support" — identifies whose private thread this belongs to. Omitted for "class".
    threadUser: { type: Schema.Types.ObjectId, ref: "User" },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String, enum: ["student", "admin"], required: true },
    senderName: { type: String, required: true },
    body: { type: String, required: true, maxlength: 4000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

chatMessageSchema.index({ course: 1, channel: 1, _id: 1 });
chatMessageSchema.index({ course: 1, channel: 1, threadUser: 1, _id: 1 });

export type ChatMessage = InferSchemaType<typeof chatMessageSchema>;

export const ChatMessageModel: Model<ChatMessage> =
  (models.ChatMessage as Model<ChatMessage>) || model<ChatMessage>("ChatMessage", chatMessageSchema);
