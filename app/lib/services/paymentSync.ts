import { prisma } from '@/app/lib/prisma';
import { QuidaxService } from "./quidax";

export class PaymentSyncService {
    static async syncPaymentStatus(tradeId: string) {
      const trade = await prisma.trade.findUnique({
        where: { id: tradeId }
      });
  
      if (!trade) throw new Error('Trade not found');
      if (!trade.quidax_reference) throw new Error('Quidax reference not found');
  
      const quidaxStatus = await QuidaxService.getTradeStatus(trade.quidax_reference);
      await prisma.trade.update({
        where: { id: tradeId },
        data: { status: quidaxStatus }
      });
  
      return quidaxStatus;
    }
}