import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { TestimonialModel } from "@/models/Testimonial";
import { requireRole } from "@/lib/auth/session";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["admin"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  const testimonial = await TestimonialModel.findByIdAndUpdate(
    id,
    { $set: { isPublished: Boolean(body.isPublished) } },
    { new: true }
  );
  if (!testimonial) return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });

  return NextResponse.json({ testimonial });
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

  await TestimonialModel.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
