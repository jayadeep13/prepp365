import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/session";
import { parseMockTestText } from "@/lib/mocktest-pdf-parser";

const bodySchema = z.object({ pdfUrl: z.string().url() });

async function extractPdfText(url: string): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ url });
  const result = await parser.getText();
  await parser.destroy();
  return result.text;
}

/** Word files keep real Unicode text, so Hindi (Devanagari) survives intact — unlike most PDFs. */
async function extractDocxText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not download the file (${res.status})`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

// Extraction only — nothing is saved here. The admin reviews the parsed
// questions client-side and explicitly saves them via PATCH /[id].
// Accepts both PDF and Word (.docx) files despite the route name.
export async function POST(req: NextRequest) {
  const check = await requireRole(["admin", "faculty"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const path = new URL(parsed.pdfUrl).pathname.toLowerCase();
  const isWord = path.endsWith(".docx");
  if (path.endsWith(".doc")) {
    return NextResponse.json(
      { error: "Old .doc files aren't supported. In Word, use File → Save As → Word Document (.docx) and upload that." },
      { status: 400 }
    );
  }

  let text: string;
  try {
    text = isWord ? await extractDocxText(parsed.pdfUrl) : await extractPdfText(parsed.pdfUrl);
  } catch (err) {
    console.error("Question file parsing failed:", err);
    return NextResponse.json(
      {
        error: isWord
          ? "Could not read that Word file. Make sure it's a valid .docx file."
          : "Could not read that PDF. Make sure it's a text-based PDF, not a scanned image.",
      },
      { status: 400 }
    );
  }

  const { questions, errors } = parseMockTestText(text);
  if (questions.length === 0) {
    return NextResponse.json(
      { error: "No questions could be parsed. Make sure the file follows the required format.", parseErrors: errors },
      { status: 422 }
    );
  }

  return NextResponse.json({ questions, errors });
}
