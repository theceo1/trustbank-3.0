"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Copy, Check, AlertCircle, Download } from 'lucide-react';
import { useToast } from '@/app/hooks/use-toast';
import { PaymentService } from '@/app/lib/services/payment/PaymentService';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface QRCodePaymentProps {
  onSuccess?: () => void;
}

export default function QRCodePayment({ onSuccess }: QRCodePaymentProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [qrCode, setQrCode] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isFixedAmount, setIsFixedAmount] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [merchantData, setMerchantData] = useState<any>(null);

  useEffect(() => {
    const fetchMerchantData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/merchant/profile');
        const data = await response.json();
        setMerchantData(data);
        await generateQR();
      } catch (error) {
        console.error('Error fetching merchant data:', error);
        setError('Failed to fetch merchant details');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchMerchantData();
    }
  }, [session]);

  const generateQR = async () => {
    try {
      setIsLoading(true);
      const qrData = await PaymentService.generateMerchantQR(
        merchantData?.id,
        isFixedAmount ? parseFloat(amount) : undefined
      );
      setQrCode(qrData);
    } catch (error) {
      console.error('Error generating QR code:', error);
      setError('Failed to generate QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "QR code data copied to clipboard"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy QR code data",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    if (!qrCode) return;
    
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `trustme-qr-${new Date().toISOString()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!session?.user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>trustMe QR Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please sign in to access trustMe payments</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>trustMe QR Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>trustMe QR Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>trustMe QR Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {merchantData && (
          <div className="space-y-2">
            <h3 className="font-semibold">{merchantData.business_name}</h3>
            <p className="text-sm text-muted-foreground">{merchantData.description}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="fixed-amount"
              checked={isFixedAmount}
              onCheckedChange={setIsFixedAmount}
            />
            <Label htmlFor="fixed-amount">Fixed Amount</Label>
          </div>

          {isFixedAmount && (
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USDT)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
          )}

          <Button onClick={generateQR} className="w-full">
            Generate QR Code
          </Button>
        </div>

        {qrCode && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative w-64 h-64">
                <Image
                  src={qrCode}
                  alt="QR Code"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleCopy(qrCode)}
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                Copy
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Share this QR code with your customers to receive payments in USDT.
                {isFixedAmount && amount && (
                  <> Fixed amount: {amount} USDT</>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 