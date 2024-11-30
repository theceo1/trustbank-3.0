// app/contexts/TradeContext.tsx
import { createContext, useContext, useState, useCallback } from 'react';
import { TradeDetails, TradeStatus } from '@/app/types/trade';
import { UnifiedTradeService } from '@/app/lib/services/unifiedTrade';

interface TradeContextType {
  currentTrade: TradeDetails | null;
  setCurrentTrade: (trade: TradeDetails | null) => void;
  checkTradeStatus: (tradeId: string) => Promise<void>;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export function TradeProvider({ children }: { children: React.ReactNode }) {
  const [currentTrade, setCurrentTrade] = useState<TradeDetails | null>(null);

  const checkTradeStatus = useCallback(async (tradeId: string) => {
    try {
      const { status } = await UnifiedTradeService.getTradeStatus(tradeId);
      if (currentTrade) {
        setCurrentTrade({ ...currentTrade, status });
      }
    } catch (error) {
      console.error('Failed to check trade status:', error);
    }
  }, [currentTrade]);

  return (
    <TradeContext.Provider value={{ currentTrade, setCurrentTrade, checkTradeStatus }}>
      {children}
    </TradeContext.Provider>
  );
}

export function useTrade() {
  const context = useContext(TradeContext);
  if (!context) throw new Error('useTrade must be used within TradeProvider');
  return context;
}