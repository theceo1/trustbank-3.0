import { APIError } from '@/lib/api-utils';

export class QuidaxClient {
  private static instance: QuidaxClient;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.QUIDAX_API_URL || 'https://www.quidax.com/api/v1';
  }

  public static getInstance(): QuidaxClient {
    if (!QuidaxClient.instance) {
      QuidaxClient.instance = new QuidaxClient();
    }
    return QuidaxClient.instance;
  }

  async get(endpoint: string) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.QUIDAX_API_KEY}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch data from Quidax');
      }

      const data = await response.json();
      return data.data;
    } catch (error: any) {
      console.error('Quidax API error:', error);
      throw error;
    }
  }

  async post(endpoint: string, body: any) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.QUIDAX_API_KEY}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to post data to Quidax');
      }

      const data = await response.json();
      return data.data;
    } catch (error: any) {
      console.error('Quidax API error:', error);
      throw error;
    }
  }
}

export function getQuidaxClient(): QuidaxClient {
  return QuidaxClient.getInstance();
} 