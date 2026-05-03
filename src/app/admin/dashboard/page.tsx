"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, role, loading: roleLoading } = useUserRole();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  // Define fetchUsers before using it in useEffect
  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Check if user is admin
    if (!roleLoading && role !== 'admin') {
      router.push('/student/dashboard');
      return;
    }

    if (!roleLoading && role === 'admin') {
      const loadUsers = async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setUsers(data);
        }
        setLoading(false);
      };

      loadUsers();
    }
  }, [role, roleLoading, router]);

  const updateUserRole = async (userId: string, newRole: string) => {
    // Prevent admin from changing their own role
    if (userId === user?.id) {
      alert("You cannot change your own role while logged in.");
      return;
    }

    setUpdating(userId);
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ role: newRole, updated_at: new Date() })
      .eq('id', userId);

    if (!error) {
      // Refresh user list
      await fetchUsers();
    } else {
      alert('Error updating user role');
    }
    
    setUpdating(null);
  };

  const handleSignOut = async () => {
    const confirmSignOut = window.confirm("Are you sure you want to sign out?");
    if (!confirmSignOut) return;

    setSigningOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error);
      setSigningOut(false);
    } else {
      window.location.href = '/login';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'tutor':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

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
                <button className="px-3 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
                  Users Management
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
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
                disabled={signingOut}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                {signingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">User Management</h2>
              <p className="text-sm text-gray-600">Manage user roles and permissions</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Change Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((userItem) => {
                    const isCurrentUser = userItem.id === user?.id;
                    
                    return (
                      <tr key={userItem.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {userItem.full_name || 'N/A'}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-blue-600">(You)</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{userItem.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(userItem.role)}`}>
                            {userItem.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={userItem.role}
                            onChange={(e) => updateUserRole(userItem.id, e.target.value)}
                            disabled={updating === userItem.id || isCurrentUser}
                            className={`text-sm border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              isCurrentUser ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                          >
                            <option value="student">Student</option>
                            <option value="tutor">Tutor</option>
                            <option value="admin">Admin</option>
                          </select>
                          {updating === userItem.id && (
                            <span className="ml-2 text-xs text-gray-500">Updating...</span>
                          )}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-gray-500">(Cannot change self)</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(userItem.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}