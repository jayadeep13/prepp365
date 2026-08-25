import "server-only";
import { CourseModel } from "@/models/Course";
import type { PublicCourse, PublicCurriculumChapter } from "@/lib/types";
import type { PricingTier } from "@/lib/pricing";

type LeanPublishedCourse = {
  _id: unknown;
  slug: string;
  title: string;
  examTag: string;
  thumbnail: string;
  banner?: string;
  tagline?: string;
  description?: string;
  heroHighlights?: string[];
  introVideoUrl?: string;
  price: number;
  mrp: number;
  pricingTiers?: PricingTier[];
  rating?: number;
  ratingCount?: number;
  duration?: string;
  language?: string;
  students?: number;
  instructor: string;
  isNew?: boolean;
  bestseller?: boolean;
  category: { _id: unknown; slug: string; name: string } | null;
  createdAt?: Date;
  curriculum?: {
    _id: unknown;
    title: string;
    lessons: { _id: unknown; title: string; type: "video" | "pdf" | "test"; duration?: string; isFreePreview?: boolean }[];
  }[];
};

/** All published courses, newest first, shaped for public rendering. */
export async function getPublishedCourses(filter: Record<string, unknown> = {}): Promise<PublicCourse[]> {
  const docs = (await CourseModel.find({ ...filter, isPublished: true })
    .populate("category", "slug name")
    .sort({ createdAt: -1 })
    .lean()) as unknown as LeanPublishedCourse[];

  return docs
    .filter((c) => c.category)
    .map((c) => ({
      _id: String(c._id),
      slug: c.slug,
      title: c.title,
      examTag: c.examTag,
      thumbnail: c.thumbnail,
      banner: c.banner ?? undefined,
      tagline: c.tagline ?? undefined,
      description: c.description ?? undefined,
      heroHighlights: c.heroHighlights ?? [],
      introVideoUrl: c.introVideoUrl ?? undefined,
      price: c.price,
      mrp: c.mrp,
      pricingTiers: c.pricingTiers ?? [],
      rating: c.rating ?? 0,
      ratingCount: c.ratingCount ?? 0,
      duration: c.duration ?? "",
      language: c.language ?? "",
      students: c.students ?? 0,
      instructor: c.instructor,
      isNew: c.isNew ?? false,
      bestseller: c.bestseller ?? false,
      category: { slug: c.category!.slug, name: c.category!.name },
      // Titles/type only — never expose lesson videoUrl/pdfUrl here, this feeds public marketing teasers.
      curriculum: ((c.curriculum ?? []) as NonNullable<LeanPublishedCourse["curriculum"]>).map(
        (ch): PublicCurriculumChapter => ({
          _id: String(ch._id),
          title: ch.title,
          lessons: ch.lessons.map((l) => ({
            _id: String(l._id),
            title: l.title,
            type: l.type,
            duration: l.duration ?? undefined,
            isFreePreview: l.isFreePreview ?? false,
          })),
        })
      ),
    }));
}
