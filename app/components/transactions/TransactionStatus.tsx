"use client";

import { useEffect, useState } from "react";
import { QuidaxService } from "@/app/lib/services/quidax";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TransactionStatusBadge } from "@/app/components/ui/transaction-status-badge";
import { TransactionStatus as TxStatus } from '@/app/types/transactions';

export default function TransactionStatusView({ status }: { status: TxStatus }) {
  return (
    <div className="flex items-center gap-2">
      <TransactionStatusBadge status={status} />
      <span>{getStatusMessage(status)}</span>
    </div>
  );
}

function getStatusMessage(status: TxStatus): string {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'Processing your transaction...';
    case 'completed':
      return 'Transaction completed successfully';
    case 'failed':
      return 'Transaction failed';
    default:
      return 'Unknown status';
  }
}