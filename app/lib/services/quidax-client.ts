const QUIDAX_API_URL = 'https://www.quidax.com/api/v1';

export class QuidaxClient {
  static async get(endpoint: string): Promise<Response> {
    const url = `${QUIDAX_API_URL}${endpoint}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.QUIDAX_API_KEY}`
      }
    });
    return response;
  }

  static async post(endpoint: string, data: any): Promise<Response> {
    const url = `${QUIDAX_API_URL}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.QUIDAX_API_KEY}`
      },
      body: JSON.stringify(data)
    });
    return response;
  }
} 