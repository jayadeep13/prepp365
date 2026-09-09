import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PDFParse } from "pdf-parse";
import { requireRole } from "@/lib/auth/session";
import { parseMockTestText } from "@/lib/mocktest-pdf-parser";

const bodySchema = z.object({ pdfUrl: z.string().url() });

// Extraction only — nothing is saved here. The admin reviews the parsed
// questions client-side and explicitly saves them via PATCH /[id].
export async function POST(req: NextRequest) {
  const check = await requireRole(["admin", "faculty"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  let text: string;
  try {
    const parser = new PDFParse({ url: parsed.pdfUrl });
    const result = await parser.getText();
    await parser.destroy();
    text = result.text;
  } catch (err) {
    console.error("PDF parsing failed:", err);
    // TEMPORARY — debugging a production-only failure, remove `debug` once diagnosed.
    return NextResponse.json(
      {
        error: "Could not read that PDF. Make sure it's a text-based PDF, not a scanned image.",
        debug: err instanceof Error ? { message: err.message, name: err.name, stack: err.stack } : String(err),
      },
      { status: 400 }
    );
  }

  const { questions, errors } = parseMockTestText(text);
  if (questions.length === 0) {
    return NextResponse.json(
      { error: "No questions could be parsed. Make sure the PDF follows the required format.", parseErrors: errors },
      { status: 422 }
    );
  }

  return NextResponse.json({ questions, errors });
}
