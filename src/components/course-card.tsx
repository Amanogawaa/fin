"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, EllipsisVertical } from "lucide-react";
// import DeleteCourse from "./delete-course";
import Link from "next/link";
import { Badge } from "./ui/badge";

interface Course {
  id: string;
  name: string;
  subtitle?: string;
  level: string;
  noOfChapters: number;
  duration: string;
  publish: boolean;
}

interface CourseCardProps {
  courses: Course[];
}

const CourseCard = ({ courses }: CourseCardProps) => {
  if (!courses || courses.length === 0) {
    return (
      <section className="flex h-full w-full py-5 px-3">
        <div className="container">
          <p className="mb-4 text-lg text-muted-foreground font-satoshi">
            your courses
          </p>
          <p className="text-muted-foreground">No courses found.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full w-full py-5 px-3">
      <div className="container">
        <p className="mb-4 text-lg text-muted-foreground font-satoshi">
          your courses
        </p>
        <div className="grid gap-3 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/amu/course/${course.id}`}
              className="block transition-transform hover:scale-[1.02]"
            >
              <div className="rounded-lg bg-accent p-5 flex flex-col gap-5 cursor-pointer hover:bg-accent/80 transition-colors h-48">
                <div className="flex flex-col justify-center items-start gap-1 flex-1">
                  <div className="flex justify-between w-full">
                    <Badge className="bg-white text-green-500">
                      {course.level}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger onClick={(e) => e.preventDefault()}>
                        <EllipsisVertical className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-fit flex flex-col items-center">
                        <Link href={`/amu/course/${course.id}`}>
                          start course
                        </Link>
                        {/* <Dialog>
                          <DialogTrigger>delete course</DialogTrigger>
                          <DeleteCourse />
                        </Dialog> */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <h1 className="leading-7 text-muted-foreground text-base font-inter line-clamp-2">
                    {course.name}
                  </h1>
                  {course.subtitle && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.subtitle}
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center mt-auto">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-xs font-satoshi">
                      {course.noOfChapters} chapters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-light font-inter">
                      {course.duration}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseCard;
