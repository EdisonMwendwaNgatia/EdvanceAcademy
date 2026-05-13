// tutor/dashboard/page.tsx - Fixed version
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
  status: "draft" | "published" | "archived" | "active" | "rejected";
  created_at: string;
  published_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
}

type TabType = "all" | "draft" | "published" | "active" | "rejected" | "archived";

export default function TutorDashboard() {
  const router = useRouter();
  const { user, role, loading } = useUserRole();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [updatingCourseId, setUpdatingCourseId] = useState<string | null>(null);
  const [selectedCourseForDetails, setSelectedCourseForDetails] = useState<Course | null>(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  useEffect(() => {
    if (!loading && (!user || role !== "tutor")) {
      router.push("/student/dashboard");
    }
  }, [user, role, loading, router]);

  useEffect(() => {
    if (!user || role !== "tutor") return;

    const loadCourses = async () => {
      setLoadingCourses(true);
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("tutor_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setCourses(data as Course[]);
      }
      setLoadingCourses(false);
    };

    loadCourses();
  }, [user, role]);

  const updateCourseStatus = async (courseId: string, newStatus: Course["status"]) => {
    setUpdatingCourseId(courseId);
    
    // Simplified update - just change the status
    const { error } = await supabase
      .from("courses")
      .update({ status: newStatus })
      .eq("id", courseId);

    if (!error) {
      // Update local state optimistically
      setCourses(prevCourses =>
        prevCourses.map(course =>
          course.id === courseId
            ? { ...course, status: newStatus }
            : course
        )
      );
      
      // Show appropriate message
      if (newStatus === "published") {
        alert("Course submitted for admin approval. You'll be notified once reviewed.");
      }
    } else {
      console.error("Error updating course status:", error);
      alert("Failed to update course status. Please try again.");
    }

    setUpdatingCourseId(null);
  };

  const viewCourseDetails = (course: Course) => {
    setSelectedCourseForDetails(course);
    if (course.status === "rejected") {
      setShowRejectionModal(true);
    }
  };

  const getFilteredCourses = () => {
    if (activeTab === "all") return courses;
    return courses.filter(course => course.status === activeTab);
  };

  const getStatusBadgeColor = (status: Course["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "published":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "archived":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: Course["status"]) => {
    switch (status) {
      case "active":
        return "Approved & Active";
      case "published":
        return "Pending Approval";
      case "rejected":
        return "Rejected";
      case "draft":
        return "Draft";
      case "archived":
        return "Archived";
      default:
        return status;
    }
  };

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: "all", label: "All", count: courses.length },
    { id: "draft", label: "Drafts", count: courses.filter(c => c.status === "draft").length },
    { id: "published", label: "Pending", count: courses.filter(c => c.status === "published").length },
    { id: "active", label: "Approved", count: courses.filter(c => c.status === "active").length },
    { id: "rejected", label: "Rejected", count: courses.filter(c => c.status === "rejected").length },
    { id: "archived", label: "Archived", count: courses.filter(c => c.status === "archived").length },
  ];

  const filteredCourses = getFilteredCourses();

  if (loading || loadingCourses) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Courses</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your courses and track approval status</p>
        </div>

        <Link
          href="/tutor/courses/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          + Create New Course
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <p className="text-sm text-gray-600">Total Courses</p>
          <p className="text-2xl font-bold">{courses.length}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 shadow-sm border border-yellow-200">
          <p className="text-sm text-yellow-800">Pending Review</p>
          <p className="text-2xl font-bold text-yellow-800">{courses.filter(c => c.status === "published").length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 shadow-sm border border-green-200">
          <p className="text-sm text-green-800">Approved</p>
          <p className="text-2xl font-bold text-green-800">{courses.filter(c => c.status === "active").length}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 shadow-sm border border-red-200">
          <p className="text-sm text-red-800">Rejected</p>
          <p className="text-2xl font-bold text-red-800">{courses.filter(c => c.status === "rejected").length}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 shadow-sm border">
          <p className="text-sm text-gray-600">Drafts</p>
          <p className="text-2xl font-bold">{courses.filter(c => c.status === "draft").length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6 overflow-x-auto">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 transition-colors relative whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500">
            {activeTab === "all" 
              ? "No courses yet. Create your first course!" 
              : `No ${activeTab} courses available.`}
          </p>
          {activeTab === "all" && (
            <Link
              href="/tutor/courses/new"
              className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Create Course
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="border rounded-lg hover:shadow-lg transition bg-white overflow-hidden"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <Link 
                    href={`/tutor/courses/${course.id}/edit`}
                    className="flex-1"
                  >
                    <h2 className="font-semibold text-lg hover:text-blue-600 transition line-clamp-2">
                      {course.title}
                    </h2>
                  </Link>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {course.description || "No description provided"}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeColor(course.status)}`}>
                      {getStatusText(course.status)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(course.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {course.status === "rejected" && course.rejection_reason && (
                    <button
                      onClick={() => viewCourseDetails(course)}
                      className="text-xs text-red-600 hover:text-red-700 underline"
                    >
                      View rejection reason
                    </button>
                  )}
                  
                  {course.status === "active" && course.approved_at && (
                    <p className="text-xs text-green-600">
                      ✓ Approved on {new Date(course.approved_at).toLocaleDateString()}
                    </p>
                  )}
                  
                  {course.status === "published" && (
                    <p className="text-xs text-yellow-600">
                      ⏳ Waiting for admin approval...
                    </p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 pt-3 border-t">
                  {course.status !== "published" && course.status !== "active" && (
                    <button
                      onClick={() => updateCourseStatus(course.id, "published")}
                      disabled={updatingCourseId === course.id}
                      className="flex-1 text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {updatingCourseId === course.id ? "Submitting..." : "Submit for Approval"}
                    </button>
                  )}
                  
                  {(course.status === "draft" || course.status === "rejected") && (
                    <Link
                      href={`/tutor/courses/${course.id}/edit`}
                      className="flex-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition text-center"
                    >
                      Edit Course
                    </Link>
                  )}
                  
                  {course.status !== "draft" && course.status !== "archived" && course.status !== "rejected" && (
                    <button
                      onClick={() => updateCourseStatus(course.id, "draft")}
                      disabled={updatingCourseId === course.id}
                      className="flex-1 text-sm bg-yellow-600 text-white px-3 py-1.5 rounded hover:bg-yellow-700 transition disabled:opacity-50"
                    >
                      Move to Draft
                    </button>
                  )}
                  
                  {course.status !== "archived" && (
                    <button
                      onClick={() => updateCourseStatus(course.id, "archived")}
                      disabled={updatingCourseId === course.id}
                      className="text-sm bg-gray-600 text-white px-3 py-1.5 rounded hover:bg-gray-700 transition disabled:opacity-50"
                    >
                      Archive
                    </button>
                  )}
                  
                  {course.status === "archived" && (
                    <button
                      onClick={() => updateCourseStatus(course.id, "draft")}
                      disabled={updatingCourseId === course.id}
                      className="flex-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      Restore
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Details Modal */}
      {showRejectionModal && selectedCourseForDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-red-600">Course Rejected</h2>
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setSelectedCourseForDetails(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">{selectedCourseForDetails.title}</h3>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
                  <p className="text-sm text-red-700">{selectedCourseForDetails.rejection_reason}</p>
                </div>
                {selectedCourseForDetails.rejected_at && (
                  <p className="text-xs text-gray-500 mt-3">
                    Rejected on: {new Date(selectedCourseForDetails.rejected_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectionModal(false);
                    setSelectedCourseForDetails(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Close
                </button>
                <Link
                  href={`/tutor/courses/${selectedCourseForDetails.id}/edit`}
                  onClick={() => {
                    setShowRejectionModal(false);
                    setSelectedCourseForDetails(null);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center"
                >
                  Edit & Resubmit
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}