"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import supabase from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Transaction } from '@/app/types/transactions';

interface UserDetailsProps {
  user: any;
  onClose: () => void;
}

export default function UserDetailsDialog({ user, onClose }: UserDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSuspendUser = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({ is_suspended: true })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        id: 'suspend-success',
        title: "Success",
        description: "User has been suspended",
      });
    } catch (error) {
      console.error('Error suspending user:', error);
      toast({
        id: 'suspend-error',
        title: "Error",
        description: "Failed to suspend user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-500">Full Name</h3>
                    <p>{user.full_name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Email</h3>
                    <p>{user.email}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Status</h3>
                    <Badge variant={user.is_verified ? "default" : "destructive"}>
                      {user.is_verified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Joined</h3>
                    <p>{new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Referral Code</h3>
                    <p className="font-mono">{user.referral_code}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Total Referrals</h3>
                    <p>{user.referral_count}</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-2">
                  <Button
                    variant="destructive"
                    onClick={handleSuspendUser}
                    disabled={isLoading}
                  >
                    Suspend User
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <UserActivity userId={user.id} />
          </TabsContent>

          <TabsContent value="referrals">
            <UserReferrals userId={user.id} />
          </TabsContent>

          <TabsContent value="transactions">
            <UserTransactions userId={user.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function UserActivity({ userId }: { userId: string }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  
  // Fetch user activity data
  useEffect(() => {
    const fetchActivity = async () => {
      const { data } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      setActivities(data || []);
    };
    
    fetchActivity();
  }, [userId]);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{activity.action}</p>
                <p className="text-sm text-gray-500">
                  {new Date(activity.created_at).toLocaleString()}
                </p>
              </div>
              <Badge>{activity.type}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function UserReferrals({ userId }: { userId: string }) {
  const [referrals, setReferrals] = useState<Referral[]>([]);

  useEffect(() => {
    const fetchReferrals = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('referred_by', userId);
      
      setReferrals(data || []);
    };
    
    fetchReferrals();
  }, [userId]);

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {referrals.map((referral) => (
              <TableRow key={referral.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{referral.full_name}</p>
                    <p className="text-sm text-gray-500">{referral.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(referral.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant={referral.is_verified ? "default" : "destructive"}>
                    {referral.is_verified ? "Verified" : "Unverified"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

interface ReferralTransaction {
  id: string;
  created_at: string;
  amount: number;
  status: string;
  referrer_id: string;
  referred_id: string;
}

function UserTransactions({ userId }: { userId: string }) {
  const [transactions, setTransactions] = useState<ReferralTransaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const { data } = await supabase
        .from('referral_transactions')
        .select('*')
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });
      
      setTransactions(data || []);
    };
    
    fetchTransactions();
  }, [userId]);

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      default: return 'destructive';
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {new Date(transaction.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  ₦{transaction.amount.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(transaction.status) as "default" | "destructive"}>
                    {transaction.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Define interfaces
interface Activity {
  id: string;
  action: string;
  created_at: string;
  type: string;
}

interface Referral {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  is_verified: boolean;
}