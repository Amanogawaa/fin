// "use client";

// import { useParams, useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import {
//   ArrowLeft,
//   Clock,
//   BookOpen,
//   Play,
//   FileText,
//   HelpCircle,
//   CheckSquare,
// } from "lucide-react";

// interface Lesson {
//   id: string;
//   chapterId: string;
//   title: string;
//   type: string;
//   description: string;
//   duration: string;
//   videoUrl?: string;
//   content?: string;
//   order: number;
//   resources?: LessonResource[];
// }

// interface LessonResource {
//   id: string;
//   title: string;
//   url: string;
//   type: string;
// }

// interface Chapter {
//   id: string;
//   title: string;
//   description: string;
//   order: number;
// }

// interface Course {
//   id: string;
//   name: string;
//   subtitle?: string;
// }

// export default function LessonPage() {
//   const [lesson, setLesson] = useState<Lesson | null>(null);
//   const [chapter, setChapter] = useState<Chapter | null>(null);
//   const [course, setCourse] = useState<Course | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const params = useParams();
//   const router = useRouter();

//   const courseId = params.courseId as string;
//   const chapterId = params.chapterId as string;
//   const lessonId = params.lessonId as string;

//   useEffect(() => {
//     async function fetchLessonData() {
//       try {
//         setLoading(true);

//         // Fetch lesson details
//         const lessonResponse = await fetch(`/api/lesson?id=${lessonId}`);
//         if (!lessonResponse.ok) {
//           throw new Error("Failed to fetch lesson");
//         }
//         const lessonData = await lessonResponse.json();
//         setLesson(lessonData.lesson);

//         // Fetch chapter details
//         const chapterResponse = await fetch(`/api/chapter?id=${chapterId}`);
//         if (chapterResponse.ok) {
//           const chapterData = await chapterResponse.json();
//           setChapter(chapterData.chapter);
//         }

//         // Fetch course details
//         const courseResponse = await fetch(`/api/course?id=${courseId}`);
//         if (courseResponse.ok) {
//           const courseData = await courseResponse.json();
//           setCourse(courseData.course);
//         }
//       } catch (err) {
//         setError(err instanceof Error ? err.message : "Failed to load lesson");
//       } finally {
//         setLoading(false);
//       }
//     }

//     if (lessonId && chapterId && courseId) {
//       fetchLessonData();
//     }
//   }, [lessonId, chapterId, courseId]);

//   const handleBackToCourse = () => {
//     router.push(`/course/${courseId}`);
//   };

//   const getLessonIcon = (type: string) => {
//     switch (type) {
//       case "video":
//         return <Play className="w-5 h-5" />;
//       case "article":
//         return <FileText className="w-5 h-5" />;
//       case "quiz":
//         return <HelpCircle className="w-5 h-5" />;
//       case "assignment":
//         return <CheckSquare className="w-5 h-5" />;
//       default:
//         return <BookOpen className="w-5 h-5" />;
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="text-foreground text-xl">Loading lesson...</div>
//       </div>
//     );
//   }

//   if (error || !lesson) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="text-center">
//           <div className="text-foreground text-xl mb-4">Lesson not found</div>
//           <button
//             onClick={handleBackToCourse}
//             className="bg-primary text-primary-foreground px-4 py-2 rounded-lg"
//           >
//             Back to Course
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Header */}
//       <div className="border-b border-border bg-card">
//         <div className="max-w-7xl mx-auto px-4 py-4">
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={handleBackToCourse}
//               className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
//             >
//               <ArrowLeft className="w-4 h-4" />
//               <span>Back to Course</span>
//             </button>

//             <div className="text-sm text-muted-foreground">
//               {course?.name}
//               {chapter && (
//                 <>
//                   <span className="mx-2">/</span>
//                   <span>
//                     Chapter {chapter.order}: {chapter.title}
//                   </span>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Lesson Content */}
//       <div className="max-w-4xl mx-auto px-4 py-8">
//         {/* Lesson Header */}
//         <div className="mb-8">
//           <div className="flex items-center space-x-3 mb-4">
//             <div className="flex items-center space-x-2 text-primary">
//               {getLessonIcon(lesson.type)}
//               <span className="text-sm font-medium capitalize">
//                 {lesson.type}
//               </span>
//             </div>
//             <div className="flex items-center space-x-2 text-muted-foreground">
//               <Clock className="w-4 h-4" />
//               <span className="text-sm">{lesson.duration}</span>
//             </div>
//           </div>

