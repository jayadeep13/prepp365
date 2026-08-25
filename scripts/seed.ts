import { config } from "dotenv";
config({ path: ".env.local" });

import { connectDB } from "../lib/db/connect";
import { CategoryModel } from "../models/Category";
import { CourseModel } from "../models/Course";
import { MockTestModel } from "../models/MockTest";
import { SiteSettingsModel } from "../models/SiteSettings";
import { categories, courses, mockTests } from "../lib/data";

// Site-wide mock test access pass — 3/6/12 month plans.
const mockTestTiers = [
  { months: 3, price: 299, mrp: 599 },
  { months: 6, price: 499, mrp: 999 },
  { months: 12, price: 699, mrp: 1499 },
];

async function main() {
  await connectDB();
  console.log("Connected to MongoDB.");

  const categoryIds = new Map<string, string>();
  for (const c of categories) {
    const doc = await CategoryModel.findOneAndUpdate(
      { slug: c.slug },
      { $set: { name: c.name, group: c.group, icon: c.icon } },
      { upsert: true, new: true }
    );
    categoryIds.set(c.slug, doc._id.toString());
  }
  console.log(`Seeded ${categories.length} categories.`);

  let courseCount = 0;
  for (const course of courses) {
    const categoryId = categoryIds.get(course.category);
    if (!categoryId) {
      console.warn(`Skipping "${course.title}" — unknown category "${course.category}"`);
      continue;
    }
    await CourseModel.findOneAndUpdate(
      { slug: course.slug },
      {
        $set: {
          title: course.title,
          examTag: course.examTag,
          category: categoryId,
          thumbnail: course.thumbnail,
          description: course.description,
          instructor: course.instructor,
          price: course.price,
          mrp: course.mrp,
          pricingTiers: course.pricingTiers ?? [],
          duration: course.duration,
          language: course.language,
          isPublished: true,
          isNew: course.isNew ?? false,
          bestseller: course.bestseller ?? false,
          rating: course.rating,
          ratingCount: course.ratingCount,
          students: course.students,
        },
      },
      { upsert: true, new: true }
    );
    courseCount++;
  }
  console.log(`Seeded ${courseCount} courses.`);

  let testCount = 0;
  for (const test of mockTests) {
    const categoryId = categoryIds.get(test.category);
    if (!categoryId) {
      console.warn(`Skipping "${test.title}" — unknown category "${test.category}"`);
      continue;
    }
    await MockTestModel.findOneAndUpdate(
      { slug: test.slug },
      {
        $set: {
          title: test.title,
          examTag: test.examTag,
          category: categoryId,
          type: test.type,
          durationMinutes: test.durationMinutes,
          negativeMarking: test.negativeMarking,
          questions: test.questions,
          isPublished: true,
        },
      },
      { upsert: true, new: true }
    );
    testCount++;
  }
  console.log(`Seeded ${testCount} mock tests.`);

  await SiteSettingsModel.findOneAndUpdate(
    { key: "site" },
    { $set: { mockTestTiers } },
    { upsert: true, new: true }
  );
  console.log("Seeded mock test pricing.");

  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
