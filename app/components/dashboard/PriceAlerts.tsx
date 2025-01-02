"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/app/components/ui/use-toast";

interface PriceAlert {
  id: string;
  currency: string;
  price: number;
  condition: 'above' | 'below';
  active: boolean;
}

const SUPPORTED_CURRENCIES = [
  { symbol: 'btc', name: 'Bitcoin' },
  { symbol: 'eth', name: 'Ethereum' },
  { symbol: 'usdt', name: 'Tether' },
  { symbol: 'sol', name: 'Solana' },
  { symbol: 'bnb', name: 'BNB' },
  { symbol: 'xrp', name: 'XRP' },
];

export function PriceAlerts() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [currency, setCurrency] = useState('btc');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');

  const handleAddAlert = () => {
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Price",
        description: "Please enter a valid price for the alert.",
      });
      return;
    }

    const newAlert: PriceAlert = {
      id: Math.random().toString(36).substring(7),
      currency,
      price: parseFloat(price),
      condition,
      active: true,
    };

    setAlerts([...alerts, newAlert]);
    setPrice('');
    
    toast({
      title: "Alert Created",
      description: `You will be notified when ${currency.toUpperCase()} goes ${condition} ₦${parseFloat(price).toLocaleString()}`,
    });
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
    toast({
      title: "Alert Deleted",
      description: "Price alert has been removed.",
    });
  };

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, active: !alert.active } : alert
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-4 w-4" />
          <span>Price Alerts</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_CURRENCIES.map((curr) => (
                <SelectItem key={curr.symbol} value={curr.symbol}>
                  {curr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={condition} onValueChange={(value: 'above' | 'below') => setCondition(value)}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="above">Above</SelectItem>
              <SelectItem value="below">Below</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-[120px]"
          />

          <Button onClick={handleAddAlert} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No price alerts set
            </p>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-2 rounded-lg border bg-card"
              >
                <div className="flex items-center space-x-4">
                  <Button
                    variant={alert.active ? "default" : "ghost"}
                    size="sm"
                    onClick={() => toggleAlert(alert.id)}
                  >
                    <Bell className="h-4 w-4" />
                  </Button>
                  <div className="text-sm">
                    <span className="font-medium">{alert.currency.toUpperCase()}</span>
                    <span className="text-muted-foreground"> {alert.condition} </span>
                    <span>₦{alert.price.toLocaleString()}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteAlert(alert.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
} 