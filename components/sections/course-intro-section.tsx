import Link from "next/link";
import { PlayCircle, FileText, ClipboardList, Lock, ShieldCheck, Smartphone, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { CheckoutButton } from "@/components/checkout-button";
import { NoDownloadVideo } from "@/components/sections/no-download-video";
import { formatINR } from "@/lib/utils";
import type { PublicCourse } from "@/lib/types";

const typeIcon = { video: PlayCircle, pdf: FileText, test: ClipboardList };
const TEASER_LIMIT = 5;

export function CourseIntroSection({ course, isPurchased }: { course: PublicCourse; isPurchased: boolean }) {
  const discount = course.mrp > course.price ? Math.round(((course.mrp - course.price) / course.mrp) * 100) : 0;
  const hasTiers = course.pricingTiers.length > 0;

  const allLessons = (course.curriculum ?? []).flatMap((ch) => ch.lessons);
  const teaserLessons = allLessons.slice(0, TEASER_LIMIT);
  const remainingCount = allLessons.length - teaserLessons.length;

  return (
    <section className="container-page py-16">
      <SectionHeading eyebrow="Course preview" title="See what you'll be learning" align="center" className="mx-auto" />

      <div className="mt-10 max-w-5xl mx-auto space-y-6">
        <div className="rounded-card overflow-hidden border border-surface-line bg-ink aspect-video">
          {course.introVideoUrl ? (
            <NoDownloadVideo src={course.introVideoUrl} poster={course.thumbnail} className="h-full w-full object-contain" />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center text-center p-8">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-white/70">
                <PlayCircle size={24} />
              </span>
              <p className="mt-4 text-sm text-white/50 max-w-xs">Intro video coming soon.</p>
            </div>
          )}
        </div>

        <div id="intro-pricing" className="scroll-mt-24 rounded-card border border-surface-line bg-white p-6 sm:p-8 grid sm:grid-cols-[1.2fr_1fr] gap-8">
          <div>
            <Badge tone="orange">{course.examTag}</Badge>
            <h3 className="mt-3 font-display text-2xl font-bold text-ink">{course.title}</h3>
            <p className="mt-3 text-sm text-ink-soft leading-relaxed">{course.description}</p>

            <ul className="mt-6 space-y-2.5 text-xs text-ink-soft">
              <li className="flex items-center gap-2"><ShieldCheck size={14} className="text-purple-500 shrink-0" /> 7-day refund guarantee</li>
              <li className="flex items-center gap-2"><Smartphone size={14} className="text-purple-500 shrink-0" /> Access on mobile, tablet and desktop</li>
              <li className="flex items-center gap-2">
                <RotateCcw size={14} className="text-purple-500 shrink-0" />
                {hasTiers ? "Access for your chosen plan duration" : "Lifetime access to batch materials"}
              </li>
            </ul>
          </div>

          <div className="sm:border-l sm:border-surface-line sm:pl-8">
            {isPurchased ? (
              <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm font-semibold text-green-700 text-center">
                You're enrolled
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-2xl font-bold text-ink">{formatINR(course.price)}</span>
                  {discount > 0 && (
                    <>
                      <span className="text-ink-faint line-through text-sm">{formatINR(course.mrp)}</span>
                      <span className="text-sm font-semibold text-green-600">{discount}% off</span>
                    </>
                  )}
                </div>
                <div className="mt-4">
                  <CheckoutButton courseSlug={course.slug} price={course.price} tiers={course.pricingTiers} />
                </div>
              </>
            )}

            <Link href={`/courses/${course.slug}`}>
              <Button variant="ghost" size="lg" className="w-full mt-2.5">
                {isPurchased ? "Go to course" : "Watch full course"}
              </Button>
            </Link>
          </div>
        </div>

        {allLessons.length > 0 && (
          <div className="rounded-card border border-surface-line bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-line flex items-center justify-between">
              <p className="font-display font-semibold text-ink text-sm">Inside this course</p>
              <span className="text-xs text-ink-faint">{allLessons.length} lessons</span>
            </div>
            <ul className="divide-y divide-surface-line">
              {teaserLessons.map((l) => {
                const Icon = typeIcon[l.type];
                const unlocked = isPurchased || l.isFreePreview;
                return (
                  <li key={l._id} className="flex items-center gap-3 px-6 py-3.5">
                    <Icon size={16} className="text-purple-500 shrink-0" />
                    <span className="flex-1 text-sm text-ink-soft">{l.title}</span>
                    {l.duration && <span className="text-xs text-ink-faint hidden sm:block">{l.duration}</span>}
                    {unlocked ? (
                      l.isFreePreview && <span className="text-xs font-semibold text-green-600">Free preview</span>
                    ) : (
                      <Lock size={14} className="text-ink-faint shrink-0" />
                    )}
                  </li>
                );
              })}
              {remainingCount > 0 && (
                <li className="flex items-center gap-2 px-6 py-3.5 text-xs font-semibold text-ink-faint bg-surface-tint justify-center">
                  <Lock size={12} /> +{remainingCount} more lessons inside
                </li>
              )}
            </ul>

            {!isPurchased && (
              <div className="px-6 py-6 bg-surface-tint text-center">
                <a
                  href="#intro-pricing"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-8 py-3.5 text-sm font-semibold text-white shadow-button hover:shadow-glass-lg hover:brightness-[1.06] transition-all"
                >
                  <Lock size={15} /> Unlock full course
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
