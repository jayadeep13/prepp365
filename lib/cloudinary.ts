import { v2 as cloudinary } from "cloudinary";

/**
 * Lesson videos are uploaded with delivery type "authenticated" (see
 * components/admin/cloudinary-uploader.tsx `restricted` prop), so the plain
 * secure_url stored on the lesson 404s without a signature. This generates
 * that signed URL on demand, server-side, only after the caller has already
 * verified the viewer has purchased access.
 */
export function signedVideoUrl(publicId: string): string | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;

  return cloudinary.url(publicId, {
    resource_type: "video",
    type: "authenticated",
    sign_url: true,
    secure: true,
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}
