"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Search,
  Plus,
  Users,
  Shield,
  GraduationCap,
  UserCog,
  Loader2,
  X,
} from "lucide-react";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  created_at: string;
  is_banned?: boolean;
}

const ROLES = ["student", "tutor", "admin"] as const;

export default function UserManagementTab() {
  const { user, role } = useUserRole();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [newUser, setNewUser] = useState({
    full_name: "",
    email: "",
    role: "student",
  });

  // ---------------- FETCH USERS ----------------
  const fetchUsers = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const safeData =
      (data || []).map((u) => ({
        ...u,
        full_name: u.full_name ?? "Unknown User",
        email: u.email ?? "No email",
        role: u.role ?? "student",
        is_banned: u.is_banned ?? false,
      })) || [];

    setUsers(safeData);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, [fetchUsers]);

  // ---------------- ROLE UPDATE ----------------
  const updateRole = async (id: string, newRole: string) => {
    if (user?.id === id) return alert("You cannot change your own role.");

    setUpdatingId(id);

    const { error } = await supabase
      .from("user_profiles")
      .update({ role: newRole })
      .eq("id", id);

    setUpdatingId(null);

    if (error) return alert(error.message);

    fetchUsers();
  };

  // ---------------- CREATE USER (API) ----------------
  const createUser = async () => {
    const res = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    const data = await res.json();

    if (!res.ok) return alert(data.error || "Failed to create user");

    setShowCreate(false);
    setNewUser({ full_name: "", email: "", role: "student" });

    fetchUsers();
  };

  const handleAction = async (userId: string, action: string) => {
    const res = await fetch("/api/admin/user-action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Action failed");
      return;
    }

    fetchUsers();
  };

  // ---------------- FILTER ----------------
  const filtered = users.filter((u) => {
    const name = (u.full_name ?? "").toLowerCase();
    const email = (u.email ?? "").toLowerCase();
    const q = search.toLowerCase();

    return name.includes(q) || email.includes(q);
  });

  // ---------------- ROLE STATS ----------------
  const stats = {
    total: users.length,
    students: users.filter((u) => u.role === "student").length,
    tutors: users.filter((u) => u.role === "tutor").length,
    admins: users.filter((u) => u.role === "admin").length,
    banned: users.filter((u) => u.is_banned === true).length,
  };

  // ---------------- ACCESS CONTROL ----------------
  if (role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="p-6 bg-white border rounded-xl text-center">
          <Shield className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="font-semibold">Admin access required</p>
        </div>
      </div>
    );
  }

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              User Management
            </h1>
            <p className="text-sm text-slate-500">
              Manage roles and platform users
            </p>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {[
            { label: "Total", value: stats.total, icon: Users },
            { label: "Students", value: stats.students, icon: GraduationCap },
            { label: "Tutors", value: stats.tutors, icon: UserCog },
            { label: "Admins", value: stats.admins, icon: Shield },
            { label: "Banned", value: stats.banned, icon: Shield },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Icon className="w-4 h-4" />
                  {s.label}
                </div>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            );
          })}
        </div>

        {/* SEARCH */}
        <div className="mb-4">
          <div className="flex items-center gap-2 bg-white border rounded-lg px-3">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              className="w-full py-2 outline-none"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white border rounded-lg overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              No users found
            </div>
          ) : (
            filtered.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-4 border-b"
              >
                {/* USER */}
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">
                    {u.full_name}
                    {u.is_banned && (
                      <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                        Banned
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-slate-500">{u.email}</p>
                </div>

                {/* ROLE & ACTIONS */}
                <div className="flex items-center gap-4">
                  {/* Role Selector */}
                  <div className="flex items-center gap-2">
                    <select
                      value={u.role ?? "student"}
                      disabled={user?.id === u.id || updatingId === u.id}
                      onChange={(e) => updateRole(u.id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>

                    {updatingId === u.id && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => handleAction(u.id, u.is_banned ? "unban" : "ban")}
                      className={`px-2 py-1 text-xs rounded ${
                        u.is_banned ? "bg-green-600 text-white" : "bg-red-600 text-white"
                      }`}
                    >
                      {u.is_banned ? "Unban" : "Ban"}
                    </button>

                    <button
                      onClick={() => {
                        if (user?.id === u.id) {
                          alert("You cannot delete your own account.");
                          return;
                        }
                        if (confirm(`Are you sure you want to delete ${u.full_name}?`)) {
                          handleAction(u.id, "delete");
                        }
                      }}
                      className="px-2 py-1 text-xs rounded bg-black text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* CREATE MODAL */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-96 p-5 rounded-lg">
              <div className="flex justify-between mb-3">
                <h2 className="font-bold">Create User</h2>
                <button onClick={() => setShowCreate(false)}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <input
                className="border w-full p-2 mb-2 rounded"
                placeholder="Full name"
                value={newUser.full_name}
                onChange={(e) =>
                  setNewUser({ ...newUser, full_name: e.target.value })
                }
              />

              <input
                className="border w-full p-2 mb-2 rounded"
                placeholder="Email"
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />

              <select
                className="border w-full p-2 mb-3 rounded"
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
              >
                {ROLES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>

              <button
                onClick={createUser}
                className="w-full bg-slate-900 text-white py-2 rounded hover:bg-slate-800"
              >
                Create
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}