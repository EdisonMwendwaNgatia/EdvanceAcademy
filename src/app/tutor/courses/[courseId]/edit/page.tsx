"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import LessonSidebar from "@/components/editor/LessonSidebar";
import TipTapEditor from "@/components/editor/tiptap/TipTapEditor";
import { Video, Calendar, ExternalLink, Copy, Check, Clock, Users } from "lucide-react";
import type { Lesson } from "@/types/lesson";

type MeetingPlatform = "zoom" | "teams" | "other";

export default function CourseEditor() {
  const { courseId } = useParams<{ courseId: string }>();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selected, setSelected] = useState<Lesson | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [video, setVideo] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingPlatform, setMeetingPlatform] = useState<MeetingPlatform>("zoom");
  const [copied, setCopied] = useState(false);

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
    setMeetingLink(lesson.meeting_link || "");
    // Format the date for the datetime-local input
    setMeetingDate(lesson.meeting_date ? formatDateForInput(lesson.meeting_date) : "");
    setMeetingPlatform((lesson.meeting_platform as MeetingPlatform) || "zoom");
  };

  // Helper function to format date for datetime-local input
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    
    // Format: YYYY-MM-DDThh:mm
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Helper function to format date for database (ISO string)
  const formatDateForDatabase = (dateTimeLocal: string) => {
    if (!dateTimeLocal) return null;
    
    // Convert datetime-local string to ISO format
    const date = new Date(dateTimeLocal);
    if (isNaN(date.getTime())) return null;
    
    return date.toISOString();
  };

  // SAVE LESSON (create/update)
  const saveLesson = async () => {
    if (!title) {
      alert("Please enter a lesson title");
      return;
    }

    try {
      // Format the meeting date properly for database
      const formattedMeetingDate = formatDateForDatabase(meetingDate);
      
      const lessonData = {
        title,
        content,
        video_url: video || null,
        meeting_link: meetingLink || null,
        meeting_date: formattedMeetingDate, // Use formatted date
        meeting_platform: meetingPlatform || null,
      };

      console.log("Saving lesson with data:", {
        ...lessonData,
        meeting_date_raw: meetingDate,
        meeting_date_formatted: formattedMeetingDate
      });

      if (selected) {
        // UPDATE
        console.log("Updating existing lesson:", selected.id);
        const { data, error } = await supabase
          .from("lessons")
          .update(lessonData)
          .eq("id", selected.id)
          .select();

        if (error) {
          console.error("Error updating lesson:", error);
          alert(`Failed to save lesson: ${error.message}`);
          return;
        }

        if (data && data.length > 0) {
          console.log("Lesson updated successfully:", data[0]);
          setLessons((prev) =>
            prev.map((l) => (l.id === selected.id ? data[0] : l)),
          );
          alert("Lesson saved successfully!");
        } else {
          console.warn("No data returned from update");
          alert("Lesson saved but no confirmation received. Please refresh.");
        }
      } else {
        // CREATE
        console.log("Creating new lesson for course:", courseId);
        const { data, error } = await supabase
          .from("lessons")
          .insert([
            {
              course_id: courseId,
              ...lessonData,
            },
          ])
          .select();

        if (error) {
          console.error("Error creating lesson:", error);
          alert(`Failed to create lesson: ${error.message}`);
          return;
        }

        if (data && data.length > 0) {
          console.log("Lesson created successfully:", data[0]);
          setLessons((prev) => [...prev, data[0]]);
          alert("Lesson created successfully!");
        } else {
          console.warn("No data returned from insert");
          alert("Lesson created but no confirmation received. Please refresh.");
        }
      }

      // Clear form only after successful save
      setTitle("");
      setContent("");
      setVideo("");
      setMeetingLink("");
      setMeetingDate("");
      setMeetingPlatform("zoom");
      setSelected(null);
    } catch (err) {
      console.error("Unexpected error saving lesson:", err);
      alert(`Unexpected error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
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

  // Format display date for preview
  const formatDisplayDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleString();
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
            setMeetingLink("");
            setMeetingDate("");
            setMeetingPlatform("zoom");
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
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Title Editor Section */}
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

        {/* Content Editor Section */}
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

        {/* MEETING LINKS SECTION - NEW */}
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
            <p className="text-sm text-gray-600 mt-1">
              Add Zoom or Microsoft Teams meeting links for students to join live sessions
            </p>
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
              <p className="text-xs text-gray-500 mt-1">
                Paste your meeting invitation link here. Students will be able to join directly.
              </p>
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
              <p className="text-xs text-gray-500 mt-1">
                Set the scheduled time for the live session
              </p>
            </div>

            {/* Preview Card (if meeting link exists) */}
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
              onClick={() => {
                setSelected(null);
                setTitle("");
                setContent("");
                setVideo("");
                setMeetingLink("");
                setMeetingDate("");
                setMeetingPlatform("zoom");
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