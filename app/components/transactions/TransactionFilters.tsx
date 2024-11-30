"use client";

import { Transaction } from "@/app/types/transactions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { DateRange } from "react-day-picker";

interface TransactionFilters {
  type?: Transaction['type'];
  startDate?: Date;
  endDate?: Date;
}

interface TransactionFiltersProps {
  onFilterChange: (filters: TransactionFilters) => void;
}

export default function TransactionFilters({ onFilterChange }: TransactionFiltersProps) {
  const [type, setType] = useState<Transaction['type'] | undefined>();
  const [dateRange, setDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});

  const handleFilterChange = () => {
    onFilterChange({
      type,
      startDate: dateRange.from,
      endDate: dateRange.to,
    });
  };

  return (
    <div className="flex gap-4 mb-6">
      <Select
        value={type}
        onValueChange={(value: Transaction['type']) => {
          setType(value);
          handleFilterChange();
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Transaction Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Transactions</SelectItem>
          <SelectItem value="deposit">Deposits</SelectItem>
          <SelectItem value="withdrawal">Withdrawals</SelectItem>
          <SelectItem value="trade">Trades</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.from}
            selected={dateRange as DateRange}
            onSelect={(range) => {
              setDateRange(range || {});
              handleFilterChange();
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}