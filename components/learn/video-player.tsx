"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, CheckCircle2, Gauge, Maximize, Minimize } from "lucide-react";
import { cn } from "@/lib/utils";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function VideoPlayer({
  src,
  courseId,
  lessonId,
  initialPositionSeconds = 0,
  onComplete,
}: {
  src: string;
  courseId: string;
  lessonId: string;
  initialPositionSeconds?: number;
  onComplete?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100
  const [resumed, setResumed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const lastSavedRef = useRef(0);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current?.requestFullscreen();
    }
  }

  // Resume from saved position once metadata is loaded.
  function handleLoadedMetadata() {
    const video = videoRef.current;
    if (!video) return;
    if (initialPositionSeconds > 2 && initialPositionSeconds < video.duration - 5) {
      video.currentTime = initialPositionSeconds;
      setResumed(true);
    }
  }

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    setProgress(pct);

    // Save progress at most once every 5 seconds of playback.
    if (video.currentTime - lastSavedRef.current > 5) {
      lastSavedRef.current = video.currentTime;
      saveProgress(video.currentTime, video.duration, pct > 95);
    }
    if (pct > 95 && !completed) {
      setCompleted(true);
      saveProgress(video.currentTime, video.duration, true);
      onComplete?.();
    }
  }

  async function saveProgress(positionSeconds: number, durationSeconds: number, done: boolean) {
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, lessonId, positionSeconds, durationSeconds, completed: done }),
      });
    } catch {
      // Best-effort — a failed save shouldn't interrupt playback.
    }
  }

  // Save on unmount/navigation away.
  useEffect(() => {
    return () => {
      const video = videoRef.current;
      if (video && video.currentTime > 2) {
        saveProgress(video.currentTime, video.duration || 0, progress > 95);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  function setPlaybackSpeed(rate: number) {
    const video = videoRef.current;
    if (video) video.playbackRate = rate;
    setSpeed(rate);
    setSpeedMenuOpen(false);
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    video.currentTime = pct * video.duration;
  }

  return (
    <div ref={containerRef} className="rounded-card overflow-hidden bg-black">
      <div className="relative aspect-video">
        <video
          ref={videoRef}
          src={src}
          className="h-full w-full"
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onClick={togglePlay}
        />

        {resumed && (
          <div className="absolute top-3 right-3 rounded-full bg-black/70 px-3 py-1.5 text-[11px] font-semibold text-white flex items-center gap-1.5">
            <RotateCcw size={12} /> Resumed from where you left off
          </div>
        )}

        {completed && (
          <div className="absolute top-3 left-3 rounded-full bg-green-500/90 px-3 py-1.5 text-[11px] font-semibold text-white flex items-center gap-1.5">
            <CheckCircle2 size={12} /> Completed
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-ink px-4 py-3">
        <div
          onClick={handleSeek}
          className="h-1.5 w-full cursor-pointer rounded-full bg-white/15 mb-3 overflow-hidden"
        >
          <div className="h-full bg-brand-gradient" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-center justify-between">
          <button onClick={togglePlay} className="text-white grid h-8 w-8 place-items-center rounded-full hover:bg-white/10">
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleFullscreen}
              aria-label={fullscreen ? "Exit full screen" : "Full screen"}
              className="grid h-8 w-8 place-items-center rounded-full text-white hover:bg-white/10"
            >
              {fullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
            </button>

            <div className="relative">
              <button
                onClick={() => setSpeedMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
              >
                <Gauge size={13} /> {speed}x
              </button>
              {speedMenuOpen && (
                <div className="absolute bottom-full right-0 mb-2 rounded-xl bg-white shadow-glass-lg overflow-hidden">
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setPlaybackSpeed(s)}
                      className={cn(
                        "block w-full px-4 py-2 text-left text-xs font-semibold whitespace-nowrap",
                        s === speed ? "bg-purple-50 text-purple-700" : "text-ink-soft hover:bg-surface-tint"
                      )}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
