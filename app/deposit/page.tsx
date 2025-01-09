"use client";

import { useState, useEffect } from 'react';
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
import dynamic from 'next/dynamic';

const SUPPORTED_CRYPTO = [
  { value: 'btc', label: 'Bitcoin (BTC)' },
  { value: 'eth', label: 'Ethereum (ETH)' },
  { value: 'usdt', label: 'Tether (USDT)' },
  { value: 'usdc', label: 'USD Coin (USDC)' }
];

// Dynamically import components that use browser APIs
const DynamicDepositPage = dynamic(() => Promise.resolve(DepositPage), {
  ssr: false
});

function DepositPage() {
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

      const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trustbank-transactions-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bank">Bank Transfer</TabsTrigger>
              <TabsTrigger value="card">Card Payment</TabsTrigger>
              <TabsTrigger value="crypto">Crypto</TabsTrigger>
            </TabsList>
            <TabsContent value="bank">
              <Card className="p-6">
                <VirtualAccountDetails />
              </Card>
            </TabsContent>
            <TabsContent value="card">
              <Card className="p-6">
                <CardPaymentForm />
              </Card>
            </TabsContent>
            <TabsContent value="crypto">
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Cryptocurrency</label>
                    <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                      <SelectTrigger>
                        <SelectValue />
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
                  <QRCodePayment onSuccess={() => {
                    toast({
                      title: "Payment Successful",
                      description: "Your crypto deposit has been confirmed"
                    });
                  }} />
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
            <TransactionHistory />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DynamicDepositPage; 