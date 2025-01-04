import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import supabaseClient from '@/app/lib/supabase/client';
import { Database } from '@/app/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabaseClient
        .from('profiles')
        .update(updates)
        .eq('id', user!.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
      return { data, error: null };
    } catch (err) {
      setError(err as Error);
      console.error('Error updating profile:', err);
      return { data: null, error: err as Error };
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    refreshProfile: fetchProfile,
  };
} 