import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/app/types/database';
import { useCallback } from 'react';

export function useDatabase() {
  const supabase = createClientComponentClient<Database>();

  const createTrade = useCallback(async (tradeData: Database['public']['Tables']['trades']['Insert']) => {
    const { data, error } = await supabase
      .from('trades')
      .insert(tradeData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }, [supabase]);

  // Add more database operations as needed

  return {
    createTrade,
    // ... other operations
  };
}