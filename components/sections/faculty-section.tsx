import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { faculty } from "@/lib/data";

const trustPoints = [
  { icon: Sparkles, text: "Every lesson planned and recorded personally — no rotating faculty." },
  { icon: MessageCircle, text: "Doubts answered directly by your instructor, not a support queue." },
  { icon: ShieldCheck, text: "One instructor, one syllabus — nothing outsourced or templated." },
];

export function FacultySection({ courseSlug }: { courseSlug?: string }) {
  const instructor = faculty[0];
  if (!instructor) return null;

  return (
    <section id="faculty" className="container-page py-16">
      <SectionHeading eyebrow="Meet your instructor" title="Learn directly from who teaches it" align="center" className="mx-auto" />

      <div className="relative mt-10 max-w-3xl mx-auto overflow-hidden rounded-card border border-surface-line bg-white shadow-glass-lg">
        <div className="absolute inset-0 bg-mesh-hero" />
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-purple-200/40 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-orange-200/30 blur-3xl" />

        <div className="relative p-6 sm:p-10 grid sm:grid-cols-[auto_1fr] gap-8 items-center">
          <div className="relative mx-auto shrink-0">
            <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-brand-gradient p-1 shadow-button">
              <div className="relative h-full w-full overflow-hidden rounded-full ring-4 ring-white">
                <Image src={instructor.photo} alt={instructor.name} fill className="object-cover object-[65%_25%]" />
              </div>
            </div>
            <span className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-glass">
              <BadgeCheck size={18} className="text-purple-600" />
            </span>
          </div>

          <div className="text-center sm:text-left">
            <h3 className="font-display text-2xl font-bold text-ink">{instructor.name}</h3>
            <span className="mt-2 inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
              {instructor.subject}
            </span>
            <p className="text-xs text-ink-faint mt-2">{instructor.experience}</p>

            <ul className="mt-5 space-y-3 text-left">
              {trustPoints.map((t) => (
                <li key={t.text} className="flex items-start gap-3 text-sm text-ink-soft">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100">
                    <t.icon size={13} className="text-purple-600" />
                  </span>
                  {t.text}
                </li>
              ))}
            </ul>

            {courseSlug && (
              <div className="mt-7 flex flex-wrap justify-center sm:justify-start gap-3">
                <Link href={`/courses/${courseSlug}`}>
                  <Button variant="primary" className="group">
                    View course
                    <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
                <Link href={`/courses/${courseSlug}`}>
                  <Button variant="secondary">Watch a free preview</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
