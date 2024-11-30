import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/app/types/database';

interface User {
  id: string;
  email: string;
  full_name?: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      if (error || !authUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      setUser(profile);
      setLoading(false);
    };

    getUser();
  }, [supabase]);

  return { user, loading };
}