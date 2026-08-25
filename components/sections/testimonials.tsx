import { Quote } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { connectDB } from "@/lib/db/connect";
import { getPublishedTestimonials } from "@/lib/db/public-testimonials";
import type { PublicTestimonial } from "@/lib/db/public-testimonials";

async function loadTestimonials() {
  try {
    await connectDB();
  } catch {
    return [];
  }
  return getPublishedTestimonials();
}

function TestimonialCard({ t, className = "" }: { t: PublicTestimonial; className?: string }) {
  return (
    <div className={`rounded-card bg-white border border-surface-line p-6 shadow-glass ${className}`}>
      <Quote size={20} className="text-purple-200" />
      <p className="mt-3 text-sm text-ink-soft leading-relaxed">{t.quote}</p>
      <div className="mt-5 flex items-center gap-3">
        {t.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-entered URL, not a whitelisted domain
          <img src={t.photoUrl} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-purple-50 text-sm font-bold text-purple-600">
            {t.name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-ink">{t.name}</p>
          {t.examResult && <p className="text-xs text-ink-faint">{t.examResult}</p>}
        </div>
      </div>
    </div>
  );
}

export async function Testimonials() {
  const testimonials = await loadTestimonials();
  if (testimonials.length === 0) return null;

  const scrolling = testimonials.length > 4;
  const track = scrolling ? [...testimonials, ...testimonials] : testimonials;
  const durationSeconds = Math.max(testimonials.length * 5, 16);

  return (
    <section className="bg-surface-tint">
      <div className="container-page py-16">
        <SectionHeading
          eyebrow="Student reviews & results"
          title="What students say after this course."
          align="center"
        />

        {scrolling ? (
          <div className="relative mt-10 overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-surface-tint to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-surface-tint to-transparent" />
            <div
              className="flex w-max animate-marquee gap-5 hover:[animation-play-state:paused]"
              style={{ animationDuration: `${durationSeconds}s` }}
            >
              {track.map((t, i) => (
                <TestimonialCard key={`${t._id}-${i}`} t={t} className="w-72 shrink-0" />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t) => (
              <TestimonialCard key={t._id} t={t} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
