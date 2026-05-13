/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
// components/admin/CoursesTab.tsx
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

// Types
interface Course {
  id: string;
  title: string;
  description: string;
  status: CourseStatus;
  price: number;
  tutor_id: string;
  created_at: string;
  published_at: string | null;
  thumbnail_url: string | null;
  category: string;
  rejection_reason?: string;
  tutor_name?: string;
  tutor_email?: string;
  approved_at?: string | null;
  approved_by?: string | null;
  rejected_at?: string | null;
  rejected_by?: string | null;
}

type CourseStatus = 'published' | 'active' | 'rejected' | 'draft' | 'archived';
type FilterType = 'pending' | 'active' | 'rejected' | 'all';

interface CourseStats {
  pending: number;
  active: number;
  rejected: number;
  total: number;
}

// Custom Hook for Courses
const useCourses = (filter: FilterType) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("courses")
        .select("*")
        .not("status", "in", '("draft","archived")');

      // Apply status filter
      if (filter === 'pending') {
        query = query.eq("status", "published");
      } else if (filter === 'active') {
        query = query.eq("status", "active");
      } else if (filter === 'rejected') {
        query = query.eq("status", "rejected");
      }

      const { data: coursesData, error: coursesError } = await query
        .order("created_at", { ascending: false });

      if (coursesError) throw coursesError;
      if (!coursesData?.length) {
        setCourses([]);
        return;
      }

      // Fetch tutor information
      const tutorIds = [...new Set(coursesData.map(c => c.tutor_id))];
      const { data: tutorsData, error: tutorsError } = await supabase
        .from("user_profiles")
        .select("id, full_name, email")
        .in("id", tutorIds);

      if (tutorsError) throw tutorsError;

      const tutorMap = new Map(tutorsData?.map(tutor => [tutor.id, tutor]));
      
      const enrichedCourses = coursesData.map(course => ({
        ...course,
        tutor_name: tutorMap.get(course.tutor_id)?.full_name || "Unknown Tutor",
        tutor_email: tutorMap.get(course.tutor_id)?.email || "No email available",
      }));

      setCourses(enrichedCourses);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, error, refetch: fetchCourses };
};

// Status Badge Component
const StatusBadge = ({ status }: { status: CourseStatus }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return { color: 'bg-green-100 text-green-800', icon: '✓', label: 'Active' };
      case 'published':
        return { color: 'bg-yellow-100 text-yellow-800', icon: '⏳', label: 'Pending' };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800', icon: '✗', label: 'Rejected' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: '•', label: status };
    }
  };

  const { color, icon, label } = getStatusConfig();
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <span className="mr-1">{icon}</span>
      {label}
    </span>
  );
};

