/* eslint-disable @typescript-eslint/no-unused-vars */
// admin/courses/page.tsx - Admin course management and approval
"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";
import Link from "next/link";
import Image from "next/image";

interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
  price: number;
  tutor_id: string;
  created_at: string;
  published_at: string | null;
  thumbnail_url: string | null;
  category: string;
  rejection_reason?: string;
  tutor_name?: string;
  tutor_email?: string;
}

export default function AdminCourses() {
  const router = useRouter();
  const { role, loading: roleLoading } = useUserRole();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState<"pending" | "active" | "all">("pending");

  // Define fetchCourses with useCallback
  const fetchCourses = useCallback(async () => {
    setLoading(true);

    // First fetch courses based on filter
    let query = supabase.from("courses").select("*");

    // Apply filter
    if (filter === "pending") {
      query = query.eq("status", "published");
    } else if (filter === "active") {
      query = query.eq("status", "active");
    }
    // If filter is 'all', no status filter applied

    const { data: coursesData, error: coursesError } = await query.order(
      "created_at",
      { ascending: false },
    );

    if (coursesError) {
      console.error("Error fetching courses:", coursesError);
      setLoading(false);
      return;
    }

    if (!coursesData || coursesData.length === 0) {
      setCourses([]);
      setLoading(false);
      return;
    }

    // Fetch tutor information separately for each course
    const coursesWithTutors = await Promise.all(
      coursesData.map(async (course) => {
        // Fetch tutor profile from user_profiles
        const { data: tutorData, error: tutorError } = await supabase
          .from("user_profiles")
          .select("full_name, email")
          .eq("id", course.tutor_id)
          .single();

        if (tutorError) {
          return {
            ...course,
            tutor_name: "Unknown Tutor",
            tutor_email: "No email available",
          };
        }

        return {
          ...course,
          tutor_name: tutorData?.full_name || "Unknown Tutor",
          tutor_email: tutorData?.email || "No email available",
        };
      }),
    );

    setCourses(coursesWithTutors);
    setLoading(false);
  }, [filter]);

  // Separate effect for role checking
  useEffect(() => {
    if (!roleLoading && role !== "admin") {
      router.push("/student/dashboard");
    }
  }, [role, roleLoading, router]);

  // Single effect to fetch courses when dependencies change
  useEffect(() => {
    if (!roleLoading && role === "admin") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchCourses();
    }
  }, [role, roleLoading, filter, fetchCourses]);

  const approveCourse = async (courseId: string) => {
    setActionLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("courses")
      .update({
        status: "active",
        approved_at: new Date().toISOString(),
        approved_by: user?.id,
        rejected_at: null,
        rejected_by: null,
        rejection_reason: null,
      })
      .eq("id", courseId);

    if (!error) {
      await fetchCourses();
      setShowModal(false);
      setSelectedCourse(null);
      alert("✅ Course has been approved and is now active!");
    } else {
      console.error("Approval error:", error);
      alert("Error approving course: " + error.message);
    }

    setActionLoading(false);
  };

  const rejectCourse = async (courseId: string) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;

    setActionLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("courses")
      .update({
        status: "rejected",
        rejection_reason: reason,
        rejected_at: new Date().toISOString(),
        rejected_by: user?.id,
        approved_at: null,
        approved_by: null,
      })
      .eq("id", courseId);

    if (!error) {
      await fetchCourses();
      setShowModal(false);
      setSelectedCourse(null);
      alert("❌ Course has been rejected.");
    } else {
      console.error("Rejection error:", error);
      alert("Error rejecting course: " + error.message);
    }

    setActionLoading(false);
  };

  const viewCourseDetails = (course: Course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "published":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "published":
        return "Pending Approval";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  // Calculate pending count for the badge
  const pendingCount = courses.filter((c) => c.status === "published").length;

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EdVance Admin
              </h1>
              <div className="ml-10 flex space-x-8">
                <Link
                  href="/admin/dashboard"
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Users Management
                </Link>
                <Link
                  href="/admin/courses"
                  className="px-3 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600"
                >
                  Courses
                </Link>
                <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                  Reports
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/login";
                }}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Filter Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setFilter("pending")}
                  className={`${
                    filter === "pending"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Pending Approval
                  {pendingCount > 0 && (
                    <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                      {pendingCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setFilter("active")}
                  className={`${
                    filter === "active"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Active Courses
                </button>
                <button
                  onClick={() => setFilter("all")}
                  className={`${
                    filter === "all"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  All Courses
                </button>
              </nav>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
              >
                {course.thumbnail_url && (
                  <div className="h-48 bg-gray-200 relative">
                    <Image
                      src={course.thumbnail_url}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                      {course.title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(course.status)}`}
                    >
                      {getStatusText(course.status)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tutor:</span>
                      <span className="font-medium text-gray-900">
                        {course.tutor_name || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium text-gray-900">
                        {course.category || "Uncategorized"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Price:</span>
                      <span className="font-medium text-gray-900">
                        ${course.price}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      router.push(`/admin/courses/review/${course.id}`)
                    }
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {course.status === "published"
                      ? "Review Course"
                      : "View Details"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {courses.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">
                {filter === "pending"
                  ? "No pending courses awaiting approval"
                  : filter === "active"
                    ? "No active courses found"
                    : "No courses found"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Course Details Modal */}
      {showModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {selectedCourse.status === "published"
                  ? "Review Course"
                  : "Course Details"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {selectedCourse.thumbnail_url && (
                <div className="relative w-full h-64 mb-6">
                  <Image
                    src={selectedCourse.thumbnail_url}
                    alt={selectedCourse.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedCourse.title}
                  </h3>
                  <p className="text-gray-600 mt-2 whitespace-pre-wrap">
                    {selectedCourse.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Tutor Information</p>
                    <p className="font-medium">
                      {selectedCourse.tutor_name || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedCourse.tutor_email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Course Details</p>
                    <p className="font-medium">
                      Category: {selectedCourse.category || "N/A"}
                    </p>
                    <p className="font-medium">
                      Price: ${selectedCourse.price}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Submitted:{" "}
                      {new Date(
                        selectedCourse.published_at ||
                          selectedCourse.created_at,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedCourse.status === "published" && (
                  <div className="flex space-x-4 pt-4">
                    <button
                      onClick={() => approveCourse(selectedCourse.id)}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {actionLoading ? "Processing..." : "✓ Approve & Activate"}
                    </button>
                    <button
                      onClick={() => rejectCourse(selectedCourse.id)}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {actionLoading ? "Processing..." : "✗ Reject"}
                    </button>
                  </div>
                )}

                {selectedCourse.status === "rejected" &&
                  selectedCourse.rejection_reason && (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm font-semibold text-red-800 mb-1">
                        Rejection Reason:
                      </p>
                      <p className="text-sm text-red-700">
                        {selectedCourse.rejection_reason}
                      </p>
                    </div>
                  )}

                {selectedCourse.status === "active" && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      ✓ This course has been approved and is active
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
