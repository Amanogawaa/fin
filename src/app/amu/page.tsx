"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, SendIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

export default function Home() {
  const id = useId();
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!topic.trim() || !level) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/course/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "Programming", // You might want to make this dynamic
          topic: topic.trim(),
          level,
          duration: "4 hours", // Default - you could make this configurable
          noOfChapters: 5, // Default - you could make this configurable
          language: "en",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate course");
      }

      const data = await response.json();
      console.log("Generated course:", data.course);
      // Handle success - redirect to course page or show success message
      router.push(`/amu/course/${data.course.id}`);
    } catch (error) {
      console.error("Error generating course:", error);
      // Handle error - show error message
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <main className="flex flex-col items-center justify-center w-full h-full">
      <div className="flex flex-col items-center justify-center w-full h-full gap-2 p-4 border border-muted">
        <h1 className="text-3xl font-satoshi font-medium text-Evergreen_Dusk">
          what can i help you to learn today?
        </h1>
        <p className="text-lg font-satoshi text-Winter_Teal">
          enter a topic below to generate a personalized course for it
        </p>
        <div className="*:not-first:mt-2 max-w-xl w-full">
          <div className="relative">
            <Input
              id={id}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pe-10 ps-5 py-8 px-4 rounded-full"
              placeholder="e.g. intro to python"
              type="text"
              disabled={isLoading}
            />
            <button
              onClick={handleSubmit}
              disabled={isLoading || !topic.trim() || !level}
              className="text-muted-foreground/80 hover:text-Evergreen_Dusk focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-5 flex h-full w-9  items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="course generator"
            >
              <SendIcon size={16} aria-hidden="true" />
            </button>
          </div>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="rounded-full mx-auto focus-visible:ring-2 focus-visible:ring-Evergreen_Dusk/50">
              <SelectValue placeholder="difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">beginner</SelectItem>
              <SelectItem value="intermidiate">intermidiate</SelectItem>
              <SelectItem value="advanced">advanced</SelectItem>
            </SelectContent>
          </Select>

          {isLoading && (
            <div className="text-center mt-4">
              <Loader2 className="animate-spin mx-auto mb-2" size={24} />
              <p className="text-sm text-muted-foreground">
                Generating your personalized course...
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
