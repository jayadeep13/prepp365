export type PublicCategory = {
  _id: string;
  slug: string;
  name: string;
  group: "Government Exams" | "Teaching" | "Medical & Engineering";
  icon: string;
  courseCount: number;
};

import type { PricingTier } from "@/lib/pricing";

export type PublicCurriculumLesson = {
  _id: string;
  title: string;
  type: "video" | "pdf" | "test";
  duration?: string;
  isFreePreview?: boolean;
};
export type PublicCurriculumChapter = { _id: string; title: string; lessons: PublicCurriculumLesson[] };

export type PublicCourse = {
  _id: string;
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
  pricingTiers: PricingTier[];
  rating: number;
  ratingCount: number;
  duration: string;
  language: string;
  students: number;
  instructor: string;
  isNew: boolean;
  bestseller: boolean;
  category: { slug: string; name: string };
  curriculum?: PublicCurriculumChapter[];
};
