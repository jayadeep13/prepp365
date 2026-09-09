"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PlayCircle, FileText, ClipboardList, Lock, CheckCircle2, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { faqs } from "@/lib/data";
import { Rating } from "@/components/ui/rating";
import { NoDownloadVideo } from "@/components/sections/no-download-video";

export type CourseMaterial = { _id: string; title: string; fileUrl?: string; isFreePreview?: boolean };
export type CourseTestimonial = { _id: string; name: string; quote: string; examResult?: string };

export type CurriculumLesson = {
  _id: string;
  title: string;
  type: "video" | "pdf" | "test";
  duration?: string;
  isFreePreview?: boolean;
  /** Only present when the lesson is unlocked (free preview, or the viewer has purchased the course). */
  videoUrl?: string;
};
export type CurriculumChapter = { _id: string; title: string; lessons: CurriculumLesson[] };

const tabs = ["Curriculum", "Materials", "Instructor", "Reviews", "FAQs"] as const;

// Shown only when the course isn't backed by a seeded Mongo document yet.
const sampleCurriculum = [
  {
    title: "Foundation & Number System",
    lessons: [
      { name: "Orientation + how to use this batch", type: "video", duration: "12 min", free: true },
      { name: "Number system — basics", type: "video", duration: "48 min", free: true },
      { name: "Number system — practice set", type: "pdf", duration: "24 pages", free: false },
    ],
  },
  {
    title: "Quantitative Aptitude",
    lessons: [
      { name: "Percentages & profit-loss", type: "video", duration: "55 min", free: false },
      { name: "Time, speed & distance", type: "video", duration: "50 min", free: false },
      { name: "Chapter test — Quant I", type: "test", duration: "30 questions", free: false },
    ],
  },
];

const typeIcon = { video: PlayCircle, pdf: FileText, test: ClipboardList };

/** Wraps the course-level intro video as a synthetic, always-unlocked first entry in the lesson browser. */
function introChapter(introVideoUrl: string): CurriculumChapter {
  return {
    _id: "intro",
    title: "Introduction",
    lessons: [{ _id: "intro-video", title: "Introduction", type: "video", isFreePreview: true, videoUrl: introVideoUrl }],
  };
}

