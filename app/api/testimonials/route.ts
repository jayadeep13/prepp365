import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { TestimonialModel } from "@/models/Testimonial";

export async function GET() {
  try {
    await connectDB();
  } catch {
    return NextResponse.json({ testimonials: [] });
  }

  const testimonials = await TestimonialModel.find({ isPublished: true }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ testimonials });
}
