import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CourseCard } from "@/components/course-card";
import { SectionHeading } from "@/components/ui/section-heading";
import type { PublicCourse } from "@/lib/types";

export function CourseSection({
  eyebrow,
  title,
  description,
  courses,
  tint = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  courses: PublicCourse[];
  tint?: boolean;
}) {
  return (
    <section className={tint ? "bg-surface-tint" : undefined}>
      <div className="container-page py-16">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <SectionHeading eyebrow={eyebrow} title={title} description={description} />
          <Link
            href="/courses"
            className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600 hover:text-purple-700 shrink-0"
          >
            View all <ArrowRight size={15} />
          </Link>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {courses.map((c) => (
            <CourseCard key={c.slug} course={c} />
          ))}
        </div>
      </div>
    </section>
  );
}
