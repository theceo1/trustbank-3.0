import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency } from './format';

interface ReceiptData {
  id: string;
  reference: string;
  type: string;
  currency: string;
  amount: number;
  rate: number;
  fees: {
    platform: number;
    processing: number;
    total: number;
  };
  status: string;
  date: string;
}

export async function generatePDF(data: ReceiptData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Add header
  doc.setFontSize(20);
  doc.text('trustBank', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text('Trade Receipt', pageWidth / 2, 30, { align: 'center' });

  // Add trade details
  doc.setFontSize(12);
  const startY = 50;
  const lineHeight = 10;
  let currentY = startY;

  const addLine = (label: string, value: string) => {
    doc.text(label, 20, currentY);
    doc.text(value, pageWidth - 20, currentY, { align: 'right' });
    currentY += lineHeight;
  };

  addLine('Trade ID:', data.id);
  addLine('Reference:', data.reference);
  addLine('Date:', data.date);
  addLine('Type:', data.type.toUpperCase());
  addLine('Amount:', formatCurrency(data.amount, data.currency));
  addLine('Rate:', formatCurrency(data.rate));
  
  // Add separator line
  currentY += 5;
  doc.line(20, currentY, pageWidth - 20, currentY);
  currentY += 10;

  // Add fees
  addLine('Platform Fee (1.6%):', formatCurrency(data.fees.platform));
  addLine('Processing Fee (1.4%):', formatCurrency(data.fees.processing));
  addLine('Total Fee (3%):', formatCurrency(data.fees.total));

  // Add separator line
  currentY += 5;
  doc.line(20, currentY, pageWidth - 20, currentY);
  currentY += 10;

  // Add total
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  addLine('Total Amount:', formatCurrency(data.amount + data.fees.total));
  doc.setFont('helvetica', 'normal');

  // Add status
  currentY += 10;
  const statusColor = data.status === 'COMPLETED' ? [0, 128, 0] : [0, 0, 0];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(`Status: ${data.status}`, pageWidth / 2, currentY, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // Add footer
  doc.setFontSize(10);
  const footerText = 'This is an electronically generated receipt and does not require a signature.';
  doc.text(footerText, pageWidth / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center' });

  // Save the PDF
  doc.save(`trade-receipt-${data.reference}.pdf`);
} 