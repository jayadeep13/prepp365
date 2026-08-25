"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";

type CourseRow = {
  _id: string;
  title: string;
  slug: string;
  examTag: string;
  isPublished: boolean;
  lessonCount: number;
};

export default function FacultyCoursesPage() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/faculty/courses")
      .then((res) => res.json())
      .then((data) => setCourses(data.courses ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-page py-10">
      <div className="flex items-center gap-2.5 mb-6">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
          <BookOpen size={18} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Faculty panel</h1>
          <p className="text-sm text-ink-soft">Manage lessons, videos, and PDF notes for each course.</p>
        </div>
      </div>

      <div className="rounded-card border border-surface-line bg-white divide-y divide-surface-line">
        {courses.map((c) => (
          <Link
            key={c._id}
            href={`/faculty/courses/${c._id}`}
            className="flex items-center justify-between px-5 py-4 hover:bg-surface-tint transition-colors"
          >
            <div>
              <p className="font-display font-semibold text-ink text-sm">{c.title}</p>
              <p className="text-xs text-ink-faint mt-0.5">
                {c.examTag} · {c.lessonCount} lessons · {c.isPublished ? "Published" : "Draft"}
              </p>
            </div>
            <ChevronRight size={16} className="text-ink-faint" />
          </Link>
        ))}
        {!loading && courses.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-ink-faint">
            No courses yet. Ask an admin to create one, or run <code className="font-mono">npm run seed</code>.
          </p>
        )}
      </div>
    </div>
  );
}
