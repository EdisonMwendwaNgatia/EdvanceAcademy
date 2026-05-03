"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";

export default function TutorDashboard() {
  const router = useRouter();
  const { user, role, loading } = useUserRole();

  useEffect(() => {
    if (!loading && (!user || role !== 'tutor')) {
      router.push('/student/dashboard');
    }
  }, [user, role, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Tutor Dashboard
              </h1>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-4">
                Welcome, {user?.user_metadata?.full_name || 'Tutor'}!
              </span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Tutor Portal</h2>
          <p className="text-gray-600">
            Manage your courses, track student progress, and create learning materials.
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">My Courses</h3>
              <p className="text-sm text-gray-600">Manage and update your courses</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Student Progress</h3>
              <p className="text-sm text-gray-600">Track your students&apos; learning</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}