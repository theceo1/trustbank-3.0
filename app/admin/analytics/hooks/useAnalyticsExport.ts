import { useState } from 'react';
import { exportAnalyticsReport, ReportGenerator } from '../utils/exportReports';
import { useToast } from '@/hooks/use-toast';

export function useAnalyticsExport() {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportReport = async (
    data: any,
    options: {
      format: 'csv' | 'xlsx' | 'pdf';
      dateRange: { from: Date; to: Date };
      includeMetrics: string[];
    }
  ) => {
    try {
      setIsExporting(true);
      const reportGenerator = new ReportGenerator(data, options.dateRange);
      await reportGenerator.generateReport(options);
      
      toast({
        id: 'export-success',
        title: "Success",
        description: "Report exported successfully",
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        id: 'export-error',
        title: "Error",
        description: "Failed to export report",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportReport,
    isExporting
  };
}