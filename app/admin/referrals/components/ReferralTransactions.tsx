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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle 
} from "lucide-react";
import supabase from "@/lib/supabase/client";
import { format } from "date-fns";
import { TransactionsSkeleton } from "../../components/TransactionsSkeleton";
import { TransactionService } from "@/app/lib/services/transaction";
import { ReferralTransaction } from "@/app/types/transactions";
import { TransactionStatusBadge } from "@/app/components/ui/transaction-status-badge";

export default function ReferralTransactions() {
  const [transactions, setTransactions] = useState<ReferralTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<ReferralTransaction | null>(null);
  const [dateRange, setDateRange] = useState("all");

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await TransactionService.getReferralTransactions({
        status,
        dateRange
      });
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [status, dateRange]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const exportToCSV = () => {
    const headers = ['Date', 'Referrer', 'Referred', 'Amount', 'Status'];
    const data = filteredTransactions.map(t => [
      format(new Date(t.created_at), 'yyyy-MM-dd HH:mm:ss'),
      t.referrer.email,
      t.referred.email,
      t.amount,
      t.status
    ]);

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `referral-transactions-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.referrer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.referred.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <TransactionsSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Referral Transactions</CardTitle>
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
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <div className="flex items-center gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Past week</SelectItem>
                <SelectItem value="month">Past month</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Referrer</TableHead>
                <TableHead>Referred User</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {format(new Date(transaction.created_at), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{transaction.referrer.full_name}</div>
                      <div className="text-sm text-gray-500">{transaction.referrer.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{transaction.referred.full_name}</div>
                      <div className="text-sm text-gray-500">{transaction.referred.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    ₦{transaction.amount.toLocaleString()}
                  </TableCell>
                  <TableCell><TransactionStatusBadge status={transaction.status} /></TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Transaction Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Transaction ID</h4>
                            <p className="mt-1 text-sm">{transaction.id}</p>
                          </div>
                          {/* Add more transaction details here */}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No transactions found
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