import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  dateRange: { from: Date; to: Date };
  includeMetrics: string[];
}

export async function exportAnalyticsReport(data: any, options: ExportOptions) {
  const fileName = `analytics_report_${format(new Date(), 'yyyy-MM-dd')}`;

  switch (options.format) {
    case 'csv':
      return exportCSV(data, fileName);
    case 'xlsx':
      return exportXLSX(data, fileName);
    case 'pdf':
      return exportPDF(data, fileName);
    default:
      throw new Error('Unsupported export format');
  }
}

function exportCSV(data: any, fileName: string) {
  const csvData = convertToCSV(data);
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${fileName}.csv`);
}

function exportXLSX(data: any, fileName: string) {
  const wb = XLSX.utils.book_new();
  
  // Create worksheets for different metrics
  Object.entries(data).forEach(([metric, values]) => {
    const ws = XLSX.utils.json_to_sheet(values as any[]);
    XLSX.utils.book_append_sheet(wb, ws, metric);
  });

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${fileName}.xlsx`);
}

async function exportPDF(data: any, fileName: string) {
  // Implementation for PDF export
  // You might want to use a library like pdfmake or jspdf
}

function convertToCSV(data: any): string {
  const items = data.map((item: any) => {
    return Object.values(item).join(',');
  });

  const headers = Object.keys(data[0]).join(',');
  return [headers, ...items].join('\n');
}

// Create a report generator utility
export class ReportGenerator {
  private data: any;
  private dateRange: { from: Date; to: Date };

  constructor(data: any, dateRange: { from: Date; to: Date }) {
    this.data = data;
    this.dateRange = dateRange;
  }

  async generateReport(options: ExportOptions) {
    const reportData = this.prepareReportData(options.includeMetrics);
    return exportAnalyticsReport(reportData, options);
  }

  private prepareReportData(metrics: string[]) {
    const reportData: any = {};

    metrics.forEach(metric => {
      switch (metric) {
        case 'userGrowth':
          reportData[metric] = this.processUserGrowthData();
          break;
        case 'referrals':
          reportData[metric] = this.processReferralData();
          break;
        case 'transactions':
          reportData[metric] = this.processTransactionData();
          break;
        // Add more metrics as needed
      }
    });

    return reportData;
  }

  private processUserGrowthData() {
    // Process user growth data for reporting
    return this.data.userGrowth.map((item: any) => ({
      Date: item.date,
      'New Users': item.value,
      'Cumulative Users': item.cumulative
    }));
  }

  private processReferralData() {
    // Process referral data for reporting
    return this.data.referralMetrics.map((item: any) => ({
      Date: item.date,
      'Referral Count': item.count,
      'Conversion Rate': item.conversionRate,
      'Total Earnings': item.earnings
    }));
  }

  private processTransactionData() {
    // Process transaction data for reporting
    return this.data.transactionData.map((item: any) => ({
      Date: item.date,
      Amount: item.amount,
      Status: item.status,
      'Transaction Type': item.type
    }));
  }
}