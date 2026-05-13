/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/immutability */
"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";
import Image from "next/image";

export default function NewCoursePage() {
  const router = useRouter();
  const { user } = useUserRole();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnail_url: "",
  });
  
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    thumbnail_url: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  const validateForm = useCallback(() => {
    const newErrors = {
      title: "",
      description: "",
      thumbnail_url: "",
    };
    
    if (!formData.title.trim()) {
      newErrors.title = "Course title is required";
    } else if (formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Course description is required";
    } else if (formData.description.length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    } else if (formData.description.length > 2000) {
      newErrors.description = "Description must be less than 2000 characters";
    }
    
    if (formData.thumbnail_url && !isValidUrl(formData.thumbnail_url)) {
      newErrors.thumbnail_url = "Please enter a valid URL";
    }
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  }, [formData]);

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'thumbnail_url') {
      setThumbnailPreview(value);
    }
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const createCourse = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("courses").insert([
        {
          title: formData.title.trim(),
          description: formData.description.trim(),
          thumbnail_url: formData.thumbnail_url.trim() || null,
          tutor_id: user?.id,
          status: "draft",
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      router.push("/tutor/dashboard?success=course_created");
    } catch (error: any) {
      console.error("Error creating course:", error);
      alert(error.message || "Failed to create course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCourse();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Create New Course
          </h1>
          <p className="mt-2 text-gray-600">
            Share your knowledge with students around the world
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Title Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Course Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Complete Web Development Bootcamp 2024"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={100}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.title.length}/100 characters
              </p>
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Course Description <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Describe what students will learn in this course..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={6}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={2000}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length}/2000 characters
              </p>
            </div>

            {/* Thumbnail URL Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Thumbnail URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://example.com/course-thumbnail.jpg"
                value={formData.thumbnail_url}
                onChange={(e) => handleInputChange("thumbnail_url", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.thumbnail_url ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.thumbnail_url && (
                <p className="mt-1 text-sm text-red-600">{errors.thumbnail_url}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Provide a direct link to an image (JPG, PNG, or WEBP)
              </p>
            </div>

            {/* Thumbnail Preview */}
            {thumbnailPreview && isValidUrl(thumbnailPreview) && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Thumbnail Preview
                </label>
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                  <Image
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    fill
                    className="object-cover"
                    onError={() => {
                      setErrors(prev => ({ 
                        ...prev, 
                        thumbnail_url: "Unable to load image. Please check the URL." 
                      }));
                    }}
                  />
                </div>
              </div>
            )}

            {/* Tips Section */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                💡 Tips for a great course:
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use a clear, descriptive title that tells students what they&apos;ll learn</li>
                <li>• Write a detailed description outlining course objectives and requirements</li>
                <li>• Add a high-quality thumbnail image (16:9 ratio works best)</li>
                <li>• You can edit all details later before publishing</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title.trim() || !formData.description.trim()}
                className="flex-1 px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Course...
                  </span>
                ) : (
                  "Create Course"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            By creating this course, you agree to our{" "}
            <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
          </p>
        </div>
      </div>
    </div>
  );
}