//           <h1 className="text-3xl font-bold text-foreground mb-2">
//             {lesson.title}
//           </h1>

//           {lesson.description && (
//             <p className="text-lg text-muted-foreground">
//               {lesson.description}
//             </p>
//           )}
//         </div>

//         {/* Lesson Content Based on Type */}
//         <div className="space-y-8">
//           {lesson.type === "video" && lesson.videoUrl && (
//             <div className="bg-card rounded-lg p-6 border border-border">
//               <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
//                 <div className="text-center">
//                   <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
//                   <p className="text-muted-foreground">Video Player</p>
//                   <p className="text-sm text-muted-foreground mt-2">
//                     Video URL: {lesson.videoUrl}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {lesson.type === "article" && lesson.content && (
//             <div className="bg-card rounded-lg p-8 border border-border">
//               <div className="prose prose-neutral dark:prose-invert max-w-none">
//                 <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
//               </div>
//             </div>
//           )}

//           {lesson.type === "quiz" && (
//             <div className="bg-card rounded-lg p-8 border border-border">
//               <div className="text-center">
//                 <HelpCircle className="w-16 h-16 text-primary mx-auto mb-4" />
//                 <h3 className="text-xl font-semibold mb-2">Quiz</h3>
//                 <p className="text-muted-foreground">
//                   Quiz functionality will be implemented here
//                 </p>
//               </div>
//             </div>
//           )}

//           {lesson.type === "assignment" && (
//             <div className="bg-card rounded-lg p-8 border border-border">
//               <div className="text-center">
//                 <CheckSquare className="w-16 h-16 text-primary mx-auto mb-4" />
//                 <h3 className="text-xl font-semibold mb-2">Assignment</h3>
//                 <p className="text-muted-foreground">
//                   Assignment functionality will be implemented here
//                 </p>
//                 {lesson.content && (
//                   <div className="mt-6 text-left">
//                     <div className="prose prose-neutral dark:prose-invert max-w-none">
//                       <div
//                         dangerouslySetInnerHTML={{ __html: lesson.content }}
//                       />
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Resources Section */}
//           {lesson.resources && lesson.resources.length > 0 && (
//             <div className="bg-card rounded-lg p-6 border border-border">
//               <h3 className="text-lg font-semibold mb-4">Resources</h3>
//               <div className="space-y-3">
//                 {lesson.resources.map((resource) => (
//                   <div
//                     key={resource.id}
//                     className="flex items-center justify-between p-3 bg-muted rounded-md"
//                   >
//                     <div>
//                       <p className="font-medium">{resource.title}</p>
//                       <p className="text-sm text-muted-foreground capitalize">
//                         {resource.type}
//                       </p>
//                     </div>
//                     <a
//                       href={resource.url}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm hover:bg-primary/90 transition-colors"
//                     >
//                       Open
//                     </a>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Navigation */}
//         <div className="mt-12 flex justify-between items-center">
//           <button
//             onClick={handleBackToCourse}
//             className="flex items-center space-x-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors"
//           >
//             <ArrowLeft className="w-4 h-4" />
//             <span>Back to Course</span>
//           </button>

//           <div className="flex space-x-3">
//             <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
//               Mark as Complete
//             </button>
//             <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
//               Next Lesson
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Play,
  FileText,
  HelpCircle,
  CheckSquare,
} from "lucide-react";

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
  resources?: LessonResource[];
}

interface LessonResource {
  id: string;
  title: string;
  url: string;
  type: string;
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  order: number;
}

interface Course {
  id: string;
  name: string;
  subtitle?: string;
}

