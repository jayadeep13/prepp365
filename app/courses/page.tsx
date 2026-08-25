"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { CourseCard } from "@/components/course-card";
import { cn } from "@/lib/utils";
import type { PublicCategory, PublicCourse } from "@/lib/types";

function CoursesContent() {
  const params = useSearchParams();
  const initial = params.get("category");

  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>(initial ? [initial] : []);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"popular" | "priceLow" | "priceHigh" | "rating">("popular");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/courses").then((res) => res.json()),
      fetch("/api/categories").then((res) => res.json()),
    ])
      .then(([coursesData, categoriesData]) => {
        setCourses(coursesData.courses ?? []);
        setCategories(categoriesData.categories ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => Array.from(new Set(categories.map((c) => c.group))), [categories]);
  const compact = !loading && courses.length <= 3;

  const toggle = (slug: string) => {
    setSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  };

  const filtered = useMemo(() => {
    let list = courses.filter((c) => {
      const matchesCategory = selected.length === 0 || selected.includes(c.category.slug);
      const matchesSearch =
        !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.examTag.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    if (sort === "priceLow") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "priceHigh") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "popular") list = [...list].sort((a, b) => b.students - a.students);
    return list;
  }, [courses, selected, search, sort]);

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-purple-500 mb-2">
          Course catalogue
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink">All courses</h1>
        <p className="mt-2 text-ink-soft">
          {loading ? "Loading…" : compact ? `${filtered.length} course${filtered.length === 1 ? "" : "s"} available` : `${filtered.length} batches matching your filters`}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        {!compact && categories.length > 0 && (
          <aside className="lg:w-64 shrink-0">
            <button
              onClick={() => setMobileFiltersOpen((v) => !v)}
              className="lg:hidden mb-4 inline-flex items-center gap-2 rounded-full border border-surface-line px-4 py-2 text-sm font-semibold"
            >
              <SlidersHorizontal size={15} /> Filters
            </button>

            <div className={cn("space-y-7", "lg:block", mobileFiltersOpen ? "block" : "hidden")}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses…"
                className="w-full rounded-full border border-surface-line px-4 py-2.5 text-sm outline-none focus:border-purple-400"
              />

              {groups.map((group) => (
                <div key={group}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint mb-3">{group}</p>
                  <div className="space-y-2">
                    {categories
                      .filter((c) => c.group === group)
                      .map((c) => (
                        <label key={c.slug} className="flex items-center gap-2.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selected.includes(c.slug)}
                            onChange={() => toggle(c.slug)}
                            className="h-4 w-4 rounded border-surface-line text-purple-600 focus:ring-purple-400"
                          />
                          <span className="text-sm text-ink-soft group-hover:text-ink">{c.name}</span>
                          <span className="ml-auto text-xs text-ink-faint">{c.courseCount}</span>
                        </label>
                      ))}
                  </div>
                </div>
              ))}

              {selected.length > 0 && (
                <button
                  onClick={() => setSelected([])}
                  className="flex items-center gap-1.5 text-sm font-semibold text-purple-600"
                >
                  <X size={14} /> Clear filters
                </button>
              )}
            </div>
          </aside>
        )}

        {/* Grid */}
        <div className="flex-1">
          {!compact && (
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-wrap gap-2">
                {selected.map((slug) => {
                  const c = categories.find((cat) => cat.slug === slug);
                  return (
                    <span
                      key={slug}
                      className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700"
                    >
                      {c?.name}
                      <button onClick={() => toggle(slug)}>
                        <X size={12} />
                      </button>
                    </span>
                  );
                })}
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="rounded-full border border-surface-line px-3 py-2 text-sm outline-none"
              >
                <option value="popular">Most popular</option>
                <option value="rating">Highest rated</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
              </select>
            </div>
          )}

          {!loading && filtered.length === 0 ? (
            <div className="rounded-card border border-dashed border-surface-line py-20 text-center">
              <p className="font-display font-semibold text-ink">No courses match those filters</p>
              <p className="text-sm text-ink-faint mt-1">Try clearing a filter or searching a different exam.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((c) => (
                <CourseCard key={c.slug} course={c} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense>
      <CoursesContent />
    </Suspense>
  );
}
