"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, GraduationCap, MessageCircle, ShieldCheck, Sparkles, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicCourse } from "@/lib/types";

type Slide = {
  key: string;
  href: string;
  image: string;
  tag: string;
  title: string;
  description: string;
  highlights: string[];
  rating?: number;
  ratingCount?: number;
  students?: number;
};

const fallbackHighlights = ["Recorded video classes", "PDF notes & materials", "Class chat + doubt support"];
const highlightIcons = [Sparkles, MessageCircle, ShieldCheck, GraduationCap];

function splitTitleForAnimation(title: string): { staticPart: string; animatedPart: string } {
  // "NTA UGC NET Paper 1 — Complete Batch" / "SSC CGL: Full Course" → split at the
  // separator and drop it, so the coloured part is a clean phrase on its own line.
  const sep = title.match(/^(.+?)\s*(?:\s[—–-]\s|:\s)\s*(.+)$/);
  if (sep && sep[2].length <= 28) {
    return { staticPart: sep[1].trim(), animatedPart: sep[2].trim() };
  }
  const lastComma = title.lastIndexOf(",");
  if (lastComma !== -1) {
    return { staticPart: title.slice(0, lastComma + 1), animatedPart: title.slice(lastComma + 1).trim() };
  }
  const words = title.trim().split(/\s+/);
  if (words.length > 2) {
    return { staticPart: words.slice(0, -2).join(" "), animatedPart: words.slice(-2).join(" ") };
  }
  return { staticPart: "", animatedPart: title };
}

function toSlide(course: PublicCourse): Slide {
  return {
    key: course._id,
    href: `/courses/${course.slug}`,
    image: course.banner!,
    tag: course.tagline || course.examTag,
    title: course.title,
    description: course.description ?? "",
    highlights: course.heroHighlights && course.heroHighlights.length > 0 ? course.heroHighlights : fallbackHighlights,
    rating: course.rating,
    ratingCount: course.ratingCount,
    students: course.students,
  };
}

export function Hero({ courses }: { courses: PublicCourse[] }) {
  const slides: Slide[] =
    courses.filter((c) => c.banner).length > 0
      ? courses.filter((c) => c.banner).map(toSlide)
      : [
          {
            key: "default",
            href: courses[0] ? `/courses/${courses[0].slug}` : "/courses",
            image: "/home1.png",
            tag: "NTA UGC NET Paper 1",
            title: "Crack UGC NET Paper 1, taught by Firdaus.",
            description:
              "A complete recorded video course covering every unit of NTA UGC NET Paper 1 — with PDF notes, downloadable materials, and direct doubt support.",
            highlights: fallbackHighlights,
          },
        ];

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setIndex((i) => (i + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [slides.length, paused, next]);

  const slide = slides[index];

  const { staticPart, animatedPart } = splitTitleForAnimation(slide.title);
  // Long course titles get a smaller size so every slide keeps the same compact layout.
  const longTitle = slide.title.length > 26;

  return (
    <section
      className="relative overflow-hidden border-b border-surface-line min-h-[520px] sm:min-h-[600px] flex items-end sm:items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <Image src={slide.image} alt="" fill priority className="object-cover" />
        </motion.div>
      </AnimatePresence>

      {slide.rating !== undefined && slide.rating > 0 && slide.students !== undefined && slide.students > 0 && (
        <div className="absolute right-6 top-6 z-10 hidden sm:flex items-center gap-4 rounded-2xl border border-white/60 bg-white/80 px-5 py-3.5 shadow-glass-lg backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <Star size={16} className="fill-orange-500 text-orange-500" />
            <span className="font-display text-sm font-bold text-ink">{slide.rating.toFixed(1)}</span>
            {slide.ratingCount !== undefined && slide.ratingCount > 0 && (
              <span className="text-xs text-ink-faint">({slide.ratingCount})</span>
            )}
          </div>
          <div className="h-8 w-px bg-surface-line" />
          <div className="flex items-center gap-1.5 text-sm font-semibold text-ink">
            <Users size={15} className="text-purple-600" />
            {slide.students.toLocaleString("en-IN")}+ students
          </div>
        </div>
      )}

      <div className="container-page relative py-12 sm:py-0 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.key}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-mono font-semibold text-purple-700 border border-purple-100 shadow-glass">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-purple-600" />
              </span>
              <GraduationCap size={13} /> {slide.tag}
            </div>

            <h1
              className={`mt-5 font-display font-bold leading-[1.08] tracking-tight text-ink drop-shadow-[0_2px_20px_rgba(255,255,255,0.85)] ${
                longTitle ? "text-3xl sm:text-5xl" : "text-4xl sm:text-6xl"
              }`}
            >
              {staticPart}
              {staticPart && <br />}
              <span
                className={`font-accent bg-gradient-to-r from-purple-600 via-fuchsia-500 to-orange-500 bg-clip-text text-transparent ${
                  animatedPart.length <= 18 ? "whitespace-nowrap" : ""
                }`}
              >
                {animatedPart}
              </span>
            </h1>

            {slide.description && (
              <p
                title={slide.description}
                className="mt-4 max-w-lg line-clamp-3 text-sm sm:text-base text-ink-soft leading-relaxed drop-shadow-[0_2px_14px_rgba(255,255,255,0.8)]"
              >
                {slide.description}
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href={slide.href}>
                <Button variant="primary" size="lg" className="group w-full sm:w-auto h-14 px-9 text-base sm:text-lg justify-center">
                  View course
                  <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto h-14 px-9 text-base sm:text-lg justify-center">
                  Register now
                </Button>
              </Link>
            </div>

            {slide.highlights.length > 0 && (
              <div className="mt-6 inline-flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-white/30 rounded-2xl border border-white/40 bg-white/20 shadow-glass-lg backdrop-blur-xl backdrop-saturate-150">
                {slide.highlights.map((h, i) => {
                  const Icon = highlightIcons[i % highlightIcons.length];
                  return (
                    <div key={h} className="flex items-center gap-2.5 px-4 py-3">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/40 text-purple-700">
                        <Icon size={14} />
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-ink whitespace-nowrap drop-shadow-[0_1px_6px_rgba(255,255,255,0.6)]">
                        {h}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {slides.length > 1 && (
          <div className="mt-7 flex items-center gap-4">
            <button
              onClick={prev}
              aria-label="Previous slide"
              className="grid h-9 w-9 place-items-center rounded-full bg-white/70 hover:bg-white text-ink-soft backdrop-blur-sm border border-surface-line shadow-glass"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.key}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-purple-600" : "w-1.5 bg-ink/20"}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              aria-label="Next slide"
              className="grid h-9 w-9 place-items-center rounded-full bg-white/70 hover:bg-white text-ink-soft backdrop-blur-sm border border-surface-line shadow-glass"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
