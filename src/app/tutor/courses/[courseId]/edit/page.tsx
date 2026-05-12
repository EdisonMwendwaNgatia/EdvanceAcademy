"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import DraggableSidebar from "@/components/editor/DraggableSidebar";
import TipTapEditor from "@/components/editor/tiptap/TipTapEditor";
import { Video, Calendar, ExternalLink, Copy, Check, Clock, Users, Flag, X } from "lucide-react";
import type { Lesson, Milestone, CourseItem } from "@/types/lesson";

type MeetingPlatform = "zoom" | "teams" | "other";

export default function CourseEditor() {
  const { courseId } = useParams<{ courseId: string }>();

  const [items, setItems] = useState<CourseItem[]>([]);
  const [selected, setSelected] = useState<CourseItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Lesson form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [video, setVideo] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingPlatform, setMeetingPlatform] = useState<MeetingPlatform>("zoom");
  const [copied, setCopied] = useState(false);

  // Milestone form state
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [newMilestonePosition, setNewMilestonePosition] = useState<number | null>(null);

  // Load all course items (lessons and milestones)
  useEffect(() => {
    const loadCourseItems = async () => {
      if (!courseId) return;
      setLoading(true);

      try {
        // Load lessons
        const { data: lessons, error: lessonsError } = await supabase
          .from("lessons")
          .select("*")
          .eq("course_id", courseId)
          .order("display_order", { ascending: true });

        if (lessonsError) throw lessonsError;

        // Load milestones
        const { data: milestones, error: milestonesError } = await supabase
          .from("milestones")
          .select("*")
          .eq("course_id", courseId)
          .order("display_order", { ascending: true });

        if (milestonesError) throw milestonesError;

        // Combine and sort items
        const combinedItems: CourseItem[] = [
          ...(lessons || []).map((lesson: Lesson) => ({
            type: 'lesson' as const,
            id: lesson.id,
            data: lesson,
            display_order: lesson.display_order,
          })),
          ...(milestones || []).map((milestone: Milestone) => ({
            type: 'milestone' as const,
            id: milestone.id,
            data: milestone,
            display_order: milestone.display_order,
          })),
        ].sort((a, b) => a.display_order - b.display_order);

        setItems(combinedItems);
      } catch (error) {
        console.error("Error loading course items:", error);
        alert("Failed to load course content");
      } finally {
        setLoading(false);
      }
    };

    loadCourseItems();
  }, [courseId]);

  // Select item
  const selectItem = (item: CourseItem) => {
    setSelected(item);
    
    if (item.type === 'lesson') {
      const lesson = item.data as Lesson;
      setTitle(lesson.title);
      setContent(lesson.content || "");
      setVideo(lesson.video_url || "");
      setMeetingLink(lesson.meeting_link || "");
      setMeetingDate(lesson.meeting_date ? formatDateForInput(lesson.meeting_date) : "");
      setMeetingPlatform((lesson.meeting_platform as MeetingPlatform) || "zoom");
    } else {
      // Clear lesson form and show milestone info
      setMilestoneTitle((item.data as Milestone).title);
    }
  };

  // Helper functions for date formatting
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const formatDateForDatabase = (dateTimeLocal: string) => {
    if (!dateTimeLocal) return null;
    const date = new Date(dateTimeLocal);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  };

  // Save lesson
  const saveLesson = async () => {
    if (!title) {
      alert("Please enter a lesson title");
      return;
    }

    try {
      const formattedMeetingDate = formatDateForDatabase(meetingDate);
      
      const lessonData = {
        title,
        content,
        video_url: video || null,
        meeting_link: meetingLink || null,
        meeting_date: formattedMeetingDate,
        meeting_platform: meetingPlatform || null,
      };

      if (selected && selected.type === 'lesson') {
        // Update existing lesson
        const { data, error } = await supabase
          .from("lessons")
          .update(lessonData)
          .eq("id", selected.id)
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          setItems((prev) =>
            prev.map((item) =>
              item.id === selected.id
                ? { ...item, data: data[0] }
                : item
            )
          );
          alert("Lesson saved successfully!");
        }
      } else {
        // Create new lesson
        const display_order = items.length; // Add at the end by default
        const { data, error } = await supabase
          .from("lessons")
          .insert([
            {
              course_id: courseId,
              ...lessonData,
              display_order,
            },
          ])
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          const newItem: CourseItem = {
            type: 'lesson',
            id: data[0].id,
            data: data[0],
            display_order,
          };
          setItems((prev) => [...prev, newItem]);
          alert("Lesson created successfully!");
        }
      }

      // Clear form
      resetForm();
    } catch (err) {
      console.error("Error saving lesson:", err);
      alert(`Failed to save lesson: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  // Add milestone
  const addMilestone = async (position: number) => {
    setNewMilestonePosition(position);
    setShowMilestoneModal(true);
  };

  const saveMilestone = async () => {
    if (!milestoneTitle.trim()) {
      alert("Please enter a milestone title");
      return;
    }

    try {
      if (newMilestonePosition === null) {
        alert("Cannot add milestone without a position.");
        return;
      }

      const { data, error } = await supabase
        .from("milestones")
        .insert([
          {
            course_id: courseId,
            title: milestoneTitle.trim(),
            display_order: newMilestonePosition,
          },
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        // Update display orders for items after the insertion point
        const updatedItems = [...items];
        updatedItems.splice(newMilestonePosition!, 0, {
          type: 'milestone',
          id: data[0].id,
          data: data[0],
          display_order: newMilestonePosition,
        });

        // Reorder display orders
        const reorderedItems = updatedItems.map((item, index) => ({
          ...item,
          display_order: index,
        }));

        setItems(reorderedItems);
        await updateDisplayOrders(reorderedItems);
        alert("Milestone added successfully!");
      }
    } catch (err) {
      console.error("Error adding milestone:", err);
      alert(`Failed to add milestone: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setShowMilestoneModal(false);
      setMilestoneTitle("");
      setNewMilestonePosition(null);
    }
  };

  // Delete milestone
  const deleteMilestone = async (milestoneId: string) => {
    if (!confirm("Are you sure you want to delete this milestone?")) return;

    try {
      const { error } = await supabase
        .from("milestones")
        .delete()
        .eq("id", milestoneId);

      if (error) throw error;

      setItems((prev) => prev.filter((item) => item.id !== milestoneId));
      if (selected?.id === milestoneId) {
        resetForm();
        setSelected(null);
      }
      alert("Milestone deleted successfully!");
    } catch (err) {
      console.error("Error deleting milestone:", err);
      alert("Failed to delete milestone");
    }
  };

  // Reorder items (drag and drop)
  const handleReorder = async (newItems: CourseItem[]) => {
    setItems(newItems);
    await updateDisplayOrders(newItems);
  };

  const updateDisplayOrders = async (itemsToUpdate: CourseItem[]) => {
    // Update lessons display_order
    const lessonUpdates = itemsToUpdate
      .filter(item => item.type === 'lesson')
      .map((item) => ({
        id: item.id,
        display_order: item.display_order,
      }));

    // Update milestones display_order
    const milestoneUpdates = itemsToUpdate
      .filter(item => item.type === 'milestone')
      .map((item) => ({
        id: item.id,
        display_order: item.display_order,
      }));

    try {
      // Batch update lessons
      for (const lesson of lessonUpdates) {
        await supabase
          .from("lessons")
          .update({ display_order: lesson.display_order })
          .eq("id", lesson.id);
      }

      // Batch update milestones
      for (const milestone of milestoneUpdates) {
        await supabase
          .from("milestones")
          .update({ display_order: milestone.display_order })
          .eq("id", milestone.id);
      }
    } catch (error) {
      console.error("Error updating orders:", error);
      alert("Failed to save order changes");
    }
  };

  const resetForm = () => {
    setSelected(null);
    setTitle("");
    setContent("");
    setVideo("");
    setMeetingLink("");
    setMeetingDate("");
    setMeetingPlatform("zoom");
    setMilestoneTitle("");
  };

  const copyMeetingLink = () => {
    if (meetingLink) {
      navigator.clipboard.writeText(meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getPlatformIcon = () => {
    switch (meetingPlatform) {
      case "zoom":
        return <Video className="w-5 h-5 text-blue-600" />;
      case "teams":
        return <Users className="w-5 h-5 text-purple-600" />;
      default:
        return <Video className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPlatformColor = () => {
    switch (meetingPlatform) {
      case "zoom":
        return "border-blue-200 bg-blue-50";
      case "teams":
        return "border-purple-200 bg-purple-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const formatDisplayDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500">Loading course content...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* SIDEBAR */}
      <div className="w-80 border-r overflow-y-auto">
        <div className="p-3 border-b">
          <button
            onClick={() => {
              resetForm();
              setSelected(null);
            }}
            className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
          >
            + New Lesson
          </button>
        </div>

        <DraggableSidebar
          items={items}
          selectedId={selected?.id}
          onSelect={selectItem}
          onReorder={handleReorder}
          onAddMilestone={addMilestone}
          onDeleteMilestone={deleteMilestone}
        />
      </div>

      {/* EDITOR */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {selected?.type === 'milestone' ? (
          // Milestone View
          <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
            <div className="bg-purple-50 px-6 py-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Milestone: {(selected.data as Milestone).title}
                </h3>
              </div>
              <button
                onClick={() => deleteMilestone(selected.id)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600">
                This is a milestone marker. You can drag it anywhere in your course structure.
                Milestones help students track their progress through key points in the course.
              </p>
            </div>
          </div>
        ) : (
          // Lesson Form
          <>
            {/* Title Editor */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lesson Title
              </label>
              <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <TipTapEditor
                  content={title}
                  onChange={setTitle}
                  placeholder="Enter lesson title..."
                  isTitle={true}
                />
              </div>
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lesson Content
              </label>
              <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <TipTapEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Enter lesson content here..."
                  isTitle={false}
                />
              </div>
            </div>

            {/* Meeting Details */}
            <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="bg-linear-to-r from-blue-50 to-purple-50 px-6 py-4 border-b">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Live Meeting Details
                  </h3>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full ml-2">
                    Optional
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Meeting Platform Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Platform
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setMeetingPlatform("zoom")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                        meetingPlatform === "zoom"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      <span>Zoom</span>
                    </button>
                    <button
                      onClick={() => setMeetingPlatform("teams")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                        meetingPlatform === "teams"
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>Microsoft Teams</span>
                    </button>
                    <button
                      onClick={() => setMeetingPlatform("other")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                        meetingPlatform === "other"
                          ? "border-gray-500 bg-gray-50 text-gray-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Other</span>
                    </button>
                  </div>
                </div>

                {/* Meeting Link Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Link URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={
                        meetingPlatform === "zoom"
                          ? "https://zoom.us/j/..."
                          : meetingPlatform === "teams"
                          ? "https://teams.microsoft.com/l/meetup-join/..."
                          : "Enter meeting link..."
                      }
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                    />
                    {meetingLink && (
                      <button
                        onClick={copyMeetingLink}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-1"
                        title="Copy link"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Meeting Date & Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Date & Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                  />
                </div>

                {/* Preview Card */}
                {(meetingLink || meetingDate) && (
                  <div className={`mt-4 p-4 rounded-lg border-2 ${getPlatformColor()}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getPlatformIcon()}</div>
                        <div>
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            Live Meeting Scheduled
                            {meetingDate && (
                              <span className="text-xs font-normal flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDisplayDate(formatDateForDatabase(meetingDate))}
                              </span>
                            )}
                          </h4>
                          {meetingLink && (
                            <p className="text-sm text-gray-600 mt-1 break-all">
                              {meetingLink}
                            </p>
                          )}
                          {meetingLink && (
                            <div className="flex gap-2 mt-3">
                              <a
                                href={meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Join Meeting
                              </a>
                              <button
                                onClick={copyMeetingLink}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition"
                              >
                                {copied ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                                Copy Link
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
                  onClick={resetForm}
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
          </>
        )}
      </div>

      {/* Milestone Modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Add Milestone</h3>
            <input
              type="text"
              className="w-full border rounded-lg p-2 mb-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Milestone title (e.g., 'Complete Module 1')"
              value={milestoneTitle}
              onChange={(e) => setMilestoneTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && saveMilestone()}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowMilestoneModal(false);
                  setMilestoneTitle("");
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveMilestone}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Add Milestone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}