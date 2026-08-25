import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireRole } from "@/lib/auth/session";

/**
 * Signs whatever `paramsToSign` the Cloudinary Upload Widget sends (its own
 * `uploadSignature` callback contract) — the widget decides the exact param
 * set (timestamp, folder, source, etc.), we just sign precisely that object,
 * so there's no risk of the client sending different params than were signed.
 */
export async function POST(req: NextRequest) {
  const check = await requireRole(["admin", "faculty"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiSecret) {
    return NextResponse.json({ error: "Cloudinary is not configured." }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const paramsToSign = body.paramsToSign ?? {};
  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return NextResponse.json({ signature });
}

export async function GET() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  if (!cloudName || !apiKey) {
    return NextResponse.json({ error: "Cloudinary is not configured." }, { status: 503 });
  }
  return NextResponse.json({ cloudName, apiKey });
}
