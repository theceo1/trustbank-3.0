import { QuidaxClient } from '@/lib/quidax';
import { QUIDAX_CONFIG } from '@/lib/config/quidax';

interface SubAccountResponse {
  success: boolean;
  data: {
    id: string;
  };
}

interface WalletBalanceResponse {
  success: boolean;
  data: {
    balance: string;
    currency: string;
  };
}

interface TransferResponse {
  success: boolean;
  data: {
    id: string;
    amount: string;
    currency: string;
    from_user_id: string;
    to_user_id: string;
  };
}

export class QuidaxService {
  private static client = new QuidaxClient();

  static async createSubAccount(data: {
    email: string;
    first_name: string;
    last_name: string;
  }): Promise<SubAccountResponse> {
    const response = await this.client.createSubAccount({
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name
    });
    return {
      success: true,
      data: {
        id: response.id
      }
    };
  }

  static async transfer(
    fromUserId: string,
    toUserId: string,
    amount: string,
    currency: string
  ): Promise<TransferResponse> {
    const response = await fetch(`${QUIDAX_CONFIG.apiUrl}/transfers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${QUIDAX_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        amount,
        currency
      })
    });

    if (!response.ok) {
      throw new Error(`Transfer failed: ${await response.text()}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data
    };
  }

  static async getWalletBalance(userId: string, currency: string): Promise<WalletBalanceResponse> {
    const response = await fetch(`${QUIDAX_CONFIG.apiUrl}/users/${userId}/wallets/${currency}`, {
      headers: {
        'Authorization': `Bearer ${QUIDAX_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get wallet balance: ${await response.text()}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        balance: data.data.balance,
        currency: data.data.currency
      }
    };
  }
} 