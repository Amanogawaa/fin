// Updated Page Component with Lesson Generation
"use client";

import {
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  Play,
  Plus,
  Loader2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Lesson {
  id: string;
  chapterId: string;
  title: string;
  type: string;
  description: string;
  duration: string;
  videoUrl?: string;
  content?: string;
  order: number;
}

interface Chapter {
  id: string;
  courseId: string;
  title: string;
  description: string;
  estimatedDuration: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  name: string;
  subtitle?: string;
  description: string;
  category: string;
  topic: string;
  level: string;
  language: string;
  prerequisites?: string;
  learningOutcomes: string;
  duration: string;
  noOfChapters: number;
  publish: boolean;
  includeCertificate: boolean;
  bannerUrl?: string;
  lastUpdated: string;
}

export default function Page() {
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingChapters, setGeneratingChapters] = useState(false);
  const [generatingLessons, setGeneratingLessons] = useState<string | null>(
    null
  ); // Track which chapter is generating lessons
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const courseId = params.slug as string;
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch course data
        const courseResponse = await fetch(`/api/course?id=${courseId}`);
        if (!courseResponse.ok) {
          throw new Error("Failed to fetch course");
        }
        const courseData = await courseResponse.json();
        setCourseData(courseData.course);

        // Fetch chapters data
        const chaptersResponse = await fetch(
          `/api/chapter?courseId=${courseId}`
        );
        if (chaptersResponse.ok) {
          const chaptersData = await chaptersResponse.json();
          setChapters(chaptersData.chapters);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load course");
      } finally {
        setLoading(false);
      }
    }

    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  const handleGenerateChapters = async () => {
    if (!courseData) return;

    setGeneratingChapters(true);
    try {
      const response = await fetch("/api/chapter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: courseData.id,
          title: courseData.name,
          description: courseData.description,
          learningOutcomes: JSON.parse(courseData.learningOutcomes),
          duration: courseData.duration,
          noOfChapters: courseData.noOfChapters,
          level: courseData.level,
          language: courseData.language,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate chapters");
      }

      const data = await response.json();
      console.log("Generated chapters:", data.chapters);

      // Refresh chapters data
      const chaptersResponse = await fetch(`/api/chapter?courseId=${courseId}`);
      if (chaptersResponse.ok) {
        const chaptersData = await chaptersResponse.json();
        setChapters(chaptersData.chapters);
      }
    } catch (error) {
      console.error("Error generating chapters:", error);
      setError("Failed to generate chapters");
    } finally {
      setGeneratingChapters(false);
    }
  };

  // New function to handle lesson generation
  const handleGenerateLessons = async (chapter: Chapter) => {
    if (!courseData) return;

    setGeneratingLessons(chapter.id);
    try {
      const response = await fetch("/api/lessons/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          chapterDescription: chapter.description,
          chapterOrder: chapter.order,
          estimatedDuration: chapter.estimatedDuration,
          courseName: courseData.name,
          level: courseData.level,
          language: courseData.language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate lessons");
      }

      const data = await response.json();
      console.log("Generated lessons:", data.lessons);

      // Refresh lessons for this specific chapter
      await fetchLessonsForChapter(chapter.id);
    } catch (error) {
      console.error("Error generating lessons:", error);
      setError(`Failed to generate lessons for ${chapter.title}`);
    } finally {
      setGeneratingLessons(null);
    }
  };

  // Function to fetch lessons for a specific chapter
  const fetchLessonsForChapter = async (chapterId: string) => {
    try {
      const response = await fetch(`/api/lessons?chapterId=${chapterId}`);
      if (response.ok) {
        const lessonsData = await response.json();

        // Update the specific chapter with its lessons
        setChapters((prevChapters) =>
          prevChapters.map((chapter) =>
            chapter.id === chapterId
              ? { ...chapter, lessons: lessonsData.lessons }
              : chapter
          )
        );
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
    }
  };

  const handleLessonClick = (lessonId: string) => {
    router.push(`/course/${courseId}/lesson/${lessonId}`);
  };

  // Check if chapter has lessons
  const hasLessons = (chapter: Chapter) => {
    return chapter.lessons && chapter.lessons.length > 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl">Loading course...</div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl">Course not found</div>
      </div>
    );
  }

  // Parse learning outcomes from JSON string
  const learningOutcomes = courseData.learningOutcomes
    ? JSON.parse(courseData.learningOutcomes)
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Same as before */}
      <div className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Course Info */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    {courseData.category}
                  </span>
                  <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium capitalize">
                    {courseData.level}
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                  {courseData.name}
                </h1>

                {courseData.subtitle && (
                  <p className="text-xl text-muted-foreground">
                    {courseData.subtitle}
                  </p>
                )}
              </div>

              {/* Course Stats */}
              <div className="flex flex-wrap gap-6 text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>{courseData.duration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span>{courseData.noOfChapters} chapters</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border sticky top-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-card-foreground mb-4">
                    Course Details
                  </h3>
                  <div className="space-y-3 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Topic:</span>
                      <span className="text-card-foreground font-medium">
                        {courseData.topic}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="text-card-foreground font-medium">
                        {courseData.duration}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Level:</span>
                      <span className="text-card-foreground font-medium capitalize">
                        {courseData.level}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Language:</span>
                      <span className="text-card-foreground font-medium capitalize">
                        {courseData.language}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Prerequisites:</span>
                      <span className="text-card-foreground font-medium">
                        {courseData.prerequisites || "None"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Certificate */}
                {courseData.includeCertificate && (
                  <div className="border-t border-border pt-6">
                    <div className="flex items-center space-x-3 text-primary">
                      <Award className="w-6 h-6" />
                      <span className="font-medium">
                        Certificate of Completion
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* About Course */}
            <div className="bg-card rounded-2xl p-8 border border-border">
              <h2 className="text-2xl font-bold text-card-foreground mb-6">
                About This Course
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {courseData.description}
              </p>
            </div>

            {/* Curriculum - Updated Section */}
            <div className="bg-card rounded-2xl p-8 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-card-foreground">
                  Curriculum
                </h2>
                {chapters.length === 0 && (
                  <button
                    onClick={handleGenerateChapters}
                    disabled={generatingChapters}
                    className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generatingChapters ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    <span>
                      {generatingChapters
                        ? "Generating..."
                        : "Generate Chapters"}
                    </span>
                  </button>
                )}
              </div>

              {chapters.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {generatingChapters
                      ? "Generating chapters for your course..."
                      : "No chapters generated yet. Click the button above to generate chapters for this course."}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {chapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      className="border border-border rounded-lg p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-card-foreground">
                            Chapter {chapter.order}: {chapter.title}
                          </h3>
                          {chapter.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {chapter.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{chapter.estimatedDuration}</span>
                          </div>

                          {/* Generate Lessons Button */}
                          {!hasLessons(chapter) && (
                            <button
                              onClick={() => handleGenerateLessons(chapter)}
                              disabled={generatingLessons === chapter.id}
                              className="flex items-center space-x-2 bg-secondary text-secondary-foreground px-3 py-1 rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                              {generatingLessons === chapter.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Plus className="w-3 h-3" />
                              )}
                              <span>
                                {generatingLessons === chapter.id
                                  ? "Generating..."
                                  : "Generate Lessons"}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Lessons Display */}
                      {hasLessons(chapter) ? (
                        <div className="space-y-3">
                          {chapter.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              onClick={() => handleLessonClick(lesson.id)}
                              className="flex items-center justify-between p-3 bg-muted rounded-md"
                            >
                              <div className="flex items-center space-x-3">
                                <Play className="w-4 h-4 text-primary" />
                                <div>
                                  <p className="text-sm font-medium text-card-foreground">
                                    {lesson.title}
                                  </p>
                                  {lesson.description && (
                                    <p className="text-xs text-muted-foreground">
                                      {lesson.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <span className="capitalize">
                                  {lesson.type}
                                </span>
                                <span>•</span>
                                <span>{lesson.duration}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : generatingLessons === chapter.id ? (
                        <div className="text-center py-8">
                          <Loader2 className="w-8 h-8 text-primary mx-auto mb-2 animate-spin" />
                          <p className="text-sm text-muted-foreground">
                            Generating lessons for this chapter...
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                          <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            No lessons generated yet. Click Generate Lessons to
                            create lessons for this chapter.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Same as before */}
          <div className="space-y-8">
            <div className="bg-card rounded-2xl p-8 border border-border">
              <h3 className="text-xl font-bold text-card-foreground mb-6">
                Skills You&apos;ll Learn
              </h3>
              <div className="space-y-3">
                {learningOutcomes.map((outcome: string, index: number) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
