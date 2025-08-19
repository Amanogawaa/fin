import { NextResponse } from "next/server";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("id");

    if (courseId) {
      const course = await db
        .select()
        .from(courses)
        .where(eq(courses.id, courseId));

      if (course.length === 0) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ course: course[0] });
    }

    const allCourses = await db.select().from(courses);
    return NextResponse.json({ courses: allCourses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
