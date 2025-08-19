import { NextResponse } from "next/server";
import { db } from "@/db";
import { chapters, lessons } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Get chapters for the course
    const courseChapters = await db
      .select({
        id: chapters.id,
        courseId: chapters.courseId,
        title: chapters.title,
        description: chapters.description,
        estimatedDuration: chapters.estimatedDuration,
        order: chapters.order,
      })
      .from(chapters)
      .where(eq(chapters.courseId, courseId))
      .orderBy(asc(chapters.order));

    // Get lessons for each chapter
    const chaptersWithLessons = await Promise.all(
      courseChapters.map(async (chapter) => {
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
          .where(eq(lessons.chapterId, chapter.id))
          .orderBy(asc(lessons.order));

        return {
          ...chapter,
          lessons: chapterLessons,
        };
      })
    );

    return NextResponse.json({ chapters: chaptersWithLessons });
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return NextResponse.json(
      { error: "Failed to fetch chapters" },
      { status: 500 }
    );
  }
}
