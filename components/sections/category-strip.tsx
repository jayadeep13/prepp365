import Link from "next/link";
import * as Icons from "lucide-react";
import { connectDB } from "@/lib/db/connect";
import { getCategoriesWithCourseCounts } from "@/lib/db/category-counts";
import { SectionHeading } from "@/components/ui/section-heading";

async function loadCategories() {
  try {
    await connectDB();
  } catch {
    return [];
  }
  return getCategoriesWithCourseCounts();
}

export async function CategoryStrip() {
  const categories = await loadCategories();
  if (categories.length === 0) return null;

  return (
    <section className="container-page py-16">
      <SectionHeading
        eyebrow="Choose your exam"
        title="Every major exam, one syllabus tracker"
        description="Government exams, teaching eligibility tests, and school foundation batches — pick a category to see matched courses."
      />
      <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((c) => {
          const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[c.icon] ?? Icons.BookOpen;
          return (
            <Link
              key={c.slug}
              href={`/courses?category=${c.slug}`}
              className="group flex flex-col items-center gap-3 rounded-card border border-surface-line bg-white p-5 text-center hover:border-purple-200 hover:shadow-glass transition-all"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-surface-tint text-purple-600 group-hover:bg-brand-gradient group-hover:text-white transition-colors">
                <Icon size={22} />
              </span>
              <span className="text-sm font-semibold text-ink">{c.name}</span>
              <span className="text-[11px] text-ink-faint">{c.courseCount} courses</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
