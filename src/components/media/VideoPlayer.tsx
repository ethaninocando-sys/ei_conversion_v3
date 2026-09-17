"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { VideoSlotKey } from "@/content/types";
import { videos, mediaUrl } from "@/content/videos";
import { track } from "@/lib/analytics";

interface Props {
  slot: VideoSlotKey;
  /** Only the home film should be priority-loaded. */
  priority?: boolean;
}

function formatDuration(seconds?: number): string | null {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Square-cornered frame, hairline border, ink play block. Before the click
 * there is no <video> element at all, so no MP4 bytes load, not even metadata.
 */
export function VideoPlayer({ slot, priority = false }: Props) {
  const meta = videos[slot];
  const media = mediaUrl(slot);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const quartiles = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!playing) return;
    videoRef.current?.play().catch(() => {
      /* autoplay policy can reject; the controls still work */
    });
  }, [playing]);

  if (!media) {
    return (
      <figure className="border border-rule bg-paper-dim">
        <div className="flex aspect-video w-full items-end p-6 md:p-8">
          <figcaption>
            <p className="marker">Film</p>
            <p className="display display-md mt-2 max-w-md">{meta.title}</p>
            <p className="mt-3 text-muted">Not recorded yet.</p>
          </figcaption>
        </div>
      </figure>
    );
  }

  const duration = formatDuration(meta.durationSeconds);

  if (playing) {
    return (
      <video
        ref={videoRef}
        className="aspect-video w-full border border-rule bg-ink"
        controls
        playsInline
        preload="none"
        poster={media.poster}
        src={media.src}
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          if (!el.duration) return;
          const pct = Math.floor((el.currentTime / el.duration) * 100);
          for (const q of [25, 50, 75, 100]) {
            if (pct >= q && !quartiles.current.has(q)) {
              quartiles.current.add(q);
              track("video_progress", { slot, pct: q });
            }
          }
        }}
        onEnded={() => {
          if (!quartiles.current.has(100)) {
            quartiles.current.add(100);
            track("video_progress", { slot, pct: 100 });
          }
        }}
      >
        <track kind="captions" />
      </video>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden border border-rule bg-ink">
      <Image
        src={media.poster}
        alt=""
        fill
        sizes="(min-width: 1248px) 1248px, 100vw"
        priority={priority}
        className="object-cover opacity-90"
      />
      <button
        type="button"
        className="absolute inset-0 flex items-end p-6 text-left md:p-8"
        onClick={() => {
          track("video_play", { slot });
          setPlaying(true);
        }}
      >
        <span className="action">
          <span aria-hidden="true">&#9654;</span>
          Play: {meta.title}
        </span>
      </button>
      {duration && <span className="marker absolute right-5 top-5 !text-paper/70">{duration}</span>}
    </div>
  );
}
