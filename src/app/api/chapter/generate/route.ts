import { db } from "@/db";
import { chapters } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const chapterSchema = z.object({
  chapters: z.array(
    z.object({
      chapterId: z.number(),
      title: z.string(),
      description: z.string(),
      estimatedDuration: z.string(),
      lessons: z.array(
        z.object({
          lessonId: z.string(),
          title: z.string(),
          type: z.string(),
          duration: z.string(),
          description: z.string(),
        })
      ),
    })
  ),
});

const generateChaptersPrompt = (args: {
  courseId: string;
  title: string;
  description: string;
  learningOutcomes: string[];
  duration: string;
  noOfChapters: number;
  level: string;
  language: string;
}) => `You are a course design expert. Based on the course details below, generate a structured chapter outline.
  
  **Course Information**:
  - Course Name: ${args.title}
  - Description: ${args.description}
  - Learning Outcomes: ${args.learningOutcomes}
  - Total Duration: ${args.duration}
  - Number of Chapters: ${args.noOfChapters}
  - Level: ${args.level}
  - Language: ${args.language}
  
  **Output Requirements**:
  - Return ONLY a JSON object in this structure:
  {
    "chapters": [
      {
        "chapterId": 1,
        "title": "Chapter Title",
        "description": "Brief overview of the chapter (50-100 words)",
        "estimatedDuration": "e.g. 1h 15m",
        "lessons": [
          {
            "lessonId": "1.1",
            "title": "Lesson Title",
            "type": "video | article | quiz | assignment",
            "duration": "e.g. 15m",
            "description": "1-2 sentence overview of what this lesson covers"
          }
        ]
      }
    ]
  }
  
  **Instructions**:
  - Divide the course logically into ${args.noOfChapters} chapters that progressively build knowledge.
  - Each chapter should have 3–6 lessons.
  - Each lesson should specify a type:
    - Use "video" for conceptual/explainer lessons,
    - "article" for readings/notes,
    - "quiz" for knowledge checks,
    - "assignment" for practice/project.
  - Balance the duration so the total across all chapters roughly matches ${args.duration}.
  - Make chapter/lesson titles clear and engaging.
  - Ensure complexity matches the level: 
    - Beginner → fundamentals, gentle intro
    - Intermediate → hands-on skills, practical use cases
    - Advanced → deep dives, best practices, complex applications
  
  Return only the JSON object with the chapters array.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      courseId,
      title,
      description,
      learningOutcomes,
      duration,
      noOfChapters,
      level,
      language,
    } = body;

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Missing GROQ_API_KEY environment variable" },
        { status: 500 }
      );
    }

    const chapterPrompt = generateChaptersPrompt({
      courseId,
      title,
      description,
      learningOutcomes,
      duration,
      noOfChapters,
      level,
      language,
    });

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: chapterPrompt }],
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

    const result = chapterSchema.parse(parsed);

    const storedChapters = [];

    for (const chapter of result.chapters) {
      // Insert chapter
      const [insertedChapter] = await db
        .insert(chapters)
        .values({
          courseId: courseId,
          title: chapter.title,
          description: chapter.description,
          estimatedDuration: chapter.estimatedDuration,
          order: chapter.chapterId,
        })
        .returning();

      // Insert lessons for this chapter
      // const storedLessons = [];
      // for (const lesson of chapter.lessons) {
      //   const [insertedLesson] = await db
      //     .insert(lessons)
      //     .values({
      //       chapterId: insertedChapter.id,
      //       title: lesson.title,
      //       type: lesson.type,
      //       description: lesson.description,
      //       duration: lesson.duration,
      //       order: parseInt(lesson.lessonId.split(".")[1]), // Extract lesson number
      //     })
      //     .returning();

      //   storedLessons.push(insertedLesson);
      // }

      storedChapters.push({
        ...insertedChapter,
      });
    }

    return NextResponse.json({
      success: true,
      chapters: result.chapters,
    });
  } catch (error) {
    console.error("Course generation error:", error);
    return NextResponse.json(
      {
        error: `Failed to generate course: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
