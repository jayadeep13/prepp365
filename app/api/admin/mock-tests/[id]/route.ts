import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { MockTestModel } from "@/models/MockTest";
import { requireRole } from "@/lib/auth/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["admin", "faculty"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const { id } = await params;

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  const test = await MockTestModel.findById(id).populate("category", "name slug").lean();
  if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 });
  return NextResponse.json({ test });
}

const questionSchema = z.object({
  text: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
  correctIndex: z.number().int().min(0),
  marks: z.number().positive(),
});

const bodySchema = z.object({
  title: z.string().min(1).optional(),
  examTag: z.string().min(1).optional(),
  type: z.enum(["full-length", "chapter-wise", "previous-paper"]).optional(),
  durationMinutes: z.number().positive().optional(),
  negativeMarking: z.number().min(0).max(1).optional(),
  isPublished: z.boolean().optional(),
  questions: z.array(questionSchema).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["admin", "faculty"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const { id } = await params;
  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json({ error: "Invalid mock test data", details: String(err) }, { status: 400 });
  }

  for (const q of parsed.questions ?? []) {
    if (q.correctIndex >= q.options.length) {
      return NextResponse.json({ error: `A question's correct answer index is out of range.` }, { status: 400 });
    }
  }

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  const test = await MockTestModel.findByIdAndUpdate(id, { $set: parsed }, { new: true }).lean();
  if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 });
  return NextResponse.json({ test });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["admin"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const { id } = await params;

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  await MockTestModel.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
