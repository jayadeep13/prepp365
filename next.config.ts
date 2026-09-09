import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse pulls in @napi-rs/canvas, a native binary dependency — bundling it
  // through webpack breaks at runtime in serverless functions, so it must be
  // left external and loaded directly from node_modules instead.
  serverExternalPackages: ["pdf-parse", "@napi-rs/canvas", "pdfjs-dist"],
  // Vercel's automatic file tracing can miss @napi-rs/canvas's platform-specific
  // .node binary (it's picked dynamically at runtime, which static tracing tools
  // often fail to detect), leaving the deployed function without it even though
  // serverExternalPackages fixed the webpack side. Explicitly ship the whole
  // package for the one route that needs it.
  outputFileTracingIncludes: {
    // @napi-rs/canvas installs its actual native binary as a separate,
    // platform-specific sibling package (e.g. @napi-rs/canvas-linux-x64-gnu on
    // Vercel's Linux build) — not inside @napi-rs/canvas itself — so both must
    // be covered, whichever platform package ends up installed at build time.
    // pdfjs-dist also loads its worker script (pdf.worker.mjs) dynamically at
    // runtime, which the automatic trace misses the same way.
    "/api/admin/mock-tests/[id]/parse-pdf": [
      "./node_modules/@napi-rs/canvas*/**",
      "./node_modules/pdfjs-dist/**",
    ],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
