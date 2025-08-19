import { db } from "@/db";
import { lessons, lessonResources, chapters } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import z from "zod";

const lessonSchema = z.object({
  lessons: z.array(
    z.object({
      lessonId: z.string(),
      title: z.string(),
      type: z.enum(["video", "article", "quiz", "assignment"]),
      description: z.string(),
      duration: z.string(),
      content: z.string().optional(),
      videoUrl: z.string().optional(),
      resources: z
        .array(
          z.object({
            title: z.string(),
            url: z.string(),
            type: z.enum(["pdf", "link", "doc", "image"]),
          })
        )
        .optional(),
    })
  ),
});

const generateLessonsPrompt = (args: {
  chapterTitle: string;
  chapterDescription: string;
  chapterOrder: number;
  estimatedDuration: string;
  courseName: string;
  level: string;
  language: string;
}) => `You are a course design expert. Based on the following chapter information, generate a structured set of lessons.

**Course Information**:
- Course Name: ${args.courseName}
- Level: ${args.level}
- Language: ${args.language}

**Chapter Information**:
- Chapter ${args.chapterOrder}: ${args.chapterTitle}
- Description: ${args.chapterDescription}
- Estimated Duration: ${args.estimatedDuration}

**Output Requirements**:
- Return ONLY a JSON object in this structure:
{
  "lessons": [
    {
      "lessonId": "1.1",
      "title": "Lesson Title",
      "type": "video | article | quiz | assignment",
      "duration": "e.g. 15m",
      "description": "1–2 sentence overview of what this lesson covers",
      "content": "Detailed lesson content for articles (optional)",
      "videoUrl": "Video URL for video lessons (optional)",
      "resources": [
        {
          "title": "Resource Title",
          "url": "https://example.com",
          "type": "pdf | link | doc | image"
        }
      ]
    }
  ]
}

**Instructions**:
- Create 3–6 lessons for this chapter.
- Each lesson must have a type:
  - "video" for conceptual/explainer lessons,
  - "article" for readings/notes,
  - "quiz" for knowledge checks,
  - "assignment" for practice/project.
- Distribute lesson durations so their total ≈ ${args.estimatedDuration}.
- Ensure lesson titles are clear, practical, and engaging.
- Tailor the complexity to match the course level (${args.level}).
- For "article" type lessons, include detailed content in markdown format.
- For "video" type lessons, you can suggest placeholder video URLs or leave empty.
- Include 1-3 relevant resources per lesson when appropriate.
- lessonId should follow format: "{chapterOrder}.{lessonNumber}" (e.g., "1.1", "1.2", etc.)

Return only the JSON object with the lessons array.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      chapterId,
      chapterTitle,
      chapterDescription,
      chapterOrder,
      estimatedDuration,
      courseName,
      level,
      language,
    } = body;

    // Validate required fields
    if (!chapterId || !chapterTitle || !courseName) {
      return NextResponse.json(
        {
          error: "Missing required fields: chapterId, chapterTitle, courseName",
        },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Missing GROQ_API_KEY environment variable" },
        { status: 500 }
      );
    }

    // Verify chapter exists
    const existingChapter = await db
      .select()
      .from(chapters)
      .where(eq(chapters.id, chapterId));

    if (existingChapter.length === 0) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    const lessonsPrompt = generateLessonsPrompt({
      chapterTitle,
      chapterDescription: chapterDescription || "",
      chapterOrder: chapterOrder || 1,
      estimatedDuration: estimatedDuration || "1h",
      courseName,
      level: level || "beginner",
      language: language || "en",
    });

    console.log("Generating lessons with prompt:", lessonsPrompt);

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: lessonsPrompt }],
          model: "llama-3.1-8b-instant",
          response_format: { type: "json_object" },
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Groq API error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    const parsed = JSON.parse(generatedContent);

    console.log("Groq API response received:", JSON.stringify(parsed, null, 2));

    // Validate the response
    const result = lessonSchema.parse(parsed);

    const storedLessons = [];

    // Insert lessons into database
    for (let index = 0; index < result.lessons.length; index++) {
      const lesson = result.lessons[index];

      // Extract lesson order from lessonId (e.g., "1.2" -> 2)
      const lessonOrder = lesson.lessonId.includes(".")
        ? parseInt(lesson.lessonId.split(".")[1])
        : index + 1;

      // Insert lesson
      const [insertedLesson] = await db
        .insert(lessons)
        .values({
          chapterId: chapterId,
          title: lesson.title,
          type: lesson.type,
          description: lesson.description,
          duration: lesson.duration,
          content: lesson.content || null,
          videoUrl: lesson.videoUrl || null,
          order: lessonOrder,
        })
        .returning();

      // Insert lesson resources if provided
      if (lesson.resources && lesson.resources.length > 0) {
        const resourcesData = lesson.resources.map((resource) => ({
          lessonId: insertedLesson.id,
          title: resource.title,
          url: resource.url,
          type: resource.type,
        }));

        await db.insert(lessonResources).values(resourcesData);
      }

      storedLessons.push({
        ...insertedLesson,
        resources: lesson.resources || [],
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${storedLessons.length} lessons for chapter: ${chapterTitle}`,
      lessons: result.lessons,
      storedLessons: storedLessons,
    });
  } catch (error) {
    console.error("Lesson generation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid lesson data structure",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: `Failed to generate lessons: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
