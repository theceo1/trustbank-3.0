export const currencyIds = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'tether',
  USDC: 'usd-coin'
} as const;

export const SUPPORTED_CRYPTOCURRENCIES = [
  { symbol: 'btc', name: 'Bitcoin', minAmount: 0.0001, maxAmount: 1 },
  { symbol: 'eth', name: 'Ethereum', minAmount: 0.01, maxAmount: 10 },
  { symbol: 'usdt', name: 'USDT', minAmount: 10, maxAmount: 100000 },
  { symbol: 'usdc', name: 'USDC', minAmount: 10, maxAmount: 100000 }
] as const;

export const FIAT_CURRENCIES = ['NGN'] as const;

export const TRADING_PAIRS = SUPPORTED_CRYPTOCURRENCIES.map(crypto => 
  `${crypto.symbol}_ngn`
);

export const DEFAULT_TRADING_PAIR = 'btc_ngn';

export type SupportedCryptoCurrency = typeof SUPPORTED_CRYPTOCURRENCIES[number];