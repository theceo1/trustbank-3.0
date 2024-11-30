import { PaymentStatus } from '@/app/types/payment';

export class PaymentStatusTracker {
    private static statusFlow = {
      'initiated': ['processing', 'failed'],
      'processing': ['confirming', 'failed'],
      'confirming': ['completed', 'failed'],
      'completed': [],
      'failed': []
    };
  
    static validateStatusTransition(
      currentStatus: PaymentStatus,
      newStatus: PaymentStatus
    ): boolean {
      const allowedTransitions = this.statusFlow[currentStatus as keyof typeof this.statusFlow];
      return allowedTransitions.includes(newStatus as never);
    }
  
    static getEstimatedTimeRemaining(status: PaymentStatus): number {
      const estimatedTimes = {
        'initiated': 30,
        'processing': 60,
        'confirming': 20,
        'completed': 0,
        'failed': 0
      };
  
      return estimatedTimes[status as keyof typeof estimatedTimes];
    }
  }