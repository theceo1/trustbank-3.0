"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Transaction } from "@/app/types/transactions";
import TransactionList from "@/app/components/transactions/TransactionList";
import TransactionFilters from "@/app/components/transactions/TransactionFilters";
import LoadingHistory from "@/app/components/skeletons/LoadingHistory";
import { useRealtimeTransactions } from "@/app/hooks/useRealtimeTransactions";

const ITEMS_PER_PAGE = 10;

interface TransactionFilters {
  type?: Transaction['type'];
  startDate?: Date;
  endDate?: Date;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<TransactionFilters>({});
  
  const { transactions, isLoading } = useRealtimeTransactions(user?.id);

  // Apply filters and pagination
  const filteredTransactions = transactions.filter(tx => {
    if (filters.type && tx.type !== filters.type) return false;
    if (filters.startDate && new Date(tx.created_at) < filters.startDate) return false;
    if (filters.endDate && new Date(tx.created_at) > filters.endDate) return false;
    return true;
  });

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

  if (isLoading) return <LoadingHistory />;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">Transaction History</h1>
      
      <TransactionFilters
        onFilterChange={(newFilters: TransactionFilters) => {
          setFilters(newFilters);
          setCurrentPage(1);
        }}
      />

      <TransactionList
        transactions={paginatedTransactions}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}