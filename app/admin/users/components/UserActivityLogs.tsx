"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";

interface Activity {
  id: string;
  user_id: string;
  type: 'auth' | 'transaction' | 'profile' | 'security' | 'system';
  action: string;
  metadata: Record<string, any>;
  ip_address: string;
  created_at: string;
}

interface UserActivityLogsProps {
  userId: string;
}

export function UserActivityLogs({ userId }: UserActivityLogsProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activityType, setActivityType] = useState<string>("all");

  useEffect(() => {
    fetchActivities();
  }, [userId, activityType]);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await getSupabaseClient()
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityBadgeColor = (type: Activity['type']) => {
    const colors = {
      auth: "bg-blue-100 text-blue-800",
      transaction: "bg-green-100 text-green-800",
      profile: "bg-purple-100 text-purple-800",
      security: "bg-red-100 text-red-800",
      system: "bg-gray-100 text-gray-800"
    };
    return colors[type] || colors.system;
  };

  const exportActivities = () => {
    const csv = [
      ['Date', 'Type', 'Action', 'IP Address', 'Details'].join(','),
      ...activities.map(activity => [
        new Date(activity.created_at).toLocaleString(),
        activity.type,
        activity.action,
        activity.ip_address,
        JSON.stringify(activity.metadata)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-${userId}-activity-log.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Activity Log</CardTitle>
          <div className="flex items-center gap-4">
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="auth">Authentication</SelectItem>
                <SelectItem value="transaction">Transactions</SelectItem>
                <SelectItem value="profile">Profile Updates</SelectItem>
                <SelectItem value="security">Security Events</SelectItem>
                <SelectItem value="system">System Events</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportActivities} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start justify-between p-4 rounded-lg border"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className={getActivityBadgeColor(activity.type)}>
                    {activity.type}
                  </Badge>
                  <span className="font-medium">{activity.action}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(activity.created_at).toLocaleString()}
                </div>
                {activity.metadata && (
                  <div className="mt-2 text-sm">
                    <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                      {JSON.stringify(activity.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                IP: {activity.ip_address}
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No activity logs found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 