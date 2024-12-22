import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@/app/types/user';

interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
  refreshUser: () => Promise<void>;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClientComponentClient();

  const fetchUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        setUser(null);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          kyc_status,
          kyc_level,
          kyc_data
        `)
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert([
            { 
              id: authUser.id,
              email: authUser.email,
              kyc_status: 'unverified',
              kyc_level: 0,
              kyc_data: {}
            }
          ])
          .select()
          .single();

        if (createError) throw createError;
        setUser({ ...authUser, ...newProfile });
        return;
      }

      setUser({
        ...authUser,
        ...profile,
        kyc_status: profile?.kyc_status || 'unverified',
        kyc_level: profile?.kyc_level || 0
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch user'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    loading,
    error,
    refreshUser: fetchUser
  };
}