import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

export interface EnhancedExportOptions {
  format: 'csv' | 'xlsx' | 'pdf' | 'json';
  dateRange: { from: Date; to: Date };
  includeMetrics: string[];
  styling?: {
    theme?: 'light' | 'dark';
    colors?: string[];
    logo?: string;
  };
  customHeaders?: { [key: string]: string };
  filters?: { [key: string]: any };
}

export class EnhancedReportExporter {
  private data: any;
  private options: EnhancedExportOptions;

  constructor(data: any, options: EnhancedExportOptions) {
    this.data = data;
    this.options = options;
  }

  async export() {
    const fileName = `analytics_report_${format(new Date(), 'yyyy-MM-dd')}`;
    const processedData = this.processData();

    switch (this.options.format) {
      case 'csv':
        return this.exportCSV(processedData, fileName);
      case 'xlsx':
        return this.exportXLSX(processedData, fileName);
      case 'pdf':
        return this.exportPDF(processedData, fileName);
      case 'json':
        return this.exportJSON(processedData, fileName);
      default:
        throw new Error('Unsupported export format');
    }
  }

  private processData() {
    // Apply filters
    let processedData = this.applyFilters(this.data);
    
    // Apply custom headers
    if (this.options.customHeaders) {
      processedData = this.applyCustomHeaders(processedData);
    }

    return processedData;
  }

  private applyFilters(data: any) {
    if (!this.options.filters) return data;

    return data.filter((item: any) => {
      return Object.entries(this.options.filters!).every(([key, value]) => {
        if (Array.isArray(value)) {
          return value.includes(item[key]);
        }
        return item[key] === value;
      });
    });
  }

  private applyCustomHeaders(data: any) {
    return data.map((item: any) => {
      const newItem: any = {};
      Object.entries(item).forEach(([key, value]) => {
        const newKey = this.options.customHeaders?.[key] || key;
        newItem[newKey] = value;
      });
      return newItem;
    });
  }

  private exportCSV(data: any[], fileName: string) {
    const csvData = this.convertToCSV(data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${fileName}.csv`);
  }

  private exportXLSX(data: any[], fileName: string) {
    const wb = XLSX.utils.book_new();
    
    // Add multiple sheets based on metrics
    this.options.includeMetrics.forEach(metric => {
      const metricData = data.filter(item => item.metric === metric);
      const ws = XLSX.utils.json_to_sheet(metricData);
      XLSX.utils.book_append_sheet(wb, ws, metric);
    });

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${fileName}.xlsx`);
  }

  private async exportPDF(data: any[], fileName: string) {
    const doc = new jsPDF();
    
    // Add logo if provided
    if (this.options.styling?.logo) {
      doc.addImage(this.options.styling.logo, 'PNG', 10, 10, 40, 40);
    }

    // Add title
    doc.setFontSize(16);
    doc.text('Analytics Report', 14, 60);

    // Add date range
    doc.setFontSize(12);
    doc.text(
      `Period: ${format(this.options.dateRange.from, 'PP')} - ${format(this.options.dateRange.to, 'PP')}`,
      14,
      70
    );

    // Add tables for each metric
    let yPos = 80;
    this.options.includeMetrics.forEach(metric => {
      const metricData = data.filter(item => item.metric === metric);
      
      doc.setFontSize(14);
      doc.text(metric, 14, yPos);
      yPos += 10;

      (doc as any).autoTable({
        startY: yPos,
        head: [Object.keys(metricData[0] || {})],
        body: metricData.map(Object.values),
        theme: this.options.styling?.theme === 'dark' ? 'grid' : 'striped',
      });

      yPos = (doc as any).lastAutoTable.finalY + 20;
    });

    doc.save(`${fileName}.pdf`);
  }

  private exportJSON(data: any[], fileName: string) {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    saveAs(blob, `${fileName}.json`);
  }

  private convertToCSV(data: any[]): string {
    const headers = Object.keys(data[0] || {}).join(',');
    const rows = data.map(item => Object.values(item).join(','));
    return [headers, ...rows].join('\n');
  }
}