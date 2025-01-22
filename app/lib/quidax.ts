export class QuidaxClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = 'https://www.quidax.com/api/v1';
    this.apiKey = process.env.QUIDAX_SECRET_KEY || '';
  }

  async get(endpoint: string) {
    return fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async post(endpoint: string, body: any) {
    return fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
  }
} 