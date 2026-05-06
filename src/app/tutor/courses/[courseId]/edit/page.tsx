"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import LessonSidebar from "@/components/editor/LessonSidebar";
import TipTapEditor from "@/components/editor/tiptap/TipTapEditor";

interface Lesson {
  id: string;
  title: string;
  content: string | null;
  video_url: string | null;
}

export default function CourseEditor() {
  const { courseId } = useParams<{ courseId: string }>();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selected, setSelected] = useState<Lesson | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [video, setVideo] = useState("");

  // ✅ LOAD LESSONS
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at", { ascending: true });

      setLessons(data || []);
    };

    if (courseId) load();
  }, [courseId]);

  // SELECT LESSON
  const selectLesson = (lesson: Lesson) => {
    setSelected(lesson);
    setTitle(lesson.title);
    setContent(lesson.content || "");
    setVideo(lesson.video_url || "");
  };

  // SAVE LESSON (create/update)
  const saveLesson = async () => {
    if (!title) return;

    if (selected) {
      // UPDATE
      const { data } = await supabase
        .from("lessons")
        .update({
          title,
          content,
          video_url: video,
        })
        .eq("id", selected.id)
        .select();

      if (data) {
        setLessons((prev) =>
          prev.map((l) => (l.id === selected.id ? data[0] : l)),
        );
      }
    } else {
      // CREATE
      const { data } = await supabase
        .from("lessons")
        .insert([
          {
            course_id: courseId,
            title,
            content,
            video_url: video,
          },
        ])
        .select();

      if (data) {
        setLessons((prev) => [...prev, data[0]]);
      }
    }

    setTitle("");
    setContent("");
    setVideo("");
    setSelected(null);
  };

  return (
    <div className="flex h-screen">
      {/* SIDEBAR */}
      <div className="w-64 border-r p-3 overflow-y-auto">
        <button
          onClick={() => {
            setSelected(null);
            setTitle("");
            setContent("");
            setVideo("");
          }}
          className="text-blue-600 text-sm mb-3 w-full text-left px-2 py-1 hover:bg-gray-50 rounded"
        >
          + New Lesson
        </button>

        <LessonSidebar
          lessons={lessons}
          onSelect={selectLesson}
          selectedId={selected?.id}
        />
      </div>

      {/* EDITOR */}
      <div className="flex-1 p- space-y-4 overflow-y-auto">
        {/* Title Editor - Now using TipTap */}
        <div className="border rounded-lg overflow-hidden bg-white">
          <TipTapEditor
            content={title}
            onChange={setTitle}
            placeholder="Lesson Title"
            isTitle={true}
          />
        </div>

        {/* Content Editor */}
        <div className="border rounded-lg overflow-hidden bg-white">
          <TipTapEditor
            content={content}
            onChange={setContent}
            placeholder="Lesson content..."
            isTitle={false}
          />
        </div>

        {/* Video URL Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Video URL (Optional)
          </label>
          <input
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://www.youtube.com/watch?v=..."
            value={video}
            onChange={(e) => setVideo(e.target.value)}
          />
        </div>

        {/* Save Button */}
        <div className="flex gap-2">
          <button
            onClick={saveLesson}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Save Lesson
          </button>

          {selected && (
            <button
              onClick={() => {
                setSelected(null);
                setTitle("");
                setContent("");
                setVideo("");
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Video Preview */}
        {video && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video Preview
            </label>
            <div className="border rounded-lg overflow-hidden">
              <iframe
                className="w-full aspect-video"
                src={video}
                title="Video preview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
