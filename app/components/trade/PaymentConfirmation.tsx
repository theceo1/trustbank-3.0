import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface PaymentConfirmationProps {
  tradeId: string;
  amount: number;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
  onComplete: () => void;
}

export function PaymentConfirmation({ 
  tradeId, 
  amount, 
  bankDetails,
  onComplete 
}: PaymentConfirmationProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      id: "copy-success",
      title: "Copied!",
      description: "Account details copied to clipboard",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Your Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {bankDetails && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Bank Name</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{bankDetails.bankName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(bankDetails.bankName)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Account Number</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{bankDetails.accountNumber}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(bankDetails.accountNumber)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Account Name</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{bankDetails.accountName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(bankDetails.accountName)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="font-medium">₦{amount.toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Button 
            className="w-full" 
            onClick={onComplete}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            I&apos;ve Made the Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}