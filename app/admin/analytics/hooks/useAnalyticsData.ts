"use client";

import { useQuery } from '@tanstack/react-query';
import supabase from '@/lib/supabase/client';
import { DateRange } from 'react-day-picker';
import { 
  processUserData, 
  processReferralData, 
  processTransactionData 
} from '../utils/dataProcessing';

export type TimeframeType = 'daily' | 'weekly' | 'monthly';

interface AnalyticsDataOptions {
  dateRange: DateRange;
  timeframe: TimeframeType;
}

export function useAnalyticsData({ dateRange, timeframe }: AnalyticsDataOptions) {
  return useQuery({
    queryKey: ['analytics', dateRange, timeframe],
    queryFn: async () => {
      if (!dateRange.from || !dateRange.to) {
        throw new Error('Invalid date range');
      }

      // Fetch data from Supabase
      const [usersData, referralsData, transactionsData] = await Promise.all([
        supabase
          .from('users')
          .select('*')
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString()),
        supabase
          .from('referrals')
          .select('*')
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString()),
        supabase
          .from('transactions')
          .select('*')
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString())
      ]);

      return {
        userMetrics: processUserData(usersData.data || [], timeframe),
        referralMetrics: processReferralData(referralsData.data || [], timeframe),
        transactionMetrics: processTransactionData(transactionsData.data || [], timeframe)
      };
    },
    enabled: !!(dateRange?.from && dateRange?.to)
  });
}