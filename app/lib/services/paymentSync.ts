import prisma from '@/app/lib/prisma';
import { QuidaxService } from "./quidax";

export class PaymentSyncService {
    static async syncPaymentStatus(tradeId: string) {
      const trade = await prisma.trades.findUnique({
        where: { id: tradeId }
      });
  
      if (!trade) throw new Error('Trade not found');
  
      const quidaxStatus = await QuidaxService.getTradeStatus(trade.quidax_reference);
      await prisma.trades.update({
        where: { id: tradeId },
        data: { status: quidaxStatus }
      });
  
      return quidaxStatus;
    }
  }