/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type Role = "student" | "tutor" | "admin";

export function useUserRole() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const resetState = () => {
    setUser(null);
    setRole(null);
    setLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("role, is_banned")
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.error("Profile fetch error:", error);
      setRole("student");
      return;
    }

    // 🚨 BLOCK BANNED USERS
    if (data.is_banned) {
      await supabase.auth.signOut();
      resetState();
      return;
    }

    setRole((data.role as Role) || "student");
  };

  useEffect(() => {
    let alive = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!alive) return;

      const sessionUser = data.session?.user ?? null;

      setUser(sessionUser);

      if (sessionUser) {
        await fetchProfile(sessionUser.id);
      } else {
        resetState();
      }

      setLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!alive) return;

      const sessionUser = session?.user ?? null;

      setUser(sessionUser);

      if (sessionUser) {
        await fetchProfile(sessionUser.id);
      } else {
        resetState();
      }

      setLoading(false);
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, role, loading };
}