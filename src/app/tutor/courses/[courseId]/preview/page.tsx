"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Milestone {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string | null;
  order: number;
  duration: number | null;
}

interface Course {
  id: string;
  title: string;
  description?: string;
  status?: string;
}

export default function PreviewCoursePage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // Load course
      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();
      if (courseData) setCourse(courseData);

      // Load milestones
      const { data: milestonesData } = await supabase
        .from("milestones")
        .select("*")
        .eq("course_id", courseId)
        .order("order", { ascending: true });

      const milestonesWithLessons = await Promise.all(
        (milestonesData || []).map(async (milestone) => {
          const { data: lessonsData } = await supabase
            .from("lessons")
            .select("*")
            .eq("milestone_id", milestone.id)
            .order("order", { ascending: true });
          return { ...milestone, lessons: lessonsData || [] };
        })
      );

      setMilestones(milestonesWithLessons);
    };

    if (courseId) {
      loadData();
    }
  }, [courseId]);

  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/tutor/dashboard" className="text-sm text-blue-600">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold mt-2">{course?.title}</h1>
        <p className="text-gray-600 mt-1">{course?.description}</p>
      </div>

      {/* Content */}
      <div className="flex gap-6">
        {/* Sidebar - Milestones & Lessons */}
        <div className="w-1/3 border-r pr-4">
          <h3 className="font-semibold mb-3">Course Content</h3>
          <div className="space-y-3">
            {milestones.map((milestone) => (
              <div key={milestone.id}>
                <div className="font-medium text-sm">{milestone.title}</div>
                <div className="ml-4 space-y-1 mt-1">
                  {milestone.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => setSelectedLesson(lesson)}
                      className={`text-sm block w-full text-left px-2 py-1 rounded ${
                        selectedLesson?.id === lesson.id
                          ? "bg-blue-100"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {lesson.title}
                      {lesson.duration && (
                        <span className="text-xs text-gray-400 ml-2">{lesson.duration} min</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Video/Lesson Content */}
        <div className="flex-1">
          {selectedLesson ? (
            <div>
              <h2 className="text-xl font-semibold mb-3">{selectedLesson.title}</h2>
              {selectedLesson.video_url ? (
                <div className="aspect-video bg-black mb-4">
                  <iframe
                    src={selectedLesson.video_url.replace("watch?v=", "embed/")}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gray-200 flex items-center justify-center mb-4">
                  <p className="text-gray-500">No video uploaded yet</p>
                </div>
              )}
              {selectedLesson.description && (
                <p className="text-gray-600">{selectedLesson.description}</p>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Select a lesson from the sidebar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}