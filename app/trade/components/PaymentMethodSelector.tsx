"use client";

import { useState } from 'react';
import { Check, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from 'next/image';

interface PaymentMethodDetails {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  limits: {
    min: number;
    max: number;
  };
  fees: {
    percentage: number;
    fixed: number;
  };
}

interface PaymentMethodSelectorProps {
  methods: PaymentMethodDetails[];
  selectedMethod: string;
  onSelect: (method: string) => void;
  amount: number;
}

export function PaymentMethodSelector({
  methods,
  selectedMethod,
  onSelect,
  amount
}: PaymentMethodSelectorProps) {
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (method: PaymentMethodDetails) => {
    if (amount < method.limits.min) {
      setError(`Minimum amount for ${method.name} is ${method.limits.min}`);
      return;
    }
    if (amount > method.limits.max) {
      setError(`Maximum amount for ${method.name} is ${method.limits.max}`);
      return;
    }
    setError(null);
    onSelect(method.id);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map((method) => (
          <Card
            key={method.id}
            className={cn(
              "p-4 cursor-pointer transition-all",
              selectedMethod === method.id
                ? "border-primary bg-primary/5"
                : "hover:border-primary/50",
              !method.enabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => method.enabled && handleSelect(method)}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Image src={method.icon} alt={method.name} className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{method.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Fee: {method.fees.percentage}% + ₦{method.fees.fixed}
                </p>
              </div>
              {selectedMethod === method.id && (
                <Check className="w-5 h-5 text-primary" />
              )}
            </div>
          </Card>
        ))}
      </div>
      
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}