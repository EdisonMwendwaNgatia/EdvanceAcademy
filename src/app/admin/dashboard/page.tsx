// admin/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";
import AdminNav from "@/components/admin/AdminNav";
import UserManagementTab from "@/components/admin/UserManagementTab";
import CoursesTab from "@/components/admin/CoursesTab";

export default function AdminDashboard() {
  const router = useRouter();
  const { role, loading } = useUserRole();
  const [activeTab, setActiveTab] = useState<"dashboard" | "courses">("dashboard");

  useEffect(() => {
    if (!loading && role !== "admin") router.push("/student/dashboard");
  }, [role, loading, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === "dashboard" && <UserManagementTab />}
        {activeTab === "courses" && <CoursesTab />}
      </div>
    </div>
  );
}