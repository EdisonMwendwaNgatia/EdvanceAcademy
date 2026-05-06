import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export function useUserRole() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const getUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!isMounted) return;

        if (user) {
          setUser(user);
          
          // Fetch user role from profiles table
          const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          
          if (!isMounted) return;

          if (error) {
            console.error('Error fetching user role:', error);
            setRole('student');
          } else {
            setRole(profile?.role || 'student');
          }
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (err) {
        console.error('Error in getUserRole:', err);
        if (isMounted) {
          setRole(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getUserRole();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (session?.user) {
        setUser(session.user);
        
        try {
          const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          if (!isMounted) return;

          if (error) {
            console.error('Error fetching user role on auth change:', error);
            setRole('student');
          } else {
            setRole(profile?.role || 'student');
          }
        } catch (err) {
          console.error('Error in onAuthStateChange:', err);
          setRole('student');
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, role, loading };
}