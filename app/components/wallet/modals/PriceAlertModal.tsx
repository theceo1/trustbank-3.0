"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Bell, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from "@/app/hooks/use-toast";

interface PriceAlert {
  id: string;
  currency: string;
  price: number;
  condition: "above" | "below";
  isEnabled: boolean;
}

interface NewAlert {
  price: string;
  condition: "above" | "below";
}

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  currentPrice: number;
}

export default function PriceAlertModal({
  isOpen,
  onClose,
  currency,
  currentPrice,
}: PriceAlertModalProps) {
  const { showNotification } = useNotifications();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`priceAlerts_${currency.toLowerCase()}`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [newAlert, setNewAlert] = useState<NewAlert>({
    price: "",
    condition: "above",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Save alerts to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `priceAlerts_${currency.toLowerCase()}`,
        JSON.stringify(alerts)
      );
    }
  }, [alerts, currency]);

  useEffect(() => {
    if (!currentPrice || alerts.length === 0) return;

    const checkAlerts = () => {
      alerts.forEach(alert => {
        if (!alert.isEnabled) return;

        const shouldNotify = alert.condition === 'above' 
          ? currentPrice >= alert.price
          : currentPrice <= alert.price;

        if (shouldNotify) {
          showNotification(
            `${currency.toUpperCase()} Price Alert`,
            {
              body: `${currency.toUpperCase()} price is now ${alert.condition} ${formatCurrency(alert.price, 'NGN')}`,
              icon: '/logo.png',
              badge: '/logo.png',
              tag: `price-alert-${currency}-${alert.id}`, // Prevent duplicate notifications
              data: {
                currency,
                price: alert.price,
                condition: alert.condition,
              },
            }
          );

          // Disable the alert after triggering
          handleToggleAlert(alert.id);
        }
      });
    };

    // Check alerts immediately and set up interval
    checkAlerts();
    const interval = setInterval(checkAlerts, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [alerts, currentPrice, currency, showNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currency,
          targetPrice: parseFloat(newAlert.price),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to set price alert");
      }

      // Use setTimeout to delay the state updates
      setTimeout(() => {
        toast({
          title: "Price Alert Set",
          description: `You will be notified when ${currency.toUpperCase()} reaches ${newAlert.price}`,
        });
        onClose();
      }, 0);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set price alert");
    } finally {
      setLoading(false);
    }
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setNewAlert({ price: "", condition: "above" });
      setError("");
    }
  }, [isOpen]);

  const handleAddAlert = () => {
    const price = parseFloat(newAlert.price);
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price",
        variant: "destructive"
      });
      return;
    }

    const newAlertObj: PriceAlert = {
      id: crypto.randomUUID(),
      currency: currency.toLowerCase(),
      price,
      condition: newAlert.condition,
      isEnabled: true,
    };

    setAlerts(prev => [...prev, newAlertObj]);
    setNewAlert({ price: "", condition: "above" });

    toast({
      title: "Alert Created",
      description: `You will be notified when ${currency.toUpperCase()} goes ${newAlert.condition} ${formatCurrency(price, "NGN")}`
    });
  };

  const handleToggleAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId
          ? { ...alert, isEnabled: !alert.isEnabled }
          : alert
      )
    );
  };

  const handleDeleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    toast({
      title: "Alert Deleted",
      description: "Price alert has been removed"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Price Alert</DialogTitle>
          <DialogDescription>
            Get notified when {currency.toUpperCase()} reaches your target price
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">
              Current Price: {currentPrice ? formatCurrency(currentPrice, 'NGN') : 'Loading...'}
            </label>
            <Input
              type="number"
              placeholder="Enter target price"
              value={newAlert.price}
              onChange={(e) => setNewAlert(prev => ({ ...prev, price: e.target.value }))}
              className="mt-1"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? "Setting Alert..." : "Set Alert"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 