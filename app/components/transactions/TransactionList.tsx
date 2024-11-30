"use client";

import { useState } from "react";
import { Transaction } from "@/app/types/transactions";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import TransactionDetails from "./TransactionDetails";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { TransactionStatusBadge } from "@/app/components/ui/transaction-status-badge";

interface TransactionListProps {
  transactions: Transaction[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function TransactionList({ 
  transactions,
  currentPage,
  totalPages,
  onPageChange,
}: TransactionListProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <>
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {
              setSelectedTransaction(transaction);
              setDetailsOpen(true);
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {transaction.type === 'deposit' ? (
                  <ArrowDownLeft className="w-6 h-6 text-green-600" />
                ) : (
                  <ArrowUpRight className="w-6 h-6 text-red-600" />
                )}
                <div>
                  <p className="font-semibold capitalize">{transaction.type}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(transaction.created_at), 'MMM d, yyyy HH:mm')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {(transaction.type === 'deposit' || 
                    transaction.type === 'sell' || 
                    (transaction.type === 'buy' && transaction.crypto_amount && transaction.crypto_amount > 0)) 
                    ? '+' : '-'}
                  {transaction.currency} {transaction.amount.toFixed(2)}
                </p>
                <TransactionStatusBadge status={transaction.status} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => onPageChange(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {selectedTransaction && (
        <TransactionDetails
          transaction={selectedTransaction}
          open={!!selectedTransaction}
          onOpenChange={() => setSelectedTransaction(null)}
        />
      )}
    </>
  );
}
