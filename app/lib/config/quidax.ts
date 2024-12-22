export const QUIDAX_CONFIG = {
  apiUrl: process.env.QUIDAX_API_URL || 'https://www.quidax.com/api/v1',
  apiKey: process.env.QUIDAX_SECRET_KEY || '',
  webhookUrl: process.env.QUIDAX_WEBHOOK_URL || 'https://99b2-102-67-1-6.ngrok-free.app/webhooks/quidax',
  webhookSecret: process.env.QUIDAX_WEBHOOK_SECRET || ''
};