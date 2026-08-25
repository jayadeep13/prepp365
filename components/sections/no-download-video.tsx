"use client";

export function NoDownloadVideo({ src, poster, className }: { src: string; poster?: string; className?: string }) {
  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption -- promotional video, no captions authored
    <video
      src={src}
      poster={poster}
      controls
      controlsList="nodownload noremoteplayback"
      disablePictureInPicture
      onContextMenu={(e) => e.preventDefault()}
      className={className}
    />
  );
}
