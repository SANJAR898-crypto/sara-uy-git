import { NextResponse } from "next/server";
import { db } from "@/db";
import { stories, storySlides } from "@/db/schema";
import { asc, desc } from "drizzle-orm";
import { handleApiError, jsonError } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-helpers";
import { z } from "zod";

const storyCreateSchema = z.object({
  title: z.string().min(1).max(128),
  coverUrl: z.string().url(),
  category: z.enum(["news", "offers", "developers", "agents"]),
  slides: z
    .array(
      z.object({
        imageUrl: z.string().url(),
        title: z.string().min(1).max(200),
        description: z.string().max(500).optional(),
        linkText: z.string().max(64).optional(),
        linkUrl: z.string().url().optional(),
      }),
    )
    .min(1),
});

export async function GET() {
  try {
    await requireAdmin();
    const all = await db.select().from(stories).orderBy(desc(stories.createdAt));
    const slides = await db.select().from(storySlides).orderBy(asc(storySlides.sortOrder));
    const items = all.map((s) => ({ ...s, slides: slides.filter((sl) => sl.storyId === s.id) }));
    return NextResponse.json({ items });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = storyCreateSchema.parse(body);

    const [created] = await db
      .insert(stories)
      .values({ title: data.title, coverUrl: data.coverUrl, category: data.category })
      .returning();

    await db.insert(storySlides).values(
      data.slides.map((slide, index) => ({
        storyId: created.id,
        imageUrl: slide.imageUrl,
        title: slide.title,
        description: slide.description,
        linkText: slide.linkText,
        linkUrl: slide.linkUrl,
        sortOrder: index,
      })),
    );

    return NextResponse.json({ story: created }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
