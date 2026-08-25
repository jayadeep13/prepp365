import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { ChatMessageModel } from "@/models/ChatMessage";
import { UserModel } from "@/models/User";
import { requireRole } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const check = await requireRole(["admin", "faculty"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const courseId = req.nextUrl.searchParams.get("courseId");
  if (!courseId) return NextResponse.json({ error: "courseId is required" }, { status: 400 });

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ threads: [] });
  }

  const grouped = await ChatMessageModel.aggregate([
    { $match: { course: new Types.ObjectId(courseId), channel: "support" } },
    { $sort: { _id: -1 } },
    {
      $group: {
        _id: "$threadUser",
        lastBody: { $first: "$body" },
        lastAt: { $first: "$createdAt" },
        lastSenderRole: { $first: "$senderRole" },
      },
    },
    { $sort: { lastAt: -1 } },
  ]);

  const students = await UserModel.find({ _id: { $in: grouped.map((g) => g._id) } })
    .select("name email")
    .lean();
  const studentMap = new Map(students.map((s) => [s._id.toString(), s]));

  const threads = grouped.map((g) => ({
    studentId: g._id.toString(),
    studentName: studentMap.get(g._id.toString())?.name ?? "Unknown student",
    studentEmail: studentMap.get(g._id.toString())?.email ?? "",
    lastBody: g.lastBody,
    lastAt: g.lastAt,
    lastSenderRole: g.lastSenderRole,
  }));

  return NextResponse.json({ threads });
}
