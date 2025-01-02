import { QuidaxUser } from '@/app/types/quidax';

export class QuidaxUserService {
  private static baseUrl = process.env.QUIDAX_API_URL || 'https://www.quidax.com/api/v1';
  private static apiKey = process.env.QUIDAX_SECRET_KEY;

  static async createSubaccount(params: {
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<QuidaxUser> {
    try {
      const response = await fetch(
        `${this.baseUrl}/users`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            email: params.email,
            first_name: params.firstName,
            last_name: params.lastName
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create subaccount');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Create subaccount error:', error);
      throw error;
    }
  }

  static async getSubaccount(userId: string): Promise<QuidaxUser> {
    try {
      const response = await fetch(
        `${this.baseUrl}/users/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch subaccount details');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Get subaccount error:', error);
      throw error;
    }
  }
} 