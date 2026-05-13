// components/admin/AdminNav.tsx
"use client";

import { supabase } from "@/lib/supabase";

interface AdminNavProps {
  activeTab: "dashboard" | "courses";
  onTabChange?: (tab: "dashboard" | "courses") => void;
}

export default function AdminNav({ activeTab, onTabChange }: AdminNavProps) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleTabClick = (tab: "dashboard" | "courses") => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EdVance Admin
            </h1>
            <div className="ml-10 flex space-x-8">
              <button
                onClick={() => handleTabClick("dashboard")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === "dashboard"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Users Management
              </button>
              <button
                onClick={() => handleTabClick("courses")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === "courses"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Courses
              </button>
              <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                Reports
              </button>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
