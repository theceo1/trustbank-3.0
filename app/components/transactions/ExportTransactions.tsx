import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Transaction } from '@/app/types/transactions';
import { format } from 'date-fns';
import type { jsPDF } from 'jspdf';
import type { UserOptions, CellInput } from 'jspdf-autotable';
import Papa from 'papaparse';

interface ExportTransactionsProps {
  transactions: Transaction[];
}

export default function ExportTransactions({ transactions }: ExportTransactionsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    const csvData = transactions.map(tx => ({
      Date: format(new Date(tx.created_at), 'yyyy-MM-dd HH:mm:ss'),
      Type: tx.type.toUpperCase(),
      Amount: tx.amount,
      Currency: tx.currency || 'NGN',
      Status: tx.status,
      Reference: tx.payment_reference || '-'
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Button onClick={handleExport} variant="outline" size="sm">
      <Download className="mr-2 h-4 w-4" />
      Export
    </Button>
  );
}