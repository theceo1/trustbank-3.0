"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import supabase from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface ReferralProfile {
  user_id: string;
  full_name: string | null;
  email: string | null;
  referral_code: string;
  referral_count: number;
  created_at: string;
}

export default function ReferralsPage() {
  const [topReferrers, setTopReferrers] = useState<ReferralProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopReferrers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('referral_count', { ascending: false })
          .limit(10);

        if (error) throw error;
        setTopReferrers(data || []);
      } catch (error) {
        console.error('Error fetching top referrers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopReferrers();
  }, []);

  if (isLoading) {
    return <ReferralsPageSkeleton />;
  }

  return (
    <div className="container mx-auto py-8 ">
      <Card>
        <CardHeader>
          <CardTitle>Top Referrers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topReferrers.map((profile, index) => (
              <div
                key={profile.user_id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="h-8 w-8 rounded-full">
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium">{profile.full_name || 'Anonymous'}</p>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{profile.referral_count}</p>
                  <p className="text-sm text-gray-500">referrals</p>
                </div>
              </div>
            ))}

            {topReferrers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No referrals yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReferralsPageSkeleton() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48 mt-2" />
                  </div>
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}