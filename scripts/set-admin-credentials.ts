/**
 * Creates (or updates) a Firebase email/password login and grants it the
 * admin role in one step — for provisioning the admin login directly instead
 * of requiring a manual register-then-make-admin round trip.
 *
 *   npm run set-admin-credentials -- <email> <password>
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { connectDB } from "../lib/db/connect";
import { UserModel } from "../models/User";

async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.error("Usage: npm run set-admin-credentials -- <email> <password>");
    process.exit(1);
  }
  if (password.length < 6) {
    console.error("Password must be at least 6 characters (Firebase minimum).");
    process.exit(1);
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    console.error("Firebase Admin credentials are missing. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env.local.");
    process.exit(1);
  }

  const app = getApps().length ? getApps()[0] : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  const auth = getAuth(app);

  let firebaseUser;
  try {
    firebaseUser = await auth.getUserByEmail(email);
    await auth.updateUser(firebaseUser.uid, { password });
    console.log(`Updated password for existing Firebase login: ${email}`);
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "auth/user-not-found") {
      firebaseUser = await auth.createUser({ email, password, emailVerified: true });
      console.log(`Created new Firebase login: ${email}`);
    } else {
      throw err;
    }
  }

  await connectDB();
  const user = await UserModel.findOneAndUpdate(
    { firebaseUid: firebaseUser.uid },
    {
      $setOnInsert: {
        firebaseUid: firebaseUser.uid,
        name: email.split("@")[0],
        referralCode: `PREP-${firebaseUser.uid.slice(0, 6).toUpperCase()}`,
      },
      $set: { role: "admin", email: email.toLowerCase() },
    },
    { upsert: true, new: true }
  );

  console.log(`${user.name} <${user.email}> is now role: admin — ready to log in at /admin/login.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
