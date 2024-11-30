"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from 'react';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(value);

  const handleSelect = (range: DateRange | undefined) => {
    if (range) {
      setDateRange(range);
      onChange(range);
    }
  };

  return (
    <Calendar
      mode="range"
      selected={dateRange}
      onSelect={handleSelect}
      numberOfMonths={2}
      className={className}
    />
  );
}