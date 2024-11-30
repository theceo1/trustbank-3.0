import { type Toast } from '@/components/ui/toast';

export class TradeErrorHandler {
  static handleError(error: any, context: string, showToast: (props: Toast) => void) {
    console.error(`${context}:`, error);

    if (error.name === 'RateExpiredError') {
      showToast({
        id: "rate-expired",
        title: "Rate Expired",
        description: "Please refresh the rate to continue",
        variant: "warning"
      });
      return;
    }

    if (error.name === 'InsufficientFundsError') {
      showToast({
        id: "insufficient-funds",
        title: "Insufficient Funds",
        description: "Please top up your wallet to continue",
        variant: "destructive"
      });
      return;
    }

    if (error.name === 'KYCRequiredError') {
      showToast({
        id: "kyc-required",
        title: "KYC Required",
        description: "Please complete KYC verification to continue",
        variant: "destructive"
      });
      return;
    }

    showToast({
      id: "default-error",
      title: "Error",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
  }

  static isRecoverableError(error: any): boolean {
    return ['RateExpiredError', 'NetworkError'].includes(error.name);
  }
}