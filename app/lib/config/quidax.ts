export const QUIDAX_CONFIG = {
  apiUrl: process.env.NEXT_PUBLIC_QUIDAX_API_URL || 'https://www.quidax.com/api/v1',
  apiKey: process.env.QUIDAX_SECRET_KEY || '',
  webhookUrl: process.env.QUIDAX_WEBHOOK_URL || '',
  webhookSecret: process.env.QUIDAX_WEBHOOK_SECRET || ''
};