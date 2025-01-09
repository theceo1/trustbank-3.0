"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import VirtualAccountDetails from '@/components/payment/VirtualAccountDetails';
import CardPaymentForm from '@/components/payment/CardPaymentForm';
import CryptoDeposit from '@/components/payment/CryptoDeposit';
import QRCodePayment from '@/components/payment/QRCodePayment';
import TransactionHistory from '@/components/payment/TransactionHistory';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { PaymentService } from '@/app/lib/services/payment/PaymentService';
import { useToast } from '@/app/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SUPPORTED_CRYPTO = [
  { value: 'btc', label: 'Bitcoin (BTC)' },
  { value: 'eth', label: 'Ethereum (ETH)' },
  { value: 'usdt', label: 'Tether (USDT)' },
  { value: 'usdc', label: 'USD Coin (USDC)' }
];

export default function DepositPage() {
  const [activeTab, setActiveTab] = useState('bank');
  const [selectedCrypto, setSelectedCrypto] = useState(SUPPORTED_CRYPTO[0].value);
  const { toast } = useToast();

  const handleExport = async (format: 'csv' | 'pdf' = 'csv') => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1); // Last 30 days

      const data = await PaymentService.exportTransactions(startDate, endDate, format);
      if (!data) throw new Error('No data to export');
      
      // Only run client-side code in useEffect or event handlers
      if (typeof window !== 'undefined') {
        const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trustbank-transactions-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }

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
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Deposit Funds</h1>
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
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="bank">Bank Transfer</TabsTrigger>
              <TabsTrigger value="card">Card Payment</TabsTrigger>
              <TabsTrigger value="crypto">Crypto</TabsTrigger>
              <TabsTrigger value="qr">trustMe</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bank" className="mt-4">
              <VirtualAccountDetails />
            </TabsContent>
            
            <TabsContent value="card" className="mt-4">
              <CardPaymentForm />
            </TabsContent>

            <TabsContent value="crypto" className="mt-4">
              <div className="space-y-4">
                <div className="w-full max-w-xs">
                  <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cryptocurrency" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_CRYPTO.map((crypto) => (
                        <SelectItem key={crypto.value} value={crypto.value}>
                          {crypto.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <CryptoDeposit currency={selectedCrypto} />
              </div>
            </TabsContent>

            <TabsContent value="qr" className="mt-4">
              <QRCodePayment />
            </TabsContent>
          </Tabs>
        </div>

        <div className="md:col-span-1">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Transactions</h2>
            </div>
            <TransactionHistory limit={5} type="deposit" />
          </Card>
        </div>
      </div>
    </div>
  );
} 