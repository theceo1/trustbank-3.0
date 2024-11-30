"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Download, Search, Trophy } from "lucide-react";
import supabase from "@/lib/supabase/client";

interface Referrer {
  user_id: string;
  full_name: string;
  email: string;
  referral_code: string;
  referral_count: number;
  referral_earnings: number;
  referral_tier: string;
  created_at: string;
}

export default function TopReferrers() {
  const [referrers, setReferrers] = useState<Referrer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("referral_count");

  const fetchReferrers = useCallback(async () => {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .gt('referral_count', 0)
        .order(sortBy as any, { ascending: false });

      if (timeRange !== 'all') {
        const date = new Date();
        if (timeRange === 'week') {
          date.setDate(date.getDate() - 7);
        } else if (timeRange === 'month') {
          date.setMonth(date.getMonth() - 1);
        } else if (timeRange === 'year') {
          date.setFullYear(date.getFullYear() - 1);
        }
        query = query.gte('created_at', date.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setReferrers(data || []);
    } catch (error) {
      console.error('Error fetching referrers:', error);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, sortBy]);

  useEffect(() => {
    fetchReferrers();
  }, [fetchReferrers]);

  const filteredReferrers = referrers.filter(referrer => 
    referrer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    referrer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    referrer.referral_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Referral Code', 'Referrals', 'Earnings', 'Tier'];
    const data = filteredReferrers.map(r => [
      r.full_name,
      r.email,
      r.referral_code,
      r.referral_count,
      r.referral_earnings,
      r.referral_tier
    ]);

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `referrers-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'ELITE': return 'bg-purple-100 text-purple-800';
      case 'GOLD': return 'bg-yellow-100 text-yellow-800';
      case 'SILVER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-zinc-100 text-zinc-800';
    }
  };

  if (isLoading) {
    return <TopReferrersSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Top Referrers</CardTitle>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search referrers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="week">Past week</SelectItem>
                <SelectItem value="month">Past month</SelectItem>
                <SelectItem value="year">Past year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="referral_count">Referrals</SelectItem>
                <SelectItem value="referral_earnings">Earnings</SelectItem>
                <SelectItem value="created_at">Date joined</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Referral Code</TableHead>
                <TableHead className="text-right">Referrals</TableHead>
                <TableHead className="text-right">Earnings</TableHead>
                <TableHead>Tier</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReferrers.map((referrer, index) => (
                <TableRow key={referrer.user_id}>
                  <TableCell>
                    {index < 3 ? (
                      <Trophy className={`h-5 w-5 ${
                        index === 0 ? 'text-yellow-500' :
                        index === 1 ? 'text-gray-400' :
                        'text-amber-600'
                      }`} />
                    ) : (
                      `#${index + 1}`
                    )}
                  </TableCell>
                  <TableCell>{referrer.full_name}</TableCell>
                  <TableCell>{referrer.email}</TableCell>
                  <TableCell>
                    <code className="text-sm">{referrer.referral_code}</code>
                  </TableCell>
                  <TableCell className="text-right">{referrer.referral_count}</TableCell>
                  <TableCell className="text-right">
                    ₦{referrer.referral_earnings.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={getTierColor(referrer.referral_tier)}>
                      {referrer.referral_tier}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filteredReferrers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No referrers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function TopReferrersSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}