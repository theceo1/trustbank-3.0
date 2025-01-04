export const QUIDAX_CONFIG = {
  apiUrl: process.env.QUIDAX_API_URL || 'https://www.quidax.com/api/v1',
  apiKey: process.env.QUIDAX_SECRET_KEY || '',
  webhookUrl: process.env.QUIDAX_WEBHOOK_URL || 'https://49f0-102-219-153-222.ngrok-free.app/webhooks/quidax',
  webhookSecret: process.env.QUIDAX_WEBHOOK_SECRET || ''
};