export interface PaymentFeedbackProps {
    tradeId: string;
    onSubmit: (feedback: {
      tradeId: string;
      rating: number;
      comment: string;
    }) => Promise<void>;
  }