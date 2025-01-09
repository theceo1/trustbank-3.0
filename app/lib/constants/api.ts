export const QUIDAX_API_URL = process.env.NEXT_PUBLIC_QUIDAX_API_URL || 'https://www.quidax.com/api/v1';
export const QUIDAX_WEBSOCKET_URL = 'wss://ws.quidax.com';

export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    verify: '/api/auth/verify'
  },
  user: {
    profile: '/api/user/profile',
    settings: '/api/user/settings',
    kyc: '/api/user/kyc'
  },
  payment: {
    verify: '/api/payment/verify',
    transactions: '/api/transactions'
  },
  merchant: {
    register: '/api/merchant/register',
    qr: '/api/merchant/qr',
    settlements: '/api/merchant/settlements'
  }
}; 