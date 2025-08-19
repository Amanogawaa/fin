import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";

export const generateCourse = async (prompt: string) => {
  const result = await generateText({
    model: groq("llama3-8b-8192"),

    prompt: prompt,
    temperature: 0.7,
  });

  return result.text;
};

export const generateCourseOutline = async (topic: string, level: string) => {
  const prompt = `Create a detailed course outline for "${topic}" at ${level} level. Include chapters, lessons, and learning objectives.`;

  return await generateCourse(prompt);
};

export const generateLessonContent = async (
  lessonTitle: string,
  chapterContext: string
) => {
  const prompt = `Create lesson content for "${lessonTitle}" within the context of: ${chapterContext}. Include explanations, examples, and practical exercises.`;

  return await generateCourse(prompt);
};
