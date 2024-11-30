export const QUIDAX_CONFIG = {
  apiUrl: process.env.NEXT_PUBLIC_QUIDAX_API_URL || 'https://www.quidax.com/api',
  apiKey: process.env.NEXT_PUBLIC_QUIDAX_API_KEY || '',
  secretKey: process.env.QUIDAX_SECRET_KEY || ''
};