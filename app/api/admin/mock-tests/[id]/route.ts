import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { MockTestModel } from "@/models/MockTest";
import "@/models/Category";
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

  let test;
  try {
    test = await MockTestModel.findById(id).populate("category", "name slug").lean();
  } catch {
    return NextResponse.json({ error: "Test not found" }, { status: 404 });
  }
  if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 });
  return NextResponse.json({ test });
}

const questionSchema = z.object({
  // Preserved for existing questions so re-saving doesn't mint new subdocument ids —
  // those ids are what attempt answers and scoring are matched against. Omitted for new questions.
  _id: z.string().optional(),
  text: z.string().min(1),
  textHindi: z.string().optional(),
  options: z.array(z.string().min(1)).min(2),
  optionsHindi: z.array(z.string()).optional(),
  correctIndex: z.number().int().min(0),
  marks: z.number().positive(),
  negativeMarks: z.number().min(0).optional(),
  matchLeft: z.array(z.object({ text: z.string().min(1), textHindi: z.string().optional() })).optional(),
  matchRight: z.array(z.object({ text: z.string().min(1), textHindi: z.string().optional() })).optional(),
});

const bodySchema = z.object({
  title: z.string().min(1).optional(),
  examTag: z.string().min(1).optional(),
  type: z.enum(["full-length", "chapter-wise", "previous-paper"]).optional(),
  durationMinutes: z.number().positive().optional(),
  negativeMarking: z.number().min(0).max(1).optional(),
  marksPerCorrect: z.number().positive().optional(),
  negativeMarksPerWrong: z.number().min(0).optional(),
  // When true, marksPerCorrect / negativeMarksPerWrong are also written onto every existing question.
  applyMarksToAllQuestions: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  isFree: z.boolean().optional(),
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
    const issue = err instanceof z.ZodError ? err.issues[0] : null;
    const where =
      issue?.path?.[0] === "questions" && typeof issue.path[1] === "number"
        ? ` (question ${issue.path[1] + 1}: ${issue.path.slice(2).join(".")})`
        : "";
    return NextResponse.json(
      { error: `Invalid mock test data${where}${issue ? ` — ${issue.message}` : ""}` },
      { status: 400 }
    );
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

  const { applyMarksToAllQuestions, ...update } = parsed;

  // Drop empty match lists so normal MCQs don't carry empty arrays.
  for (const q of update.questions ?? []) {
    if (!q.matchLeft?.length) delete q.matchLeft;
    if (!q.matchRight?.length) delete q.matchRight;
  }

  let test;
  try {
    if (applyMarksToAllQuestions && !update.questions) {
      const existing = await MockTestModel.findById(id);
      if (!existing) return NextResponse.json({ error: "Test not found" }, { status: 404 });
      for (const q of existing.questions) {
        if (update.marksPerCorrect !== undefined) q.marks = update.marksPerCorrect;
        if (update.negativeMarksPerWrong !== undefined) q.negativeMarks = update.negativeMarksPerWrong;
      }
      await existing.save();
    }
    test = await MockTestModel.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
  } catch {
    return NextResponse.json({ error: "Test not found" }, { status: 404 });
  }
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

  try {
    await MockTestModel.findByIdAndDelete(id);
  } catch {
    return NextResponse.json({ error: "Test not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
