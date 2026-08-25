import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { AnnouncementModel } from "@/models/Announcement";

export async function GET() {
  try {
    await connectDB();
  } catch {
    return NextResponse.json({ announcements: [] });
  }

  const announcements = await AnnouncementModel.find().sort({ pinned: -1, createdAt: -1 }).limit(20).lean();
  return NextResponse.json({ announcements });
}