export function CourseDetailTabs({
  courseSlug,
  instructor,
  category,
  students,
  curriculum,
  introVideoUrl,
  materials,
  testimonials,
  isPurchased,
}: {
  courseSlug: string;
  instructor: string;
  category: string;
  students: number;
  /** Real curriculum from MongoDB. Undefined = fall back to the static sample. */
  curriculum?: CurriculumChapter[];
  /** Course-level promo/intro video, shown as a stand-in while no lessons exist yet. */
  introVideoUrl?: string;
  materials?: CourseMaterial[];
  testimonials?: CourseTestimonial[];
  isPurchased: boolean;
}) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Curriculum");

  return (
    <div>
      <div className="flex gap-1 border-b border-surface-line overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "shrink-0 px-4 py-3 text-sm font-semibold border-b-2 transition-colors",
              tab === t ? "border-purple-500 text-purple-600" : "border-transparent text-ink-soft hover:text-ink"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="py-6">
        {tab === "Curriculum" &&
          (curriculum ? (
            curriculum.length === 0 && !introVideoUrl ? (
              <div className="rounded-card border border-dashed border-surface-line p-10 text-center">
                <p className="text-sm text-ink-faint">
                  No lessons added yet — check back soon.
                </p>
              </div>
            ) : (
              <CurriculumBrowser
                curriculum={introVideoUrl ? [introChapter(introVideoUrl), ...curriculum] : curriculum}
                isPurchased={isPurchased}
                courseSlug={courseSlug}
              />
            )
          ) : (
            <div className="space-y-4">
              {sampleCurriculum.map((section) => (
                <div key={section.title} className="rounded-card border border-surface-line overflow-hidden">
                  <div className="bg-surface-tint px-5 py-3">
                    <p className="font-display text-sm font-semibold text-ink">{section.title}</p>
                  </div>
                  <ul className="divide-y divide-surface-line">
                    {section.lessons.map((l) => {
                      const Icon = typeIcon[l.type as keyof typeof typeIcon];
                      return (
                        <li key={l.name} className="flex items-center gap-3 px-5 py-3.5">
                          <Icon size={17} className="text-purple-500 shrink-0" />
                          <span className="text-sm text-ink flex-1">{l.name}</span>
                          <span className="text-xs text-ink-faint hidden sm:block">{l.duration}</span>
                          {l.free ? (
                            <span className="text-xs font-semibold text-green-600">Free preview</span>
                          ) : (
                            <Lock size={14} className="text-ink-faint" />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          ))}

        {tab === "Materials" && (
          !materials || materials.length === 0 ? (
            <div className="rounded-card border border-dashed border-surface-line p-10 text-center">
              <p className="text-sm text-ink-faint">No materials uploaded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {materials.map((m) => {
                const unlocked = isPurchased || m.isFreePreview;
                return unlocked ? (
                  <a
                    key={m._id}
                    href={m.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-card border border-surface-line p-4 hover:bg-surface-tint transition-colors"
                  >
                    <FileText size={18} className="text-purple-500 shrink-0" />
                    <span className="text-sm text-ink flex-1">{m.title}</span>
                    {m.isFreePreview && !isPurchased && (
                      <span className="text-xs font-semibold text-green-600 shrink-0">Free</span>
                    )}
                    <Download size={15} className="text-ink-faint" />
                  </a>
                ) : (
                  <div key={m._id} className="flex items-center gap-3 rounded-card border border-dashed border-surface-line p-4 opacity-70">
                    <FileText size={18} className="text-ink-faint shrink-0" />
                    <span className="text-sm text-ink-faint flex-1">{m.title}</span>
                    <Lock size={15} className="text-ink-faint" />
                  </div>
                );
              })}
              {!isPurchased && (
                <Link href={`/courses/${courseSlug}#purchase`} className="block text-center text-sm font-semibold text-purple-600 pt-1">
                  Enroll to unlock all materials →
                </Link>
              )}
            </div>
          )
        )}

        {tab === "Instructor" && (
          <div className="rounded-card border border-surface-line p-6 flex items-start gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-purple-50 font-display text-xl font-bold text-purple-600">
              {instructor.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <p className="font-display font-semibold text-ink">{instructor}</p>
              <p className="text-sm text-ink-faint mt-0.5">Lead faculty · {category.toUpperCase()}</p>
              <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                Cleared {category.toUpperCase()} myself, but only after several attempts — so I know first-hand
                how tough this exam feels from the inside, scoring 44/50 in Paper 1. That experience is what
                shapes how I teach: my mission is to help you clear the exam as soon as possible during your
                MA itself, so you can move your full focus to your PhD research programme from day one.
              </p>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                Has taught {students.toLocaleString("en-IN")}+ students on Prepp365, with a focus on
                concept-first teaching backed by daily practice sets and doubt sessions.
              </p>
            </div>
          </div>
        )}

        {tab === "Reviews" && (
          !testimonials || testimonials.length === 0 ? (
            <div className="rounded-card border border-dashed border-surface-line p-10 text-center">
              <p className="text-sm text-ink-faint">No reviews yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {testimonials.map((t) => (
                <div key={t._id} className="rounded-card border border-surface-line p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm text-ink">{t.name}</p>
                    <Rating value={5} />
                  </div>
                  <p className="mt-2 text-sm text-ink-soft leading-relaxed">{t.quote}</p>
                  {t.examResult && <p className="mt-2 text-xs font-semibold text-purple-600">{t.examResult}</p>}
                </div>
              ))}
            </div>
          )
        )}

        {tab === "FAQs" && (
          <div className="space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="rounded-card border border-surface-line p-5">
                <p className="flex items-center gap-2 font-semibold text-sm text-ink">
                  <CheckCircle2 size={15} className="text-purple-500" /> {f.q}
                </p>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed pl-6">{f.a}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CurriculumBrowser({
  curriculum,
  isPurchased,
  courseSlug,
}: {
  curriculum: CurriculumChapter[];
  isPurchased: boolean;
  courseSlug: string;
}) {
  const flatLessons = useMemo(
    () => curriculum.flatMap((ch) => ch.lessons.map((l) => ({ ...l, chapterTitle: ch.title }))),
    [curriculum]
  );
  const [selectedId, setSelectedId] = useState(flatLessons[0]?._id);
  const selected = flatLessons.find((l) => l._id === selectedId) ?? flatLessons[0];
  const unlocked = isPurchased || Boolean(selected?.isFreePreview);

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-6">
      <div className="rounded-card border border-surface-line overflow-hidden max-h-[520px] overflow-y-auto">
        {curriculum.map((section) => (
          <div key={section._id}>
            <div className="bg-surface-tint px-4 py-2.5">
              <p className="text-xs font-semibold text-ink-faint uppercase tracking-wide">{section.title}</p>
            </div>
            <ul className="divide-y divide-surface-line">
              {section.lessons.map((l) => {
                const Icon = typeIcon[l.type];
                const active = l._id === selected?._id;
                const lessonUnlocked = isPurchased || l.isFreePreview;
                return (
                  <li key={l._id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(l._id)}
                      className={cn(
                        "flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm transition-colors",
                        active ? "bg-purple-50 text-purple-700 font-semibold" : "text-ink-soft hover:bg-surface-tint"
                      )}
                    >
                      <Icon size={16} className="shrink-0" />
                      <span className="flex-1 truncate">{l.title}</span>
                      {lessonUnlocked ? (
                        l.isFreePreview && <span className="text-[10px] font-semibold text-green-600 shrink-0">FREE</span>
                      ) : (
                        <Lock size={13} className="text-ink-faint shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div>
        {!selected ? null : unlocked ? (
          selected.type === "video" ? (
            selected.videoUrl ? (
              <NoDownloadVideo src={selected.videoUrl} className="w-full aspect-video rounded-card bg-ink" />
            ) : (
              <EmptyPanel icon={PlayCircle} text="No video has been added to this lesson yet." />
            )
          ) : selected.type === "pdf" ? (
            <EmptyPanel icon={FileText} text="This is a downloadable PDF lesson — open it from the Materials tab." />
          ) : (
            <EmptyPanel icon={ClipboardList} text="This is a test lesson — attempt it from Mock Tests." />
          )
        ) : (
          <div className="rounded-card border border-surface-line bg-surface-tint aspect-video flex flex-col items-center justify-center text-center p-8">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-ink-faint shadow-glass">
              <Lock size={22} />
            </span>
            <p className="mt-4 font-display font-semibold text-ink">This lesson is locked</p>
            <p className="mt-1 text-sm text-ink-faint max-w-xs">
              Enroll in this course to unlock this and every other lesson.
            </p>
            <Link href={`/courses/${courseSlug}#purchase`} className="mt-4 text-sm font-semibold text-purple-600">
              Please enroll →
            </Link>
          </div>
        )}

        {selected && (
          <div className="mt-3">
            <p className="text-sm font-semibold text-ink">{selected.title}</p>
            <p className="text-xs text-ink-faint">
              {selected.chapterTitle}
              {selected.duration ? ` · ${selected.duration}` : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyPanel({ icon: Icon, text }: { icon: typeof PlayCircle; text: string }) {
  return (
    <div className="rounded-card border border-dashed border-surface-line aspect-video flex flex-col items-center justify-center text-center p-8 gap-3">
      <Icon size={22} className="text-ink-faint" />
      <p className="text-sm text-ink-faint max-w-xs">{text}</p>
    </div>
  );
}
