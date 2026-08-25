import { Hero } from "@/components/sections/hero";
import { AnnouncementTicker } from "@/components/sections/announcement-ticker";
import { CourseIntroSection } from "@/components/sections/course-intro-section";
import { CourseSection } from "@/components/sections/course-section";
import { WhyChooseUs } from "@/components/sections/why-choose-us";
import { MockTestsSection } from "@/components/sections/mock-tests-section";
import { Testimonials } from "@/components/sections/testimonials";
import { FacultySection } from "@/components/sections/faculty-section";
import { CtaSection } from "@/components/sections/cta-section";
import { GetInTouchSection } from "@/components/sections/get-in-touch-section";
import { FaqSection } from "@/components/sections/faq-section";
import { connectDB } from "@/lib/db/connect";
import { getPublishedCourses } from "@/lib/db/public-courses";
import { getSession } from "@/lib/auth/session";
import { hasPurchased } from "@/lib/auth/has-purchased";

// The homepage now reads the session (for "You're enrolled" on the intro card),
// so it must render per-request rather than being frozen as static HTML.
export const dynamic = "force-dynamic";

async function loadCourses() {
  try {
    await connectDB();
  } catch {
    return [];
  }
  return getPublishedCourses();
}

export default async function Home() {
  const courses = await loadCourses();
  const compact = courses.length <= 4;

  const latest = [...courses].filter((c) => c.isNew).concat(courses.slice(0, 4)).slice(0, 4);
  const popular = [...courses].sort((a, b) => b.students - a.students).slice(0, 4);

  const featured = courses[0];
  const session = featured ? await getSession() : null;
  const featuredPurchased = featured ? await hasPurchased(session, featured._id) : false;

  return (
    <>
      <Hero courses={courses} />
      <AnnouncementTicker />
      {featured && <CourseIntroSection course={featured} isPurchased={featuredPurchased} />}
      {compact ? (
        courses.length > 0 && (
          <CourseSection
            eyebrow="Our courses"
            title="Available right now"
            description="Prerecorded video classes, PDF notes and rank-tracked mock tests."
            courses={courses}
          />
        )
      ) : (
        <>
          <CourseSection
            eyebrow="Fresh batches"
            title="Latest courses"
            description="Newly launched batches, timed to the next exam cycle."
            courses={latest}
          />
          <WhyChooseUs />
          <CourseSection
            eyebrow="Student favourites"
            title="Popular courses"
            description="The batches with the highest enrolment and completion rates."
            courses={popular}
            tint
          />
        </>
      )}
      {compact && <WhyChooseUs />}
      <MockTestsSection />
      <Testimonials />
      <FacultySection courseSlug={featured?.slug ?? "nta-ugc-net-paper-1"} />
      <CtaSection course={featured} />
      <GetInTouchSection />
      <FaqSection />
    </>
  );
}
