# Prepp365 — Full Stack Scaffold (Phase 1–4)

Your Prep App — a premium, responsive exam-prep LMS with real authentication, a MongoDB-backed
API layer, Razorpay checkout, coupons, working student/admin/faculty dashboards, a video player
with resume-watching, a PDF viewer, and a full mock test engine with negative marking and a
leaderboard.

## What's in Phase 4

**Learning content**
- **`Progress` model** — per-user, per-lesson watch position, saved every ~5s of playback
- **`VideoPlayer`** (`components/learn/video-player.tsx`) — resumes from your last position,
  playback speed control (0.5x–2x), custom seek bar, auto-marks a lesson complete past 95% watched
- **`PdfViewer`** (`components/learn/pdf-viewer.tsx`) — locked state for non-purchasers, a subtle
  watermark overlay, and a download link once unlocked
- **`/courses/[slug]/learn/[lessonId]`** — the actual lesson player: checks free-preview /
  purchased / faculty-admin access, shows a chapter sidebar, and links to the next/previous lesson
- **Course details page is now MongoDB-backed** — real curriculum with clickable, access-checked
  lessons once you've run the seed script; falls back to the static sample curriculum (read-only)
  if the database isn't connected yet

**Mock test engine** (`/mock-tests`)
- `MockTest` model (questions, options, correct answer, explanation, per-question marks,
  negative marking) and `MockTestAttempt` model
- Listing → instructions → timed attempt (auto-submits at zero, question palette, save & next) →
  server-scored result with a full answer review → per-test leaderboard
- Scoring happens entirely server-side (`/api/mock-tests/[slug]/submit`) — the client never
  receives correct answers before submitting, so there's no way to cheat by reading the response

**Faculty tools** (`/faculty`)
- Faculty (and admins) see every course, and can manage its curriculum: add chapters, add
  lessons (video/PDF/test type, URL, duration, free-preview toggle), delete lessons
- This assumes video/PDF files are already hosted somewhere (Cloudinary, Firebase Storage, S3,
  etc.) and you're pasting in the URL — direct binary upload from the browser is a natural next
  step once those storage credentials are wired in, but isn't built here
- Replying to student doubts isn't built yet — see "What's next"

## Everything from Phase 2 & 3 (still here)

**Auth & data layer**
- **MongoDB** — connection singleton (`lib/db/connect.ts`) and Mongoose models for `User`,
  `Category`, `Course`, `Order`, `Coupon`, `Progress`, `MockTest`, `MockTestAttempt` (`/models`)
- **Firebase Authentication** — phone OTP, email/password, and Google sign-in, all on the client
  SDK (`lib/firebase/client.ts`); ID tokens verified server-side with the Admin SDK
  (`lib/firebase/admin.ts`)
- **App sessions** — once a Firebase ID token is verified, the server issues its own signed JWT
  in an httpOnly cookie (`lib/auth/jwt.ts`), independent of Firebase's own session
- **Role-based route protection** — `middleware.ts` guards `/dashboard` (student/faculty/admin),
  `/faculty` (faculty/admin) and `/admin` (admin only), redirecting signed-out visitors to
  `/login?next=...`

**Commerce**
- **Razorpay checkout** (`lib/razorpay.ts`) — creates orders via the Razorpay REST API and
  verifies payment signatures server-side (no SDK dependency, plain `fetch` + `crypto`)
- **Coupons** — percent or flat discount, usage limits, expiry, validated live on the course
  page and re-validated server-side when the order is created
- **`CheckoutButton`** on the course details page — applies a coupon, creates an order, opens
  the Razorpay modal, and verifies the payment on success, which unlocks the course's lessons

**Student dashboard** (`/dashboard`) — Overview, My Courses, Transactions, Profile, all reading
live Mongo data.

**Admin dashboard** (`/admin`) — Analytics (revenue, popular courses, recent orders), Orders,
Students (with an inline role changer), Courses (publish/delete/create), Coupons.

## Setting up your own MongoDB + Firebase (do this whenever you're ready)

### 1. MongoDB Atlas
1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. **Database Access** → add a database user with a password.
3. **Network Access** → add your IP (or `0.0.0.0/0` for local dev).
4. Copy the connection string into `MONGODB_URI` in `.env.local`.

### 2. Firebase project
1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. **Authentication** → Sign-in method → enable **Phone**, **Email/Password**, and **Google**.
3. **Project settings → General → Your apps** → add a Web app → copy the config into the
   `NEXT_PUBLIC_FIREBASE_*` vars.
4. **Project settings → Service accounts** → Generate new private key → downloads a JSON file.
   Copy `project_id` → `FIREBASE_PROJECT_ID`, `client_email` → `FIREBASE_CLIENT_EMAIL`,
   `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` sequences literal, in quotes).
5. Phone auth needs a real domain or `localhost` allow-listed under **Authentication → Settings
   → Authorized domains** (localhost is allowed by default).

