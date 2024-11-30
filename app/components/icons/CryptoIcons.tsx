import React from 'react';

export const CryptoIcons = {
  BTC: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-orange-500">
      <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002z"/>
    </svg>
  ),
  ETH: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-500">
      <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
    </svg>
  ),
  USDT: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-green-500">
      <path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z"/>
    </svg>
  ),
  USDC: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-400">
      <path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z"/>
    </svg>
  ),
};