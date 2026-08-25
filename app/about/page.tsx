import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Prepp365",
  description: "Prepp365 is a video course for NTA UGC NET Paper 1, created and taught by Firdaus.",
};

export default function AboutPage() {
  return (
    <div className="container-page py-16">
      <div className="max-w-3xl mx-auto">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-purple-500 mb-2">About us</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tight">About Prepp365</h1>

        <div className="mt-8 space-y-4 text-ink-soft leading-relaxed">
          <p>
            Prepp365 is an online video-course platform built around a single focus: helping candidates
            prepare for <strong className="text-ink">NTA UGC NET Paper 1</strong>. Rather than being a large,
            general exam-prep marketplace, Prepp365 offers one complete, carefully structured course covering
            every unit of the Paper 1 syllabus — recorded classes, downloadable notes and materials, and
            direct doubt support.
          </p>
          <p>
            The course is created and taught entirely by <strong className="text-ink">Firdaus</strong>, who
            plans, records and updates every lesson herself. There's no rotating faculty and nothing
            outsourced — when you enroll, you're learning directly from the person who built the course, and
            your questions are answered by her directly through the in-app chat.
          </p>
          <p>
            Prepp365 handles enrolment, video access, notes distribution and payments entirely online, so you
            can start learning as soon as you enroll — with a free preview available before you pay.
          </p>
        </div>
      </div>
    </div>
  );
}
