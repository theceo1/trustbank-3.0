// app/admin/users/UserDetails.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, UserX } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";

interface Profile {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface UserDetailsProps {
  userId: string;
}

export default function UserDetails({ userId }: UserDetailsProps) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const { data, error } = await getSupabaseClient()
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;
        setUser(data);
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  const toggleUserStatus = async () => {
    try {
      const { error } = await getSupabaseClient()
        .from('profiles')
        .update({ is_active: !user.is_active })
        .eq('id', user.id);

      if (error) throw error;
      setUser({ ...user, is_active: !user.is_active });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleSuspend = async () => {
    try {
      const { error } = await getSupabaseClient()
        .from('profiles')
        .update({ is_suspended: true })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('User suspended successfully');
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Failed to suspend user');
    }
  };

  const handleUnsuspend = async () => {
    try {
      const { error } = await getSupabaseClient()
        .from('profiles')
        .update({ is_suspended: false })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('User unsuspended successfully');
    } catch (error) {
      console.error('Error unsuspending user:', error);
      toast.error('Failed to unsuspend user');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold">{user.full_name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div>
            <Badge variant={user.is_active ? "default" : "destructive"}>
              {user.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <Button onClick={toggleUserStatus} variant="outline">
            {user.is_active ? <UserX className="h-4 w-4 mr-2" /> : <UserCheck className="h-4 w-4 mr-2" />}
            {user.is_active ? "Deactivate" : "Activate"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 