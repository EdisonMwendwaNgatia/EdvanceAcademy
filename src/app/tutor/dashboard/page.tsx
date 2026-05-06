"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

export default function TutorDashboard() {
  const router = useRouter();
  const { user, role, loading } = useUserRole();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    if (!loading && (!user || role !== "tutor")) {
      router.push("/student/dashboard");
    }
  }, [user, role, loading, router]);

  useEffect(() => {
    if (!user || role !== "tutor") return;

    const loadCourses = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("tutor_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) setCourses(data);

      setLoadingCourses(false);
    };

    loadCourses();
  }, [user, role]);

  if (loading || loadingCourses) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Courses</h1>

        <Link
          href="/tutor/courses/new"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Create Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <p>No courses yet.</p>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/tutor/courses/${course.id}/edit`}
              className="block border p-4 rounded hover:bg-gray-50 transition"
            >
              <h2 className="font-semibold text-lg">{course.title}</h2>
              <p className="text-sm text-gray-500">
                {course.description || "No description"}
              </p>
              <span className="text-xs text-gray-400">{course.status}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}