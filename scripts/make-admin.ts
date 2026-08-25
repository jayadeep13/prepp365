

import { config } from "dotenv";
config({ path: ".env.local" });

import { connectDB } from "../lib/db/connect";
import { UserModel } from "../models/User";

async function main() {
  const [email, role = "admin"] = process.argv.slice(2);
  if (!email) {
    console.error("Usage: npm run make-admin -- <email> [admin|faculty]");
    process.exit(1);
  }
  if (!["admin", "faculty", "student"].includes(role)) {
    console.error(`Invalid role "${role}". Use admin, faculty, or student.`);
    process.exit(1);
  }

  await connectDB();
  const user = await UserModel.findOneAndUpdate(
    { email: email.toLowerCase() },
    { $set: { role } },
    { new: true }
  );

  if (!user) {
    console.error(`No user found with email "${email}". They need to sign up first.`);
    process.exit(1);
  }

  console.log(`${user.name} <${user.email}> is now role: ${user.role}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
