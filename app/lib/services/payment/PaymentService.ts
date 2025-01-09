import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/app/types/database';
import { PaymentMethod, PaymentMethodType, PaymentStatus } from '@/app/types/payment';
import QRCodeLib from 'qrcode';
import { toast } from 'sonner';
import { QuidaxClient } from '../quidax-client';

export type PaymentProcessor = {
  process: (amount: number, currency: string, metadata?: any) => Promise<any>;
  verify: (reference: string) => Promise<boolean>;
};

const defaultProcessors: Record<PaymentMethodType, PaymentProcessor> = {
  wallet: {
    process: async () => { throw new Error('Not implemented'); },
    verify: async () => false
  },
  card: {
    process: async () => { throw new Error('Not implemented'); },
    verify: async () => false
  },
  bank_transfer: {
    process: async () => { throw new Error('Not implemented'); },
    verify: async () => false
  },
  crypto: {
    process: async () => { throw new Error('Not implemented'); },
    verify: async () => false
  },
  qr_code: {
    process: async () => { throw new Error('Not implemented'); },
    verify: async () => false
  },
  mobile_money: {
    process: async () => { throw new Error('Not implemented'); },
    verify: async () => false
  }
};

export class PaymentService {
  private static supabase = createClientComponentClient<Database>();
  private static processors: Record<PaymentMethodType, PaymentProcessor> = defaultProcessors;
  private static quidaxClient = new QuidaxClient(process.env.QUIDAX_SECRET_KEY || '');

  static registerProcessor(type: PaymentMethodType, processor: PaymentProcessor) {
    this.processors[type] = processor;
  }

  static async processPayment(
    amount: number,
    currency: string,
    method: PaymentMethodType,
    metadata?: any
  ) {
    const processor = this.processors[method];
    if (!processor) {
      throw new Error(`Payment method ${method} not supported`);
    }

    try {
      const result = await processor.process(amount, currency, metadata);
      await this.recordTransaction({
        amount,
        currency,
        type: method,
        status: 'pending',
        reference: result.reference,
        metadata: result.metadata
      });
      return result;
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  }

  static async verifyPayment(reference: string, method: PaymentMethodType) {
    const processor = this.processors[method];
    if (!processor) {
      throw new Error(`Payment method ${method} not supported`);
    }

    try {
      const isValid = await processor.verify(reference);
      if (isValid) {
        await this.updateTransactionStatus(reference, 'completed');
        this.notifyPaymentSuccess(reference);
      }
      return isValid;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  static async generateMerchantQR(merchantId: string, amount?: number) {
    const payload = {
      v: 1, // version
      id: merchantId,
      t: 'merchant',
      a: amount // optional amount
    };
    
    return await QRCodeLib.toDataURL(JSON.stringify(payload));
  }

  static async processMerchantQRPayment(qrData: string, amount: number) {
    try {
      const data = JSON.parse(qrData);
      if (data.t !== 'merchant') {
        throw new Error('Invalid QR code type');
      }

      // Process crypto payment to merchant
      return await this.processPayment(amount, 'USDT', 'crypto', {
        merchantId: data.id,
        qrVersion: data.v
      });
    } catch (error) {
      console.error('QR payment error:', error);
      throw error;
    }
  }

  static async getCryptoDepositAddress(currency: string) {
    try {
      const { data: session } = await this.supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('User not authenticated');

      // Get user's Quidax ID from profile
      const { data: profile } = await this.supabase
        .from('user_profiles')
        .select('quidax_id')
        .eq('user_id', session.session.user.id)
        .single();

      if (!profile?.quidax_id) throw new Error('Quidax ID not found');

      const address = await this.quidaxClient.getDepositAddress(currency, profile.quidax_id);
      return address;
    } catch (error) {
      console.error('Error getting deposit address:', error);
      throw error;
    }
  }

  private static async recordTransaction(data: {
    amount: number;
    currency: string;
    type: string;
    status: PaymentStatus;
    reference: string;
    metadata?: any;
  }) {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await this.supabase.from('transactions').insert({
      user_id: user.id,
      ...data
    });

    if (error) throw error;
  }

  private static async updateTransactionStatus(
    reference: string,
    status: PaymentStatus
  ) {
    const { error } = await this.supabase
      .from('transactions')
      .update({ status })
      .eq('reference', reference);

    if (error) throw error;
  }

  private static notifyPaymentSuccess(reference: string) {
    // Send real-time notification
    this.supabase.channel('payment-notifications')
      .send({
        type: 'broadcast',
        event: 'payment_success',
        payload: { reference }
      });

    // Show toast notification
    toast.success('Payment successful', {
      description: 'Your payment has been processed successfully'
    });
  }

  static async exportTransactions(
    startDate: Date,
    endDate: Date,
    format: 'csv' | 'pdf' = 'csv'
  ) {
    const { data: session } = await this.supabase.auth.getSession();
    if (!session?.session?.user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('transactions')
      .select('*')
      .eq('user_id', session.session.user.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data?.length) return null;

    // Format data for export
    const formattedData = data.map(transaction => ({
      Date: new Date(transaction.created_at).toLocaleDateString(),
      Type: transaction.type,
      Amount: transaction.amount,
      Currency: transaction.currency,
      Status: transaction.status,
      Reference: transaction.reference
    }));

    return format === 'csv' 
      ? this.generateCSV(formattedData)
      : this.generatePDF(formattedData);
  }

  private static async generateCSV(data: any[]) {
    if (!data.length) return null;

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(',')
    );

    return `${headers}\n${rows.join('\n')}`;
  }

  private static async generatePDF(data: any[]) {
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('trustBank Transaction History', 14, 15);
    
    // Add date range
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);
    
    // Prepare table data
    const headers = Object.keys(data[0]).map(header => 
      header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    );
    
    const rows = data.map(row => Object.values(row).map(value => 
      value instanceof Date ? value.toLocaleDateString() : String(value)
    ));

    // Add table
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 35,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });

    return doc.output('blob');
  }
} 