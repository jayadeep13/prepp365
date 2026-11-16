import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/session";
import { requestAutoSubtitles } from "@/lib/cloudinary";

const bodySchema = z.object({
  publicId: z.string().min(1),
  restricted: z.boolean().default(false),
  spokenLanguage: z.enum(["hi", "en"]).default("hi"),
});

/**
 * Asks Cloudinary to transcribe an already-uploaded video and translate the
 * transcript, so both English and Hindi subtitles exist. Processing is async
 * on Cloudinary's side (usually a few minutes); the player picks the files up
 * via /api/subtitles once they exist.
 */
export async function POST(req: NextRequest) {
  const check = await requireRole(["admin", "faculty"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    await requestAutoSubtitles(parsed.publicId, parsed.restricted ? "authenticated" : "upload", parsed.spokenLanguage);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      (err as { error?: { message?: string } })?.error?.message ?? (err instanceof Error ? err.message : "Cloudinary rejected the request");
    console.error("Auto transcription request failed:", err);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
