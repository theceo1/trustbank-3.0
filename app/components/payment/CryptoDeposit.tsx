"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Copy, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/app/hooks/use-toast';
import { QuidaxClient } from '@/app/lib/services/quidax-client';
import { Skeleton } from '@/components/ui/skeleton';

interface Network {
  name: string;
  code: string;
  fee: string;
  min_amount: string;
  max_amount: string;
}

interface CryptoDepositProps {
  currency: string;
  onSuccess?: () => void;
}

export default function CryptoDeposit({ currency, onSuccess }: CryptoDepositProps) {
  const { toast } = useToast();
  const [networks, setNetworks] = useState<Network[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [depositAddress, setDepositAddress] = useState<string>('');
  const [tag, setTag] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/wallet/networks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ currency })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch networks');
        }

        const data = await response.json();
        setNetworks(data);
        
        if (data.length > 0) {
          setSelectedNetwork(data[0].code);
        }
      } catch (error) {
        console.error('Error fetching networks:', error);
        setError('Failed to fetch available networks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNetworks();
  }, [currency]);

  useEffect(() => {
    const getAddress = async () => {
      if (!selectedNetwork) return;

      try {
        setIsLoading(true);
        const response = await fetch('/api/wallet/deposit-address', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ currency, network: selectedNetwork })
        });

        if (!response.ok) {
          throw new Error('Failed to get deposit address');
        }

        const data = await response.json();
        setDepositAddress(data.address);
        if (data.tag) {
          setTag(data.tag);
        }
      } catch (error) {
        console.error('Error getting deposit address:', error);
        setError('Failed to get deposit address');
      } finally {
        setIsLoading(false);
      }
    };

    getAddress();
  }, [currency, selectedNetwork]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Address copied to clipboard"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy address",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deposit {currency.toUpperCase()}</CardTitle>
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
          <CardTitle>Deposit {currency.toUpperCase()}</CardTitle>
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
        <CardTitle>Deposit {currency.toUpperCase()}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Network</label>
          <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
            <SelectTrigger>
              <SelectValue placeholder="Select a network" />
            </SelectTrigger>
            <SelectContent>
              {networks.map((network) => (
                <SelectItem key={network.code} value={network.code}>
                  {network.name} (Fee: {network.fee})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {depositAddress && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Deposit Address</label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 p-2 bg-muted rounded-md text-sm break-all">
                  {depositAddress}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(depositAddress)}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {tag && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Destination Tag (Required)</label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 p-2 bg-muted rounded-md text-sm">
                    {tag}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(tag)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Only send {currency.toUpperCase()} to this address on the {networks.find(n => n.code === selectedNetwork)?.name} network.
                Minimum deposit: {networks.find(n => n.code === selectedNetwork)?.min_amount} {currency.toUpperCase()}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 