import { Button } from "@/components/ui/button";
import { TradeReceipt } from "./TradeReceipt";
import { TradeDetails } from "@/app/types/trade";
import { Loader2 } from "lucide-react";

interface TradeConfirmationProps {
  trade: TradeDetails;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function TradeConfirmation({ 
  trade, 
  onConfirm, 
  onCancel, 
  isLoading 
}: TradeConfirmationProps) {
  return (
    <div className="space-y-6">
      <TradeReceipt trade={trade} />
      
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Confirm Trade
        </Button>
      </div>
    </div>
  );
}