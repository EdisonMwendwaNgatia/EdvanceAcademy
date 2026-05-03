"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      console.log("=== Auth Callback Started ===");
      
      try {
        // Get the session after OAuth redirect
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          window.location.href = '/login?error=auth_failed';
          return;
        }

        if (session?.user) {
          console.log("User authenticated:", session.user.id);
          console.log("User email:", session.user.email);
          
          // First, check if profile exists
          const { error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          // If profile doesn't exist, create it
          if (profileError && profileError.code === 'PGRST116') {
            console.log("Creating new profile for user");
            const { error: insertError } = await supabase
              .from('user_profiles')
              .insert([
                {
                  id: session.user.id,
                  email: session.user.email,
                  full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'User',
                  role: 'student'
                }
              ]);

            if (insertError) {
              console.error("Error creating profile:", insertError);
              window.location.href = '/login?error=profile_creation_failed';
              return;
            }
            
            console.log("Profile created successfully, redirecting to student dashboard");
            window.location.href = '/student/dashboard';
            return;
          }
          
          // Get fresh role from database
          const { data: userProfile, error: fetchError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          if (fetchError) {
            console.error("Error fetching role:", fetchError);
            window.location.href = '/student/dashboard';
            return;
          }
          
          const role = userProfile?.role || 'student';
          console.log("User role found:", role);
          
          // Redirect based on role - use window.location for hard reload
          if (role === 'admin') {
            console.log("Redirecting to Admin Dashboard");
            window.location.href = '/admin/dashboard';
          } else if (role === 'tutor') {
            console.log("Redirecting to Tutor Dashboard");
            window.location.href = '/tutor/dashboard';
          } else {
            console.log("Redirecting to Student Dashboard");
            window.location.href = '/student/dashboard';
          }
        } else {
          console.log("No session found");
          window.location.href = '/login?error=no_session';
        }
      } catch (error) {
        console.error("Callback error:", error);
        window.location.href = '/login?error=unknown';
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}