// Filter Tabs Component
const FilterTabs = ({ 
  currentFilter, 
  onFilterChange, 
  stats 
}: { 
  currentFilter: FilterType; 
  onFilterChange: (filter: FilterType) => void;
  stats: CourseStats;
}) => {
  const tabs = [
    { id: 'pending' as const, label: 'Pending Approval', count: stats.pending },
    { id: 'active' as const, label: 'Active', count: stats.active },
    { id: 'rejected' as const, label: 'Rejected', count: stats.rejected },
    { id: 'all' as const, label: 'All Courses', count: stats.total },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onFilterChange(tab.id)}
            className={`
              group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${currentFilter === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`
                ml-3 py-0.5 px-2 rounded-full text-xs font-medium transition-colors
                ${currentFilter === tab.id
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600'
                }
              `}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

// Course Card Component
const CourseCard = ({ 
  course, 
  onViewDetails 
}: { 
  course: Course; 
  onViewDetails: (course: Course) => void;
}) => {
  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Thumbnail Section */}
      <div className="relative h-48 bg-linear-to-br from-gray-50 to-gray-100 overflow-hidden">
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <StatusBadge status={course.status} />
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {course.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        {/* Meta Information */}
        <div className="space-y-2 mb-5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tutor</span>
            <span className="font-medium text-gray-900 truncate ml-2">
              {course.tutor_name}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Category</span>
            <span className="font-medium text-gray-900">
              {course.category || "Uncategorized"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Price</span>
            <span className="font-bold text-green-600">
              {course.price ? `KES ${course.price.toLocaleString()}` : "Not set"}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onViewDetails(course)}
          className="w-full px-4 py-2 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {course.status === 'published' ? 'Review Course' : 'View Details'}
        </button>
      </div>
    </div>
  );
};

// Modal Component
const CourseModal = ({ 
  course, 
  isOpen, 
  onClose, 
  onApprove, 
  onReject, 
  isLoading 
}: {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (price: number) => void;
  onReject: (reason: string) => void;
  isLoading: boolean;
}) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [price, setPrice] = useState("");
  const [priceError, setPriceError] = useState("");

  useEffect(() => {
    if (course) {
      setPrice(course.price?.toString() || "");
      setPriceError("");
    }
  }, [course]);

  const handleApprove = () => {
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setPriceError("Please enter a valid price greater than 0");
      return;
    }
    if (numericPrice < 500) {
      setPriceError("Minimum recommended price is KES 500");
      return;
    }
    onApprove(numericPrice);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    onReject(rejectionReason);
    setShowRejectDialog(false);
    setRejectionReason("");
  };

  if (!isOpen || !course) return null;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {course.status === 'published' ? 'Review Course' : 'Course Details'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Thumbnail */}
            {course.thumbnail_url && (
              <div className="relative w-full h-80 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={course.thumbnail_url}
                  alt={course.title}
                  fill
                  className="object-contain"
                />
              </div>
            )}

            {/* Title & Description */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{course.title}</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {course.description}
              </p>
            </div>

            {/* Info Grid */}
            <div className="grid md:grid-cols-2 gap-4 p-5 bg-gray-50 rounded-xl">
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Tutor Information</h4>
                <p className="font-medium text-gray-900">{course.tutor_name}</p>
                <p className="text-sm text-gray-600">{course.tutor_email}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Course Details</h4>
                <p><span className="text-gray-600">Category:</span> {course.category || "N/A"}</p>
                <p><span className="text-gray-600">Status:</span> <StatusBadge status={course.status} /></p>
                <p className="text-sm text-gray-500 mt-2">
                  Submitted: {new Date(course.published_at || course.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Price Input for Pending Courses */}
            {course.status === 'published' && (
              <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Set Course Price (KES)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    setPriceError("");
                  }}
                  placeholder="Enter price in Kenyan Shillings"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    priceError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="0"
                  step="100"
                />
                {priceError && (
                  <p className="text-red-500 text-xs mt-2">{priceError}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Minimum recommended price: KES 500
                </p>
              </div>
            )}

            {/* Rejection Reason Display */}
            {course.status === 'rejected' && course.rejection_reason && (
              <div className="p-5 bg-red-50 rounded-xl border border-red-200">
                <h4 className="text-sm font-semibold text-red-800 mb-2">Rejection Reason</h4>
                <p className="text-red-700">{course.rejection_reason}</p>
              </div>
            )}

            {/* Action Buttons */}
            {course.status === 'published' && (
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleApprove}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all transform hover:scale-[1.02] font-medium"
                >
                  {isLoading ? "Processing..." : "✓ Approve & Activate"}
                </button>
                <button
                  onClick={() => setShowRejectDialog(true)}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all transform hover:scale-[1.02] font-medium"
                >
                  {isLoading ? "Processing..." : "✗ Reject"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Confirmation Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Course</h3>
            <div className="space-y-4">
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Confirm Rejection
                </button>
                <button
                  onClick={() => {
                    setShowRejectDialog(false);
                    setRejectionReason("");
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Main Component
export default function CoursesTab() {
  const [filter, setFilter] = useState<FilterType>("pending");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const { courses, loading, error, refetch } = useCourses(filter);

  // Calculate statistics
  const stats = useMemo(() => ({
    pending: courses.filter(c => c.status === 'published').length,
    active: courses.filter(c => c.status === 'active').length,
    rejected: courses.filter(c => c.status === 'rejected').length,
    total: courses.length,
  }), [courses]);

  const showAlert = (message: string, isError: boolean = false) => {
    // Using native alert for simplicity, but you can customize this
    alert(message);
  };

  const handleApprove = async (price: number) => {
    if (!selectedCourse) return;
    
    setActionLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("courses")
        .update({
          status: "active",
          price: price,
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
          rejected_at: null,
          rejected_by: null,
          rejection_reason: null,
        })
        .eq("id", selectedCourse.id);

      if (error) throw error;

      showAlert("✅ Course approved and activated successfully!");
      await refetch();
      setIsModalOpen(false);
      setSelectedCourse(null);
    } catch (error: any) {
      console.error("Approval error:", error);
      showAlert(`Failed to approve course: ${error.message}`, true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!selectedCourse) return;
    
    setActionLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
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
        .eq("id", selectedCourse.id);

      if (error) throw error;

      showAlert("❌ Course rejected successfully!");
      await refetch();
      setIsModalOpen(false);
      setSelectedCourse(null);
    } catch (error: any) {
      console.error("Rejection error:", error);
      showAlert(`Failed to reject course: ${error.message}`, true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
            <p className="text-gray-600 mt-1">Review, approve, and manage course submissions</p>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-green-700">
                ✓ Active
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-yellow-50 text-yellow-700">
                ⏳ Pending
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-50 text-red-700">
                ✗ Rejected
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <div className="shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Draft and archived courses are not shown here. Only published (pending approval), active (approved), and rejected courses are displayed.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <FilterTabs
        currentFilter={filter}
        onFilterChange={setFilter}
        stats={stats}
      />

      {/* Courses Grid */}
      <div className="mt-6">
        {courses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'pending' && "No courses waiting for approval"}
              {filter === 'active' && "No active courses available"}
              {filter === 'rejected' && "No rejected courses"}
              {filter === 'all' && "No courses available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      {/* Course Modal */}
      <CourseModal
        course={selectedCourse}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCourse(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
        isLoading={actionLoading}
      />
    </div>
  );
}