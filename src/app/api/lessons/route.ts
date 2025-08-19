import { lessons, lessonResources } from "@/db/schema";
import { db } from "@/index";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get("chapterId");

    if (!chapterId) {
      return NextResponse.json(
        { error: "chapterId query parameter is required" },
        { status: 400 }
      );
    }

    const chapterLessons = await db
      .select({
        id: lessons.id,
        chapterId: lessons.chapterId,
        title: lessons.title,
        type: lessons.type,
        description: lessons.description,
        duration: lessons.duration,
        videoUrl: lessons.videoUrl,
        content: lessons.content,
        order: lessons.order,
      })
      .from(lessons)
      .where(eq(lessons.chapterId, chapterId))
      .orderBy(lessons.order);

    // Fetch resources for each lesson
    const lessonsWithResources = [];
    for (const lesson of chapterLessons) {
      const resources = await db
        .select()
        .from(lessonResources)
        .where(eq(lessonResources.lessonId, lesson.id));

      lessonsWithResources.push({
        ...lesson,
        resources,
      });
    }

    return NextResponse.json({
      success: true,
      lessons: lessonsWithResources,
    });
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}
