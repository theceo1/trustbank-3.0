import { toast } from 'sonner';

export class TradeErrorHandler {
  static handleError(error: Error) {
    console.error('Trade error:', error);

    // Handle specific error cases
    if (error.message.includes('rate expired')) {
      toast.error("Rate Expired", {
        description: "Please refresh the rate to continue"
      });
      return;
    }

    if (error.message.includes('insufficient balance')) {
      toast.error("Insufficient Balance", {
        description: "Please fund your wallet to continue"
      });
      return;
    }

    if (error.message.includes('limit exceeded')) {
      toast.error("Limit Exceeded", {
        description: "Please upgrade your KYC level to increase your limits"
      });
      return;
    }

    // Default error message
    toast.error("Trade Failed", {
      description: error.message || "An error occurred while processing your trade"
    });
  }
}