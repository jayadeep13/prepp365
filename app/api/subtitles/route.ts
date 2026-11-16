import { NextRequest, NextResponse } from "next/server";
import { fetchTranscript, transcriptToVtt } from "@/lib/cloudinary";

/**
 * GET /api/subtitles?publicId=...&lang=en|hi&type=authenticated|upload
 * Returns a WebVTT file built from Cloudinary's auto-generated transcript.
 * 404 while the transcript is still processing (or was never requested).
 */
export async function GET(req: NextRequest) {
  const publicId = req.nextUrl.searchParams.get("publicId") ?? "";
  const lang = req.nextUrl.searchParams.get("lang") === "en" ? "en" : "hi";
  const type = req.nextUrl.searchParams.get("type") === "upload" ? "upload" : "authenticated";

  // Only our own assets — never act as an open proxy for arbitrary Cloudinary ids.
  if (!publicId.startsWith("prepp365/") || publicId.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const transcript = await fetchTranscript(publicId, lang, type);
  if (!transcript) return new NextResponse("Subtitles not available yet", { status: 404 });

  return new NextResponse(transcriptToVtt(transcript), {
    headers: {
      "Content-Type": "text/vtt; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=3600",
    },
  });
}
