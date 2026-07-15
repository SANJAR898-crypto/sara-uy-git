"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { useStories } from "@/hooks/useReferenceData";
import { StoryViewer } from "@/components/home/StoryViewer";

export function StoriesBar() {
  const { data, isLoading } = useStories();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const stories = data?.stories ?? [];

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto px-4 no-scrollbar">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex shrink-0 flex-col items-center gap-1.5">
            <div className="skeleton h-16 w-16 rounded-full" />
            <div className="skeleton h-2.5 w-12 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!stories.length) return null;

  return (
    <>
      <div className="flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar">
        {stories.map((story, index) => (
          <motion.button
            key={story.id}
            onClick={() => setActiveIndex(index)}
            whileTap={{ scale: 0.92 }}
            className="flex shrink-0 flex-col items-center gap-1.5"
          >
            <div className="rounded-full bg-gradient-to-br from-brand-400 via-brand-500 to-gold-500 p-[2.5px]">
              <div className="rounded-full bg-white p-[2px]">
                <div className="relative h-14 w-14 overflow-hidden rounded-full">
                  <Image src={story.coverUrl} alt={story.title} fill className="object-cover" sizes="56px" />
                </div>
              </div>
            </div>
            <span className="max-w-[64px] truncate text-[11px] font-medium text-ink-600">{story.title}</span>
          </motion.button>
        ))}
      </div>

      {activeIndex !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </>
  );
}
