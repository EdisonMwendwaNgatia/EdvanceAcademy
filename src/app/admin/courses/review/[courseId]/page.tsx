/* eslint-disable @typescript-eslint/no-explicit-any */
// admin/courses/review/[courseId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";
import Link from "next/link";
import Image from "next/image";
import { 
  Video, Calendar, ExternalLink, Clock, 
  ChevronLeft, CheckCircle, XCircle,
  Award, PlayCircle, Menu, X
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  content: string;
  video_url: string | null;
  meeting_link: string | null;
  meeting_date: string | null;
  meeting_platform: string | null;
  display_order: number;
}

interface Milestone {
  id: string;
  title: string;
  display_order: number;
}

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
  tutor_name?: string;
  tutor_email?: string;
}

type CourseItem = {
  type: 'lesson' | 'milestone';
  id: string;
  data: Lesson | Milestone;
  display_order: number;
};

// Helper function to strip HTML tags and decode HTML entities
const cleanHtmlTitle = (html: string) => {
  if (!html) return 'Untitled';
  
  // Create a temporary div element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Get text content (this strips HTML tags)
  let text = tempDiv.textContent || tempDiv.innerText || '';
  
  // Decode common HTML entities
  const entities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
    '&#x27;': "'",
    '&#x2F;': '/'
  };
  
  text = text.replace(/&[^;]+;/g, (match) => entities[match] || match);
  
  // Remove any remaining HTML tags
  text = text.replace(/<[^>]*>/g, '');
  
  // Trim whitespace and limit length
  return text.trim().substring(0, 100);
};

// Helper function to strip HTML tags for plain text preview (optional)

