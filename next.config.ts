import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse pulls in @napi-rs/canvas, a native binary dependency — bundling it
  // through webpack breaks at runtime in serverless functions, so it must be
  // left external and loaded directly from node_modules instead.
  serverExternalPackages: ["pdf-parse", "@napi-rs/canvas", "pdfjs-dist"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
