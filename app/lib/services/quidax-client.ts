export class QuidaxClient {
  private apiUrl: string;
  private secretKey: string;

  constructor(apiUrl?: string, secretKey?: string) {
    this.apiUrl = apiUrl || '';
    this.secretKey = secretKey || '';
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.secretKey}`
    };
  }

  async get(path: string) {
    const response = await fetch(`${this.apiUrl}${path}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  async post(path: string, body: any) {
    const response = await fetch(`${this.apiUrl}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }
} 