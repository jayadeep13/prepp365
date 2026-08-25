import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Clock, Languages, Users } from "lucide-react";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CourseDetailTabs, type CurriculumChapter, type CourseMaterial } from "@/components/course-detail-tabs";
import { getPublishedTestimonials } from "@/lib/db/public-testimonials";
import { CheckoutButton } from "@/components/checkout-button";
import { CourseCard } from "@/components/course-card";
import { formatINR } from "@/lib/utils";
import { connectDB } from "@/lib/db/connect";
import { CourseModel } from "@/models/Course";
import { getSession } from "@/lib/auth/session";
import { hasPurchased } from "@/lib/auth/has-purchased";
import { getPublishedCourses } from "@/lib/db/public-courses";
import type { PricingTier } from "@/lib/pricing";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    await connectDB();
  } catch {
    return {};
  }
  const course = await CourseModel.findOne({ slug, isPublished: true }).select("title description thumbnail").lean();
  if (!course) return {};
  return {
    title: `${course.title} | Prepp365`,
    description: course.description,
    openGraph: { title: course.title, description: course.description, images: [course.thumbnail] },
  };
}

type RawCurriculumLesson = {
  _id: string;
  title: string;
  type: "video" | "pdf" | "test";
  duration?: string;
  isFreePreview?: boolean;
  videoUrl?: string;
};
type RawCurriculumChapter = { _id: string; title: string; lessons: RawCurriculumLesson[] };

type MongoCourse = {
  _id: string;
  slug: string;
  title: string;
  examTag: string;
  description: string;
  instructor: string;
  thumbnail: string;
  price: number;
  mrp: number;
  pricingTiers?: PricingTier[];
  duration?: string;
  language?: string;
  rating?: number;
  ratingCount?: number;
  students?: number;
  bestseller?: boolean;
  isNew?: boolean;
  introVideoUrl?: string;
  curriculum?: RawCurriculumChapter[];
  materials?: CourseMaterial[];
  category: { _id: string; slug: string; name: string };
};

async function loadCourse(slug: string): Promise<{ course: MongoCourse; isPurchased: boolean } | null> {
  try {
    await connectDB();
  } catch {
    return null;
  }
  const course = (await CourseModel.findOne({ slug, isPublished: true })
    .populate("category", "slug name")
    .lean()) as unknown as MongoCourse | null;
  if (!course || !course.category) return null;

  const session = await getSession();
  const isPurchased = await hasPurchased(session, course._id.toString());
  return { course, isPurchased };
}

export default async function CourseDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const result = await loadCourse(slug);
  if (!result) notFound();
  const { course, isPurchased } = result;

  const discount = course.mrp > 0 ? Math.round(((course.mrp - course.price) / course.mrp) * 100) : 0;
  const hasTiers = (course.pricingTiers?.length ?? 0) > 0;
  // Only hand the video URL to the client for lessons the viewer is actually allowed to play.
  const sanitizedCurriculum: CurriculumChapter[] = (course.curriculum ?? []).map((ch) => ({
    _id: ch._id,
    title: ch.title,
    lessons: ch.lessons.map((l) => ({
      _id: l._id,
      title: l.title,
      type: l.type,
      duration: l.duration,
      isFreePreview: l.isFreePreview,
      videoUrl: l.isFreePreview || isPurchased ? l.videoUrl : undefined,
    })),
  }));
  const related = (await getPublishedCourses({ category: course.category._id }))
    .filter((c) => c.slug !== slug)
    .slice(0, 4);
  const testimonials = await getPublishedTestimonials().catch(() => []);

  return (
    <div>
      {/* Banner */}
      <div className="bg-ink">
        <div className="container-page py-10 grid lg:grid-cols-[1.3fr_1fr] gap-10 items-start">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Badge tone="orange">{course.examTag}</Badge>
              {course.bestseller && <Badge tone="blue">Bestseller</Badge>}
              {course.isNew && <Badge tone="purple">New</Badge>}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight">
              {course.title}
            </h1>
            <p className="mt-4 text-white/60 leading-relaxed max-w-xl">{course.description}</p>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/70">
              <Rating value={course.rating ?? 0} count={course.ratingCount ?? 0} />
              <span className="flex items-center gap-1.5"><Users size={14} /> {(course.students ?? 0).toLocaleString("en-IN")} enrolled</span>
              <span className="flex items-center gap-1.5"><Clock size={14} /> {course.duration}</span>
              <span className="flex items-center gap-1.5"><Languages size={14} /> {course.language}</span>
            </div>

            <p className="mt-5 text-sm text-white/50">
              Taught by <span className="text-white font-medium">{course.instructor}</span>
            </p>
          </div>

          {/* Purchase card */}
          <div id="purchase" className="rounded-card bg-white shadow-glass-lg overflow-hidden lg:sticky lg:top-24 scroll-mt-24">
            <div className="relative aspect-video">
              <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
            </div>
            <div className="p-6">
              {isPurchased ? (
                <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm font-semibold text-green-700 text-center">
                  You're enrolled
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-3">
                    {hasTiers && <span className="text-xs font-semibold text-ink-faint">from</span>}
                    <span className="font-display text-3xl font-bold text-ink">{formatINR(course.price)}</span>
                    {course.mrp > course.price && (
                      <>
                        <span className="text-ink-faint line-through">{formatINR(course.mrp)}</span>
                        <span className="text-sm font-semibold text-green-600">{discount}% off</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-ink-faint mt-1">Inclusive of all taxes</p>

                  <div className="mt-5">
                    <CheckoutButton courseSlug={course.slug} price={course.price} tiers={course.pricingTiers ?? []} />
                  </div>
                </>
              )}
              {isPurchased && (
                <Button variant="secondary" size="lg" className="w-full mt-2.5">
                  Go to course
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-page py-12">
        <CourseDetailTabs
          courseSlug={course.slug}
          instructor={course.instructor}
          category={course.category.name}
          students={course.students ?? 0}
          curriculum={sanitizedCurriculum}
          introVideoUrl={course.introVideoUrl}
          materials={course.materials ?? []}
          testimonials={testimonials}
          isPurchased={isPurchased}
        />
      </div>

      {related.length > 0 && (
        <div className="bg-surface-tint">
          <div className="container-page py-14">
            <h2 className="font-display text-2xl font-bold text-ink mb-6">More in this category</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((c) => (
                <CourseCard key={c.slug} course={c} />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="container-page py-10 text-center">
        <Link href="/courses" className="text-sm font-semibold text-purple-600 hover:text-purple-700">
          ← Back to all courses
        </Link>
      </div>
    </div>
  );
}
