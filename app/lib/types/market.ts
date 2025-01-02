export interface QuidaxTicker {
  at: number;
  ticker: {
    buy: string;
    sell: string;
    low: string;
    high: string;
    open: string;
    last: string;
    volume: string;
  };
}

export interface MarketRate {
  buy: string;
  sell: string;
  last: string;
  volume: string;
}

export type MarketRates = Record<string, MarketRate>; 