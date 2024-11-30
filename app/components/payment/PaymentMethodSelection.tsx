"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Bank, CreditCard, Wallet } from "lucide-react";

export type PaymentMethod = "bank" | "card" | "wallet";

interface PaymentMethodSelectionProps {
  availableMethods: PaymentMethod[];
  onSelect: (method: PaymentMethod) => void;
  selectedMethod: PaymentMethod;
  walletBalance?: number;
}

export function PaymentMethodSelection({
  availableMethods,
  onSelect,
  selectedMethod,
  walletBalance
}: PaymentMethodSelectionProps) {
  const [selected, setSelected] = useState<PaymentMethod>(selectedMethod || availableMethods[0]);

  const handleSelect = (method: PaymentMethod) => {
    setSelected(method);
    onSelect(method);
  };

  const methodConfig = {
    bank: {
      icon: Bank,
      title: "Bank Transfer",
      description: "Pay directly from your bank account"
    },
    card: {
      icon: CreditCard,
      title: "Card Payment",
      description: "Pay with your debit or credit card"
    },
    wallet: {
      icon: Wallet,
      title: "Wallet Balance",
      description: `Available balance: ₦${walletBalance?.toLocaleString() || 0}`
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selected}
          onValueChange={(value) => handleSelect(value as PaymentMethod)}
          className="space-y-4"
        >
          {availableMethods.map((method) => {
            const config = methodConfig[method];
            const Icon = config.icon;

            return (
              <div key={method} className="flex items-center space-x-4">
                <RadioGroupItem value={method} id={method} />
                <Label
                  htmlFor={method}
                  className="flex items-center space-x-3 cursor-pointer flex-1"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{config.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {config.description}
                    </p>
                  </div>
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}