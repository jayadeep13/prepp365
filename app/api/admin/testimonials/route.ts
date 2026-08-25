import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { TestimonialModel } from "@/models/Testimonial";
import { requireRole } from "@/lib/auth/session";

export async function GET() {
  const check = await requireRole(["admin"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ testimonials: [] });
  }

  const testimonials = await TestimonialModel.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ testimonials });
}

const bodySchema = z.object({
  name: z.string().min(1),
  quote: z.string().min(1),
  examResult: z.string().optional(),
  photoUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  const check = await requireRole(["admin"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid testimonial data" }, { status: 400 });
  }

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  const testimonial = await TestimonialModel.create(parsed);
  return NextResponse.json({ testimonial });
}
