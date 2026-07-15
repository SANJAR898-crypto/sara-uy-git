import { NextResponse } from "next/server";
import { db } from "@/db";
import { stories, storySlides } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { handleApiError } from "@/lib/api-utils";

export async function GET() {
  try {
    const activeStories = await db
      .select()
      .from(stories)
      .where(eq(stories.isActive, true))
      .orderBy(asc(stories.sortOrder));

    const slides = await db.select().from(storySlides).orderBy(asc(storySlides.sortOrder));

    const result = activeStories.map((story) => ({
      ...story,
      slides: slides.filter((s) => s.storyId === story.id),
    }));

    return NextResponse.json({ stories: result });
  } catch (error) {
    return handleApiError(error);
  }
}