export default function LessonPage() {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const router = useRouter();

  // CORRECTED: Based on your file structure
  const courseId = params.slug as string; // This is actually the course ID from the parent route
  const lessonId = params.slug as string; // This is the lesson ID from the current route

  // You might need to get the course ID from the parent route
  // Let's get it from the current path
  const pathSegments = window.location.pathname.split("/");
  const actualCourseId = pathSegments[2]; // /course/[courseId]/lesson/[lessonId]

  useEffect(() => {
    async function fetchLessonData() {
      try {
        setLoading(true);

        // Fetch lesson details
        const lessonResponse = await fetch(`/api/lesson?id=${lessonId}`);
        if (!lessonResponse.ok) {
          throw new Error("Failed to fetch lesson");
        }
        const lessonData = await lessonResponse.json();
        setLesson(lessonData.lesson);

        // Fetch chapter details using the lesson's chapterId
        if (lessonData.lesson.chapterId) {
          const chapterResponse = await fetch(
            `/api/chapter?id=${lessonData.lesson.chapterId}`
          );
          if (chapterResponse.ok) {
            const chapterData = await chapterResponse.json();
            setChapter(chapterData.chapter);
          }
        }

        // Fetch course details
        const courseResponse = await fetch(`/api/course?id=${actualCourseId}`);
        if (courseResponse.ok) {
          const courseData = await courseResponse.json();
          setCourse(courseData.course);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load lesson");
      } finally {
        setLoading(false);
      }
    }

    if (lessonId && actualCourseId) {
      fetchLessonData();
    }
  }, [lessonId, actualCourseId]);

  const handleBackToCourse = () => {
    router.push(`/course/${actualCourseId}`);
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="w-5 h-5" />;
      case "article":
        return <FileText className="w-5 h-5" />;
      case "quiz":
        return <HelpCircle className="w-5 h-5" />;
      case "assignment":
        return <CheckSquare className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl">Loading lesson...</div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-foreground text-xl mb-4">Lesson not found</div>
          <button
            onClick={handleBackToCourse}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToCourse}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Course</span>
            </button>

            <div className="text-sm text-muted-foreground">
              {course?.name}
              {chapter && (
                <>
                  <span className="mx-2">/</span>
                  <span>
                    Chapter {chapter.order}: {chapter.title}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Lesson Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center space-x-2 text-primary">
              {getLessonIcon(lesson.type)}
              <span className="text-sm font-medium capitalize">
                {lesson.type}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{lesson.duration}</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            {lesson.title}
          </h1>

          {lesson.description && (
            <p className="text-lg text-muted-foreground">
              {lesson.description}
            </p>
          )}
        </div>

        {/* Lesson Content Based on Type */}
        <div className="space-y-8">
          {lesson.type === "video" && lesson.videoUrl && (
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Video Player</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Video URL: {lesson.videoUrl}
                  </p>
                </div>
              </div>
            </div>
          )}

          {lesson.type === "article" && lesson.content && (
            <div className="bg-card rounded-lg p-8 border border-border">
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
              </div>
            </div>
          )}

          {lesson.type === "quiz" && (
            <div className="bg-card rounded-lg p-8 border border-border">
              <div className="text-center">
                <HelpCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Quiz</h3>
                <p className="text-muted-foreground">
                  Quiz functionality will be implemented here
                </p>
              </div>
            </div>
          )}

          {lesson.type === "assignment" && (
            <div className="bg-card rounded-lg p-8 border border-border">
              <div className="text-center">
                <CheckSquare className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Assignment</h3>
                <p className="text-muted-foreground">
                  Assignment functionality will be implemented here
                </p>
                {lesson.content && (
                  <div className="mt-6 text-left">
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                      <div
                        dangerouslySetInnerHTML={{ __html: lesson.content }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resources Section */}
          {lesson.resources && lesson.resources.length > 0 && (
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <div className="space-y-3">
                {lesson.resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-md"
                  >
                    <div>
                      <p className="font-medium">{resource.title}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {resource.type}
                      </p>
                    </div>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm hover:bg-primary/90 transition-colors"
                    >
                      Open
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-between items-center">
          <button
            onClick={handleBackToCourse}
            className="flex items-center space-x-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Course</span>
          </button>

          <div className="flex space-x-3">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Mark as Complete
            </button>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Next Lesson
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
