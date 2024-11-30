import { UnifiedTradeService } from '@/app/lib/services/unifiedTrade';
import { createHmac } from 'crypto';

export const verifyQuidaxSignature = (payload: any, signature: string | null) => {
  if (!signature) return false;
  
  const hmac = createHmac('sha256', process.env.QUIDAX_WEBHOOK_SECRET!);
  const computedSignature = hmac
    .update(JSON.stringify(payload))
    .digest('hex');

  return computedSignature === signature;
};

export const handleSuccessfulPayment = async (data: any) => {
  const { trade_id, status } = data;
  await UnifiedTradeService.updateTradeStatus(trade_id, status);
};