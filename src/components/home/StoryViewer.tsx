"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { StoryItem } from "@/types/api";
import { apiFetch } from "@/lib/api-client";

interface StoryViewerProps {
  stories: StoryItem[];
  initialIndex: number;
  onClose: () => void;
}

export function StoryViewer({ stories, initialIndex, onClose }: StoryViewerProps) {
  const [storyIndex, setStoryIndex] = useState(initialIndex);
  const [slideIndex, setSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const rafRef = useRef<number | null>(null);

  const story = stories[storyIndex];
  const slide = story?.slides[slideIndex];

  useEffect(() => {
    if (!story) return;
    apiFetch(`/api/stories/${story.id}/view`, { method: "POST" }).catch(() => undefined);
  }, [story?.id]);

  useEffect(() => {
    if (!slide || paused) return;
    setProgress(0);
    const duration = slide.durationMs || 5000;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);
      if (pct >= 100) {
        goNext();
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyIndex, slideIndex, paused]);

  function goNext() {
    if (!story) return;
    if (slideIndex < story.slides.length - 1) {
      setSlideIndex((i) => i + 1);
    } else if (storyIndex < stories.length - 1) {
      setStoryIndex((i) => i + 1);
      setSlideIndex(0);
    } else {
      onClose();
    }
  }

  function goPrev() {
    if (slideIndex > 0) {
      setSlideIndex((i) => i - 1);
    } else if (storyIndex > 0) {
      setStoryIndex((i) => i - 1);
      setSlideIndex(stories[storyIndex - 1].slides.length - 1);
    }
  }

  if (!story || !slide) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] flex items-center justify-center bg-black safe-top safe-bottom"
      >
        <div className="relative h-full w-full max-w-md">
          <div className="absolute inset-x-2 top-3 z-20 flex gap-1">
            {story.slides.map((s, i) => (
              <div key={s.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
                <div
                  className="h-full bg-white transition-[width]"
                  style={{
                    width: i < slideIndex ? "100%" : i === slideIndex ? `${progress}%` : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="absolute right-3 top-8 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white"
          >
            <X size={18} />
          </button>

          <motion.div
            key={slide.id}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            className="relative h-full w-full"
            onPointerDown={() => setPaused(true)}
            onPointerUp={() => setPaused(false)}
          >
            <Image src={slide.imageUrl} alt={slide.title} fill className="object-cover" priority />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 pb-10">
              <h3 className="text-lg font-bold text-white">{slide.title}</h3>
              {slide.description && <p className="mt-1 text-sm text-white/80">{slide.description}</p>}
              {slide.linkText && (
                <button className="mt-3 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink-900">
                  {slide.linkText}
                </button>
              )}
            </div>
          </motion.div>

          <button onClick={goPrev} className="absolute left-0 top-0 h-full w-1/3" aria-label="Oldingi" />
          <button onClick={goNext} className="absolute right-0 top-0 h-full w-1/3" aria-label="Keyingi" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
