"use client";

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { PaymentService } from '@/app/lib/services/payment/PaymentService';
import { useToast } from '@/app/hooks/use-toast';

export function ExportTransactions() {
  const { toast } = useToast();

  const handleExport = async (format: 'csv' | 'pdf' = 'csv') => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1); // Last 30 days

      const data = await PaymentService.exportTransactions(startDate, endDate, format);
      if (!data) throw new Error('No data to export');

      // Create blob and download using URL.createObjectURL
      const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `trustbank-transactions-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Your transactions have been exported to ${format.toUpperCase()}`
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export transactions",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex space-x-2">
      <Button variant="outline" onClick={() => handleExport('csv')}>
        <Download className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
      <Button variant="outline" onClick={() => handleExport('pdf')}>
        <Download className="mr-2 h-4 w-4" />
        Export PDF
      </Button>
    </div>
  );
} 