"use client";

import { Lesson } from "@/types/lesson";

interface Props {
  lessons: Lesson[];
  selectedId?: string | null;
  onSelect: (lesson: Lesson) => void;
}

// Helper function to strip HTML tags
const stripHtml = (html: string) => {
  if (!html) return "Untitled Lesson";
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || "Untitled Lesson";
};

export default function LessonSidebar({
  lessons,
  onSelect,
  selectedId,
}: Props) {
  return (
    <div className="h-full overflow-y-auto space-y-2">
      {lessons.map((lesson) => (
        <div
          key={lesson.id}
          onClick={() => onSelect(lesson)}
          className={`p-2 border rounded cursor-pointer transition ${
            selectedId === lesson.id ? "bg-blue-50 border-blue-300" : ""
          }`}
        >
          <p className="font-medium text-sm">
            {stripHtml(lesson.title) || "Untitled Lesson"}
          </p>
        </div>
      ))}
    </div>
  );
}