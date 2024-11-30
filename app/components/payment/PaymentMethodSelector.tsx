"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { RadioGroup } from '@/components/ui/radio-group';
import { PaymentMethod } from '@/app/types/payment';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  onSelect: (method: PaymentMethod) => void;
  selectedMethod: PaymentMethod;
}

export function PaymentMethodSelector({ 
  methods,
  onSelect,
  selectedMethod
}: PaymentMethodSelectorProps) {
  const [selected, setSelected] = useState(selectedMethod);

  const handleSelect = (method: PaymentMethod) => {
    setSelected(method);
    onSelect(method);
  };

  return (
    <RadioGroup
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      value={selected.id}
      onValueChange={(value) => handleSelect(methods.find(m => m.id === value)!)}
    >
      {methods.map((method) => (
        <Card
          key={method.id}
          className={cn(
            "relative p-4 cursor-pointer transition-all",
            "hover:shadow-md",
            "border-2",
            selected?.id === method.id 
              ? "border-primary bg-primary/5" 
              : "border-transparent"
          )}
          onClick={() => handleSelect(method)}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Image
                src={`/images/payment/${method.type}.svg`}
                alt={method.title}
                width={32}
                height={32}
                className="w-8 h-8"
              />
            </div>
            <div className="flex-grow">
              <h4 className="font-medium text-gray-900">{method.title}</h4>
              <p className="text-sm text-gray-500">
                {method.description}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </RadioGroup>
  );
}