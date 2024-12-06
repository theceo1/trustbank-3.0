export const QUIDAX_CONFIG = {
  apiUrl: process.env.QUIDAX_API_URL || 'https://www.quidax.com/api/v1',
  apiKey: process.env.QUIDAX_SECRET_KEY || '',
  webhookUrl: process.env.QUIDAX_WEBHOOK_URL || 'https://3c62-102-67-1-3.ngrok-free.app/api/webhooks/quidax',
  webhookSecret: process.env.QUIDAX_WEBHOOK_SECRET || ''
};