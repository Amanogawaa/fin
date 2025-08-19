import CourseCard from "@/components/course-card";

export const dynamic = "force-dynamic"; // ⬅️ mark page as always dynamic

async function getCourses() {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/api/course`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch courses");
    }

    const data = await response.json();
    return data.courses || [];
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
}

export default async function CoursePage() {
  const courses = await getCourses();

  return (
    <main className="flex h-full w-full flex-col">
      <CourseCard courses={courses} />
    </main>
  );
}
