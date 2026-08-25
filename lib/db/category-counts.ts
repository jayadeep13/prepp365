import "server-only";
import { CategoryModel } from "@/models/Category";
import { CourseModel } from "@/models/Course";
import type { PublicCategory } from "@/lib/types";

/** All categories with a computed count of published courses in each. */
export async function getCategoriesWithCourseCounts(): Promise<PublicCategory[]> {
  const [categories, counts] = await Promise.all([
    CategoryModel.find().sort({ name: 1 }).lean(),
    CourseModel.aggregate([{ $match: { isPublished: true } }, { $group: { _id: "$category", count: { $sum: 1 } } }]),
  ]);

  const countByCategoryId = new Map(counts.map((c) => [c._id.toString(), c.count as number]));

  return categories.map((c) => ({
    _id: c._id.toString(),
    slug: c.slug,
    name: c.name,
    group: c.group as PublicCategory["group"],
    icon: c.icon ?? "BookOpen",
    courseCount: countByCategoryId.get(c._id.toString()) ?? 0,
  }));
}
