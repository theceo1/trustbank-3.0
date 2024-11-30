"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useAnalyticsExport } from "../hooks/useAnalyticsExport";

interface ExportButtonProps {
  data: any;
  dateRange: { from: Date; to: Date };
  metrics: string[];
}

export function ExportButton({ data, dateRange, metrics }: ExportButtonProps) {
  const { exportReport, isExporting } = useAnalyticsExport();

  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf') => {
    await exportReport(data, {
      format,
      dateRange,
      includeMetrics: metrics
    });
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => handleExport('csv')}
        disabled={isExporting}
      >
        <Download className="h-4 w-4 mr-2" />
        Export CSV
      </Button>
      <Button
        variant="outline"
        onClick={() => handleExport('xlsx')}
        disabled={isExporting}
      >
        <Download className="h-4 w-4 mr-2" />
        Export Excel
      </Button>
    </div>
  );
}