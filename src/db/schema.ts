import { sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  foreignKey,
  pgPolicy,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid().primaryKey().notNull(),
    email: text(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [table.id],
      name: "users_id_fkey",
    }).onDelete("cascade"),
    pgPolicy("Users can update their own data", {
      as: "permissive",
      for: "update",
      to: ["public"],
      using: sql`(auth.uid() = id)`,
    }),
    pgPolicy("Users can view their own data", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
  ]
);
// 1. Courses
export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 500 }),
  description: text("description").notNull(),
  bannerUrl: text("banner_url"),
  category: varchar("category", { length: 100 }).notNull(),
  topic: varchar("topic", { length: 100 }).notNull(),
  level: varchar("level", { length: 50 }).notNull(), // beginner, intermediate, advanced
  language: varchar("language", { length: 10 }).default("en"),
  prerequisites: text("prerequisites"), // store JSON string or text array
  learningOutcomes: text("learning_outcomes"), // same
  duration: varchar("duration", { length: 50 }), // e.g. "8h 30m"
  noOfChapters: integer("no_of_chapters").default(0),
  publish: boolean("publish").default(false),
  includeCertificate: boolean("include_certificate").default(false),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// 2. Instructors
export const instructors = pgTable("instructors", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  bio: text("bio").notNull(),
  avatarUrl: text("avatar_url"),
});

// 3. Course-Instructors (many-to-many)
export const courseInstructors = pgTable("course_instructors", {
  courseId: uuid("course_id")
    .references(() => courses.id)
    .notNull(),
  instructorId: uuid("instructor_id")
    .references(() => instructors.id)
    .notNull(),
});

// 4. Chapters
export const chapters = pgTable("chapters", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id")
    .references(() => courses.id)
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  estimatedDuration: varchar("estimated_duration", { length: 50 }),
  order: integer("order").notNull(), // ordering in course
});

// 5. Lessons
export const lessons = pgTable("lessons", {
  id: uuid("id").defaultRandom().primaryKey(),
  chapterId: uuid("chapter_id")
    .references(() => chapters.id)
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // video, article, quiz, assignment
  description: text("description"),
  duration: varchar("duration", { length: 50 }),
  videoUrl: text("video_url"),
  content: text("content"), // markdown or HTML for articles
  order: integer("order").notNull(),
});

// 6. Lesson Resources
export const lessonResources = pgTable("lesson_resources", {
  id: uuid("id").defaultRandom().primaryKey(),
  lessonId: uuid("lesson_id")
    .references(() => lessons.id)
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  url: text("url").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // pdf, link, doc, image
});

// 7. Quizzes (attached to lessons of type "quiz")
export const quizzes = pgTable("quizzes", {
  id: uuid("id").defaultRandom().primaryKey(),
  lessonId: uuid("lesson_id")
    .references(() => lessons.id)
    .notNull()
    .unique(), // 1 quiz per lesson
});

// 8. Quiz Questions
export const quizQuestions = pgTable("quiz_questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  quizId: uuid("quiz_id")
    .references(() => quizzes.id)
    .notNull(),
  question: text("question").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // mcq, true_false, short_answer
  correctAnswer: text("correct_answer"),
  explanation: text("explanation"),
});

// 9. Quiz Options (for MCQ)
export const quizOptions = pgTable("quiz_options", {
  id: uuid("id").defaultRandom().primaryKey(),
  questionId: uuid("question_id")
    .references(() => quizQuestions.id)
    .notNull(),
  optionText: text("option_text").notNull(),
});
