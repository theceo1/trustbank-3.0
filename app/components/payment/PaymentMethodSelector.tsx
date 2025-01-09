"use client";

import { useState } from 'react';
import { PaymentMethod, PaymentMethodType } from '@/app/types/payment';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { cn } from '@/app/lib/utils';

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  onSelect: (method: PaymentMethodType) => void;
  selectedMethod?: PaymentMethodType;
}

export function PaymentMethodSelector({
  methods,
  onSelect,
  selectedMethod
}: PaymentMethodSelectorProps) {
  const [selected, setSelected] = useState<PaymentMethodType | undefined>(selectedMethod);

  const handleSelect = (method: PaymentMethodType) => {
    setSelected(method);
    onSelect(method);
  };

  return (
    <RadioGroup
      defaultValue={selectedMethod}
      onValueChange={(value) => handleSelect(value as PaymentMethodType)}
      className="grid gap-4"
    >
      {methods.map((method) => (
        <div key={method.type}>
          <RadioGroupItem
            value={method.type}
            id={method.type}
            className="peer sr-only"
            disabled={!method.enabled}
          />
          <Label
            htmlFor={method.type}
            className={cn(
              "flex items-center justify-between p-4 border rounded-lg cursor-pointer",
              "hover:border-primary/50 transition-colors",
              "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
              "peer-aria-checked:border-primary peer-aria-checked:bg-primary/5",
              selected === method.type ? "border-primary bg-primary/5" : "border-border"
            )}
          >
            <div className="flex items-center gap-4">
              <Image
                src={`/images/payment/${method.type}.svg`}
                alt={method.name}
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <div>
                <p className="font-medium">{method.name}</p>
                <p className="text-sm text-muted-foreground">{method.description}</p>
              </div>
            </div>
            {!method.enabled && (
              <Badge variant="outline" className="ml-2">
                Coming Soon
              </Badge>
            )}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}