"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function TradingVolume() {
  const [volume, setVolume] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching trading volume
    setVolume(7100000); // Fixed value for now
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trading Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[100px]">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trading Volume</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatCurrency(volume, 'NGN')}
        </div>
        <p className="text-xs text-muted-foreground">
          Last 30 days
        </p>
      </CardContent>
    </Card>
  );
} 