### 3. Razorpay (for checkout)
1. Sign up at [dashboard.razorpay.com](https://dashboard.razorpay.com) — Test Mode is enabled by
   default, so you can develop with test cards before going live.
2. **Settings → API keys** → generate a Test key → copy `Key Id` and `Key Secret` into
   `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` in `.env.local`.
3. Test payments with card `4111 1111 1111 1111`, any future expiry, any CVV — see
   [Razorpay's test card docs](https://razorpay.com/docs/payments/payments/test-card-details/)
   for UPI/netbanking test options too.

### 4. Install, seed, run

```bash
npm install
cp .env.example .env.local   # then fill in the values above
npm run dev
```

Once `MONGODB_URI` is set, seed the database with the sample courses/categories and two sample
mock tests:

```bash
npm run seed
```

Sign up once through `/register` (any method), then promote yourself to admin:

```bash
npm run make-admin -- you@example.com admin
```

You'll need to log out and back in for the new role to appear in your session cookie. From
there, `/admin/coupons` lets you create discount codes, and `/admin/courses` lets you publish
new courses — both from the UI, no scripts needed.

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Framer Motion · Lucide icons ·
Mongoose · Firebase (client + admin) · jose (JWT) · Zod · Razorpay Checkout

## Getting started (no backend yet)

The site still works with zero configuration — course pages just run on sample data, and
anything under `/login`, `/register`, `/dashboard`, `/admin`, `/faculty` will show a clear
"not configured" error until you add the env vars above. Buying a course needs both
`MONGODB_URI` (to look up the course/create the order) and Razorpay keys (to actually open
checkout).

```bash
npm install
npm run dev
```

```bash
npm run build   # production build
npm run start   # serve the production build
```

The first `npm run dev` / `npm run build` needs an internet connection once, to fetch the
Google Fonts (Sora, Inter, IBM Plex Mono) used in `app/layout.tsx`.

## Project structure

```
app/
  page.tsx                      Home
  courses/page.tsx              Course catalogue with filters
  courses/[slug]/page.tsx       Course details (MongoDB-backed, falls back to sample data)
  courses/[slug]/learn/[lessonId]/  Lesson player (video/PDF, access-checked)
  login/, register/             Auth pages (wired to Firebase)
  dashboard/                    Student dashboard (Overview, Courses, Transactions, Profile)
  admin/                        Admin dashboard (Analytics, Orders, Students, Courses, Coupons)
  faculty/                      Faculty course list + curriculum manager
  mock-tests/                   Listing, instructions, timed attempt, result, leaderboard
  api/auth/                     session, logout, me
  api/courses/                  list + detail, MongoDB-backed
  api/orders/                   create, verify, mine (Razorpay)
  api/coupons/validate/
  api/progress/                 save/read per-lesson watch progress
  api/mock-tests/               list, detail, submit, leaderboard, attempt review
  api/dashboard/                my-courses, profile (student-facing API)
  api/admin/                    stats, orders, students, courses, coupons (admin-only)
  api/faculty/courses/          list, detail, chapters, lessons (faculty-facing API)
  layout.tsx, globals.css
components/
  ui/                           Button, Badge, Rating, SectionHeading, StatCounter
  layout/                       Header (session-aware), Footer, WhatsAppButton, BackToTop
  sections/                     Home page sections
  dashboard/                    Sidebar (student), AdminSidebar
  learn/                        VideoPlayer, PdfViewer
  course-card.tsx, course-detail-tabs.tsx, checkout-button.tsx
lib/
  data.ts                       Sample courses/categories/testimonials/FAQs/mock tests
  utils.ts                      cn() class merger, INR currency formatter
  db/connect.ts                 MongoDB connection singleton
  firebase/client.ts, admin.ts  Firebase client + Admin SDK setup
  auth/jwt.ts                   App session sign/verify (jose)
  auth/session.ts               Server-side getSession()/requireRole()
  auth/client-actions.ts        Client-side sign-in/up/out actions
  auth/use-session.ts           Client hook for the current session
  razorpay.ts                   Order creation + signature verification
  razorpay-client.ts            Browser-side checkout script loader
models/
  User.ts, Category.ts, Course.ts, Order.ts, Coupon.ts,
  Progress.ts, MockTest.ts, MockTestAttempt.ts
scripts/
  seed.ts                       Populate MongoDB from lib/data.ts (courses + mock tests)
  make-admin.ts                 Promote a user to admin/faculty by email
middleware.ts                   Role-based route protection
```

## What's next

Everything from the original brief now has a working implementation except:
- **Direct file upload** for videos/PDFs (Cloudinary/Firebase Storage) — faculty currently paste
  in a URL to already-hosted media; wiring up a signed-upload widget is the natural next step
- **Doubt-reply / support ticket system** — faculty replying to student questions on a lesson
- **Certificates**, **push notifications**, **SEO metadata pass** (sitemap, schema markup),
  and **admin analytics charts** (currently numbers, not graphs)

Any of these make a good focused next phase — happy to build whichever matters most to you.

## Deploying to Vercel

```bash
npm i -g vercel
vercel
```

Or connect the GitHub repo to Vercel's dashboard. Add all the `.env.local` variables under
**Project Settings → Environment Variables** before deploying — the build will otherwise fail
the same way it does locally without them (course/auth pages will just show "not configured"
errors rather than hard-crashing).

