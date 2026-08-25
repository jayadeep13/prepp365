import Link from "next/link";
import Image from "next/image";
import { Clock, Languages, Users } from "lucide-react";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import type { PublicCourse } from "@/lib/types";

export function CourseCard({ course }: { course: PublicCourse }) {
  const discount = Math.round(((course.mrp - course.price) / course.mrp) * 100);

  return (
    <div className="group flex flex-col rounded-card border border-surface-line bg-white overflow-hidden shadow-glass hover:shadow-glass-lg hover:-translate-y-1 transition-all duration-300">
      <Link href={`/courses/${course.slug}`} className="relative block aspect-[16/10] overflow-hidden">
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, 340px"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {course.bestseller && <Badge tone="orange">Bestseller</Badge>}
          {course.isNew && <Badge tone="blue">New</Badge>}
        </div>
        <div className="absolute bottom-3 right-3">
          <span className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-mono font-semibold text-white">
            {course.examTag}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/courses/${course.slug}`}>
          <h3 className="font-display font-semibold text-ink leading-snug line-clamp-2 hover:text-purple-600 transition-colors">
            {course.title}
          </h3>
        </Link>
        <p className="mt-1 text-xs text-ink-faint">by {course.instructor}</p>

        <Rating value={course.rating} count={course.ratingCount} className="mt-2" />

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
          <span className="flex items-center gap-1">
            <Clock size={13} /> {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <Languages size={13} /> {course.language}
          </span>
          <span className="flex items-center gap-1">
            <Users size={13} /> {course.students.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-lg font-bold text-ink">
                {formatINR(course.price)}
              </span>
              <span className="text-xs text-ink-faint line-through">
                {formatINR(course.mrp)}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-green-600">{discount}% off</span>
          </div>
          <Link href={`/courses/${course.slug}`}>
            <Button size="sm">Enroll</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
