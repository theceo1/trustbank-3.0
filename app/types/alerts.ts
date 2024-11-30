export type AlertCondition = 'above' | 'below';

export interface RateAlert {
  id: string;
  userId: string;
  currency: string;
  targetRate: number;
  condition: AlertCondition;
  notificationMethod: 'email' | 'push' | 'both';
  createdAt: string;
}