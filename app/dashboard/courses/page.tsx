import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { connectDB } from "@/lib/db/connect";
import { UserModel } from "@/models/User";
import "@/models/Course";
import { getSession } from "@/lib/auth/session";
import { PaymentStatusBanner } from "@/components/dashboard/payment-status-banner";

type PopulatedCourse = {
  slug: string;
  title: string;
  examTag: string;
  thumbnail: string;
  instructor: string;
  duration: string;
};

async function getMyCourses(uid: string): Promise<PopulatedCourse[]> {
  try {
    await connectDB();
  } catch {
    return [];
  }
  const user = await UserModel.findById(uid)
    .populate("purchasedCourses", "title slug thumbnail examTag instructor duration")
    .lean();
  return (user?.purchasedCourses as unknown as PopulatedCourse[]) ?? [];
}

export default async function MyCoursesPage() {
  const session = await getSession();
  const courses = session ? await getMyCourses(session.uid) : [];

  return (
    <div>
      <Suspense fallback={null}>
        <PaymentStatusBanner />
      </Suspense>
      <h1 className="font-display text-2xl font-bold text-ink">My Courses</h1>
      <p className="mt-1 text-sm text-ink-soft">Everything you've enrolled in, in one place.</p>

      {courses.length === 0 ? (
        <div className="mt-8 rounded-card border border-dashed border-surface-line p-10 text-center">
          <p className="font-display font-semibold text-ink">No courses yet</p>
          <p className="text-sm text-ink-faint mt-1">Once you enroll in a batch, it'll show up here.</p>
          <Link href="/courses" className="inline-block mt-4 text-sm font-semibold text-purple-600">
            Browse courses →
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((c) => (
            <Link
              key={c.slug}
              href={`/courses/${c.slug}`}
              className="group rounded-card border border-surface-line bg-white overflow-hidden hover:shadow-glass transition-shadow"
            >
              <div className="relative aspect-video">
                <Image src={c.thumbnail} alt={c.title} fill className="object-cover" />
              </div>
              <div className="p-4">
                <p className="text-xs font-mono text-purple-600">{c.examTag}</p>
                <p className="mt-1 font-display font-semibold text-ink text-sm line-clamp-2">{c.title}</p>
                <p className="mt-1 text-xs text-ink-faint">by {c.instructor}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
