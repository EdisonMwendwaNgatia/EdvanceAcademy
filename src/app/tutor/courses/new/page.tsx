"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";

export default function NewCoursePage() {
  const router = useRouter();
  const { user } = useUserRole();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const createCourse = async () => {
    if (!title) return;

    setLoading(true);

    const { error } = await supabase.from("courses").insert([
      {
        title,
        description,
        tutor_id: user?.id,
        status: "draft",
      },
    ]);

    setLoading(false);

    if (!error) {
      router.push("/tutor/dashboard"); // ✅ redirect
    } else {
      alert("Error creating course");
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Course</h1>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Course Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2"
        />

        <button
          onClick={createCourse}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2"
        >
          {loading ? "Creating..." : "Create Course"}
        </button>
      </div>
    </div>
  );
}