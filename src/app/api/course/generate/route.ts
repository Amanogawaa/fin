import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { courses } from "@/db/schema";

const courseSchema = z.object({
  course: z.object({
    name: z.string(),
    subtitle: z.string().optional(),
    description: z.string(),
    category: z.string(),
    topic: z.string(),
    level: z.string(),
    language: z.string().default("en"),
    prerequisites: z.string().optional(),
    learningOutcomes: z.array(z.string()),
    duration: z.string(),
    noOfChapters: z.number(),
    publish: z.boolean(),
    includeCertificate: z.boolean(),
    courseBanner: z.string(),
  }),
});

const generateCoursePrompt = (args: {
  category: string;
  topic: string;
  level: string;
  duration: string;
  noOfChapters: number;
  language: string;
}) => `You are a course design expert. Generate course metadata (overview information only) based on the specifications below. Do NOT generate chapter content - only the course overview.

**Input Specifications**:
- Category: ${args.category}
- Topic: ${args.topic}
- Level: ${args.level} (use exactly: "beginner", "intermediate", or "advanced")
- Total Duration: ${args.duration}
- Number of Chapters: ${args.noOfChapters}
- Language: ${args.language}

**Required JSON Structure**:
Return a JSON object with this exact structure:
{
  "course": {
    "name": "Course Name Here",
    "subtitle": "Optional subtitle",
    "description": "Course description",
    "category": "${args.category}",
    "topic": "${args.topic}",
    "level": "${args.level}",
    "language": "${args.language}",
    "prerequisites": "Prerequisites text",
    "learningOutcomes": ["outcome1", "outcome2", "..."],
    "duration": "${args.duration}",
    "noOfChapters": ${args.noOfChapters},
    "publish": false,
    "includeCertificate": false,
    "courseBanner": "/images/banners/${args.topic
      .toLowerCase()
      .replace(/\s+/g, "-")}-banner.jpg"
  }
}

**Instructions**:
- Generate a compelling course name (concise, professional)
- Create an optional subtitle (brief, catchy tagline)
- Write a comprehensive description (200-300 words) covering what students will learn
- List 5-8 specific learning outcomes (what students will be able to do after completion)
- Include prerequisites as a string (e.g., "Basic understanding of programming concepts" or "None" for beginners)
- Set publish to true for intermediate/advanced courses, false for beginner courses
- Set includeCertificate to true for courses longer than 4 hours
- Ensure all content is appropriate for the specified level and topic

**Level Guidelines**:
- beginner: Assumes no prior knowledge, focuses on fundamentals
- intermediate: Assumes basic knowledge, builds practical skills
- advanced: Assumes solid foundation, covers complex topics and best practices

Return only the course metadata as a JSON object wrapped in {"course": {...}}.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, topic, level, duration, noOfChapters, language } = body;

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Missing GROQ_API_KEY environment variable" },
        { status: 500 }
      );
    }

    console.log("Starting course generation with args:", body);

    const coursePrompt = generateCoursePrompt({
      category,
      topic,
      level,
      duration,
      noOfChapters,
      language,
    });

    console.log("Calling Groq API...");

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: coursePrompt,
            },
          ],
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

    // Validate with Zod
    const result = courseSchema.parse(parsed);

    // Ensure consistency with input parameters
    result.course.category = category;
    result.course.topic = topic;
    result.course.level = level;
    result.course.duration = duration;
    result.course.noOfChapters = noOfChapters;
    result.course.language = language;

    // Store in database using Drizzle
    const [insertedCourse] = await db
      .insert(courses)
      .values({
        name: result.course.name,
        subtitle: result.course.subtitle,
        description: result.course.description,
        category: result.course.category,
        topic: result.course.topic,
        level: result.course.level,
        language: result.course.language,
        prerequisites: result.course.prerequisites,
        learningOutcomes: JSON.stringify(result.course.learningOutcomes),
        duration: result.course.duration,
        noOfChapters: result.course.noOfChapters,
        publish: result.course.publish,
        includeCertificate: result.course.includeCertificate,
        bannerUrl: result.course.courseBanner,
      })
      .returning();

    console.log("Course stored with ID:", insertedCourse.id);

    return NextResponse.json({
      success: true,
      course: {
        ...insertedCourse,
        learningOutcomes: result.course.learningOutcomes, // Return as array
      },
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
