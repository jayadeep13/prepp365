import "server-only";
import { TestimonialModel } from "@/models/Testimonial";

export type PublicTestimonial = {
  _id: string;
  name: string;
  quote: string;
  examResult?: string;
  photoUrl?: string;
};

/** Published testimonials, newest first, shaped for public rendering. */
export async function getPublishedTestimonials(): Promise<PublicTestimonial[]> {
  const docs = await TestimonialModel.find({ isPublished: true }).sort({ createdAt: -1 }).lean();
  return docs.map((t) => ({
    _id: String(t._id),
    name: t.name,
    quote: t.quote,
    examResult: t.examResult ?? undefined,
    photoUrl: t.photoUrl ?? undefined,
  }));
}