// Component to render HTML content safely
const RenderHTML = ({ html }: { html: string }) => {
  if (!html || html === '<p></p>') {
    return <p className="text-gray-500 italic">No content provided</p>;
  }
  
  return (
    <div 
      className="prose prose-lg max-w-none 
        prose-headings:text-gray-900 prose-headings:font-bold 
        prose-h1:text-3xl prose-h1:mt-6 prose-h1:mb-4
        prose-h2:text-2xl prose-h2:mt-5 prose-h2:mb-3
        prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-2
        prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
        prose-ul:list-disc prose-ul:pl-5 prose-ul:mb-4
        prose-ol:list-decimal prose-ol:pl-5 prose-ol:mb-4
        prose-li:text-gray-700 prose-li:mb-1
        prose-strong:text-gray-900 prose-strong:font-semibold
        prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
        prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
        prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
        prose-table:border-collapse prose-table:w-full
        prose-th:border prose-th:border-gray-300 prose-th:bg-gray-100 prose-th:p-2
        prose-td:border prose-td:border-gray-300 prose-td:p-2
      "
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default function AdminCourseReview() {
  const router = useRouter();
  const { courseId } = useParams();
  const { role, loading: roleLoading } = useUserRole();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [courseItems, setCourseItems] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<CourseItem | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [approvalAmount, setApprovalAmount] = useState<number>(0);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Check admin access
  useEffect(() => {
    if (!roleLoading && role !== 'admin') {
      router.push('/student/dashboard');
    }
  }, [role, roleLoading, router]);

  // Fetch course and its content
  useEffect(() => {
    if (!courseId || role !== 'admin') return;

    const fetchCourseData = async () => {
      setLoading(true);
      try {
        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();

        if (courseError) throw courseError;

        // Fetch tutor info
        const { data: tutorData } = await supabase
          .from('user_profiles')
          .select('full_name, email')
          .eq('id', courseData.tutor_id)
          .single();

        setCourse({
          ...courseData,
          tutor_name: tutorData?.full_name || 'Unknown Tutor',
          tutor_email: tutorData?.email || 'No email',
          price: courseData.price || 0
        });
        setApprovalAmount(courseData.price || 0);

        // Fetch lessons
        const { data: lessons, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseId)
          .order('display_order', { ascending: true });

        if (lessonsError) throw lessonsError;

        // Fetch milestones
        const { data: milestones, error: milestonesError } = await supabase
          .from('milestones')
          .select('*')
          .eq('course_id', courseId)
          .order('display_order', { ascending: true });

        if (milestonesError) throw milestonesError;

        // Combine items
        const combined: CourseItem[] = [
          ...(lessons || []).map(l => ({ type: 'lesson' as const, id: l.id, data: l, display_order: l.display_order })),
          ...(milestones || []).map(m => ({ type: 'milestone' as const, id: m.id, data: m, display_order: m.display_order }))
        ].sort((a, b) => a.display_order - b.display_order);

        setCourseItems(combined);
        
        // Select first item
        if (combined.length > 0) {
          setSelectedItem(combined[0]);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        alert('Failed to load course data');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, role]);

  const approveCourse = async () => {
    if (approvalAmount <= 0) {
      alert('Please set a valid price in Kenyan Shillings');
      return;
    }

    setActionLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('courses')
        .update({ 
          status: 'active',
          price: approvalAmount,
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
          rejected_at: null,
          rejected_by: null,
          rejection_reason: null
        })
        .eq('id', courseId);

      if (error) throw error;

      alert('✅ Course has been approved and published!');
      router.push('/admin/courses');
    } catch (error: any) {
      console.error('Approval error:', error);
      alert('Error approving course: ' + error.message);
    } finally {
      setActionLoading(false);
      setShowApproveModal(false);
    }
  };

  const rejectCourse = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('courses')
        .update({ 
          status: 'rejected',
          rejection_reason: rejectionReason,
          rejected_at: new Date().toISOString(),
          rejected_by: user?.id,
          approved_at: null,
          approved_by: null
        })
        .eq('id', courseId);

      if (error) throw error;

      alert('❌ Course has been rejected.');
      router.push('/admin/courses');
    } catch (error: any) {
      console.error('Rejection error:', error);
      alert('Error rejecting course: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
  };

  const getPlatformColor = (platform: string | null) => {
    switch (platform) {
      case 'zoom': return 'border-blue-200 bg-blue-50';
      case 'teams': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Course not found</p>
          <Link href="/admin/courses" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/courses')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-5 h-5" />
                Back to Courses
              </button>
              <h1 className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Review Course
              </h1>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowApproveModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve & Publish
              </button>
              <button
                onClick={() => {
                  const reason = prompt('Please provide a reason for rejection:');
                  if (reason) {
                    setRejectionReason(reason);
                    rejectCourse();
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar with course content outline */}
        <div className={`${sidebarOpen ? 'w-80' : 'w-0'} border-r bg-white transition-all duration-300 overflow-hidden flex flex-col`}>
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Course Content</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-gray-200 rounded lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {courseItems.map((item, idx) => {
                // Clean the title for display
                const cleanTitle = item.type === 'lesson' 
                  ? cleanHtmlTitle((item.data as Lesson).title)
                  : (item.data as Milestone).title;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`w-full text-left p-3 rounded-lg transition flex items-start gap-3 ${
                      selectedItem?.id === item.id
                        ? 'bg-blue-50 border-blue-200 border'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {item.type === 'lesson' ? (
                      <PlayCircle className={`w-5 h-5 mt-0.5 shrink-0 ${selectedItem?.id === item.id ? 'text-blue-600' : 'text-gray-400'}`} />
                    ) : (
                      <Award className={`w-5 h-5 mt-0.5 shrink-0 ${selectedItem?.id === item.id ? 'text-purple-600' : 'text-gray-400'}`} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${selectedItem?.id === item.id ? 'text-blue-600' : 'text-gray-900'}`}>
                        {item.type === 'milestone' && '🏆 '}{cleanTitle || 'Untitled'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.type === 'lesson' ? 'Lesson' : 'Milestone'} • Item {idx + 1}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-y-auto">
          {/* Toggle sidebar button for mobile */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="fixed left-4 top-20 z-10 p-2 bg-white rounded-lg shadow-lg lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="max-w-4xl mx-auto p-6">
            {/* Course Header */}
            <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
              {course.thumbnail_url && (
                <div className="relative h-64 w-full">
                  <Image src={course.thumbnail_url} alt={course.title} fill className="object-cover" />
                </div>
              )}
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h1>
                    <p className="text-gray-600">{course.description}</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold ml-4">
                    Pending Review
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Tutor</p>
                    <p className="font-medium">{course.tutor_name}</p>
                    <p className="text-sm text-gray-600">{course.tutor_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium">{course.category || 'Uncategorized'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Item Content */}
            {selectedItem && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {selectedItem.type === 'milestone' ? (
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Award className="w-8 h-8 text-purple-600" />
                      <h2 className="text-xl font-semibold text-gray-900">Milestone</h2>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{(selectedItem.data as Milestone).title}</h3>
                    <p className="text-gray-600">
                      This milestone marks an important checkpoint in the course. Students will see this as a progress marker.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Lesson Header - Clean title for display */}
                    <div className="border-b bg-linear-to-r from-gray-50 to-white p-6">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {cleanHtmlTitle((selectedItem.data as Lesson).title)}
                      </h2>
                    </div>
                    
                    {/* Lesson Content - Properly rendered HTML */}
                    <div className="p-6">
                      <RenderHTML html={(selectedItem.data as Lesson).content || ''} />
                    </div>

                    {/* Video Section */}
                    {(selectedItem.data as Lesson).video_url && (
                      <div className="border-t p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Video className="w-5 h-5 text-blue-600" />
                          Video Content
                        </h3>
                        <div className="border rounded-lg overflow-hidden shadow-sm">
                          <iframe
                            className="w-full aspect-video"
                            src={(selectedItem.data as Lesson).video_url || ''}
                            title="Lesson video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}

                    {/* Live Meeting Details */}
                    {((selectedItem.data as Lesson).meeting_link || (selectedItem.data as Lesson).meeting_date) && (
                      <div className="border-t p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          Live Meeting Details
                        </h3>
                        <div className={`p-4 rounded-lg border-2 ${getPlatformColor((selectedItem.data as Lesson).meeting_platform)}`}>
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">
                                {(selectedItem.data as Lesson).meeting_platform?.toUpperCase() || 'Meeting'} Scheduled
                              </h4>
                              {(selectedItem.data as Lesson).meeting_date && (
                                <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  {formatDate((selectedItem.data as Lesson).meeting_date)}
                                </p>
                              )}
                              {(selectedItem.data as Lesson).meeting_link && (
                                <>
                                  <p className="text-sm text-gray-600 mt-2 break-all">
                                    Link: {(selectedItem.data as Lesson).meeting_link}
                                  </p>
                                  <a
                                    href={(selectedItem.data as Lesson).meeting_link || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    Join Meeting
                                  </a>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Navigation between items */}
            {selectedItem && courseItems.length > 1 && (
              <div className="flex justify-between gap-4 mt-6">
                <button
                  onClick={() => {
                    const currentIndex = courseItems.findIndex(i => i.id === selectedItem.id);
                    if (currentIndex > 0) {
                      setSelectedItem(courseItems[currentIndex - 1]);
                    }
                  }}
                  disabled={courseItems.findIndex(i => i.id === selectedItem.id) === 0}
                  className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => {
                    const currentIndex = courseItems.findIndex(i => i.id === selectedItem.id);
                    if (currentIndex < courseItems.length - 1) {
                      setSelectedItem(courseItems[currentIndex + 1]);
                    }
                  }}
                  disabled={courseItems.findIndex(i => i.id === selectedItem.id) === courseItems.length - 1}
                  className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b px-6 py-4">
              <h2 className="text-xl font-semibold">Approve Course</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Set the course price in Kenyan Shillings (KES)
              </p>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">KES</span>
                <input
                  type="number"
                  value={approvalAmount}
                  onChange={(e) => setApprovalAmount(Number(e.target.value))}
                  className="w-full pl-14 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter price"
                  min="0"
                  step="100"
                />
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={approveCourse}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Approve Course'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}