export interface NINVerificationResponse {
  entity: {
    first_name: string;
    last_name: string;
    middle_name: string;
    gender: string;
    image: string;
    phone_number: string;
    date_of_birth: string;
    nin: string;
    selfie_verification: {
      confidence_value: number;
      match: boolean;
    }
  }
}

export class DojahService {
  private baseUrl: string;
  private appId: string;
  private secretKey: string;

  constructor() {
    const dojahApiUrl = process.env.DOJAH_API_URL;
    const dojahAppId = process.env.DOJAH_APP_ID;
    const dojahSecretKey = process.env.DOJAH_SECRET_KEY;

    if (!dojahApiUrl || !dojahAppId || !dojahSecretKey) {
      throw new Error('Missing required environment variables: DOJAH_API_URL, DOJAH_APP_ID, DOJAH_SECRET_KEY');
    }

    this.baseUrl = dojahApiUrl;
    this.appId = dojahAppId;
    this.secretKey = dojahSecretKey;
  }

  private async getHeaders(): Promise<Record<string, string>> {
    return {
      'Content-Type': 'application/json',
      'AppId': this.appId,
      'Authorization': this.secretKey,
    };
  }

  async verifyNINWithSelfie(params: {
    nin: string;
    selfieImage: string;
    firstName?: string;
    lastName?: string;
  }): Promise<NINVerificationResponse> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}/api/v1/kyc/nin/verify`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          nin: params.nin,
          selfie_image: params.selfieImage,
          first_name: params.firstName,
          last_name: params.lastName
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to verify NIN');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verifying NIN:', error);
      throw error;
    }
  }

  async subscribeToWebhook(params: {
    webhookUrl: string;
    service: 'kyc_widget' | 'sms' | 'ngn_wallet';
  }): Promise<{ entity: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}/api/v1/webhook/subscribe`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          webhook: params.webhookUrl,
          service: params.service
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to subscribe to webhook');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error subscribing to webhook:', error);
      throw error;
    }
  }

  async getVerificationDetails(referenceId: string): Promise<any> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}/api/v1/kyc/verification?reference_id=${referenceId}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get verification details');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting verification details:', error);
      throw error;
    }
  }
} 