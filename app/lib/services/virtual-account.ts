import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import crypto from 'crypto';

interface VirtualAccountResponse {
  status: string;
  message: string;
  data: {
    accountNumber: string;
    accountName: string;
    bankName: string;
    reference: string;
  }
}

interface WemaAccountResponse {
  accountNumber: string;
  accountName: string;
  email: string;
  phoneNumber: string;
  bvn: string;
  status: string;
  createdAt: string;
}

export class VirtualAccountService {
  private static instance: VirtualAccountService;
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly baseUrl: string;

  private constructor() {
    this.apiKey = process.env.WEMA_API_KEY || '';
    this.secretKey = process.env.WEMA_SECRET_KEY || '';
    this.baseUrl = process.env.WEMA_API_URL || 'https://alat.wemabank.com/api/v1';
  }

  public static getInstance(): VirtualAccountService {
    if (!VirtualAccountService.instance) {
      VirtualAccountService.instance = new VirtualAccountService();
    }
    return VirtualAccountService.instance;
  }

  async generateVirtualAccount(userId: string, email: string, phoneNumber: string, bvn: string): Promise<VirtualAccountResponse> {
    try {
      const supabase = createClientComponentClient();
      
      // First check if user already has a virtual account
      const { data: existingAccount } = await supabase
        .from('virtual_accounts')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existingAccount) {
        return {
          status: 'success',
          message: 'Virtual account retrieved',
          data: {
            accountNumber: existingAccount.account_number,
            accountName: existingAccount.account_name,
            bankName: existingAccount.bank_name,
            reference: existingAccount.reference
          }
        };
      }

      // Generate new virtual account with Wema Bank
      const response = await fetch(`${this.baseUrl}/virtual-accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          email,
          phoneNumber,
          bvn,
          reference: `VA_${userId}_${Date.now()}`,
          metadata: {
            userId
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate virtual account');
      }

      const accountData: WemaAccountResponse = await response.json();

      // Save virtual account details to database
      const { error: saveError } = await supabase
        .from('virtual_accounts')
        .insert({
          user_id: userId,
          account_number: accountData.accountNumber,
          account_name: accountData.accountName,
          bank_name: 'Wema Bank',
          bank_code: '000017',
          reference: accountData.createdAt,
          status: accountData.status,
          metadata: {
            email: accountData.email,
            phoneNumber: accountData.phoneNumber,
            bvn: accountData.bvn
          }
        });

      if (saveError) {
        throw saveError;
      }

      return {
        status: 'success',
        message: 'Virtual account generated successfully',
        data: {
          accountNumber: accountData.accountNumber,
          accountName: accountData.accountName,
          bankName: 'Wema Bank',
          reference: accountData.createdAt
        }
      };
    } catch (error) {
      console.error('Virtual account generation error:', error);
      throw error;
    }
  }

  async handleWebhook(payload: any, signature: string): Promise<void> {
    try {
      // Verify webhook signature
      if (!this.verifyWebhookSignature(payload, signature)) {
        throw new Error('Invalid webhook signature');
      }

      const {
        reference,
        amount,
        accountNumber,
        transactionReference,
        sessionId,
        status
      } = payload;

      const supabase = createClientComponentClient();

      // Get virtual account details
      const { data: virtualAccount } = await supabase
        .from('virtual_accounts')
        .select('user_id, account_number')
        .eq('account_number', accountNumber)
        .single();

      if (!virtualAccount) {
        throw new Error('Virtual account not found');
      }

      // Record the transaction
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: virtualAccount.user_id,
          type: 'deposit',
          amount: amount,
          currency: 'NGN',
          status: status === 'successful' ? 'completed' : 'failed',
          reference: transactionReference,
          metadata: {
            sessionId,
            virtualAccount: accountNumber,
            originalReference: reference
          }
        });

      if (txError) {
        throw txError;
      }

      // If successful, credit user's wallet
      if (status === 'successful') {
        const { error: walletError } = await supabase.rpc('credit_wallet', {
          p_user_id: virtualAccount.user_id,
          p_amount: amount,
          p_currency: 'NGN'
        });

        if (walletError) {
          throw walletError;
        }
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
      throw error;
    }
  }

  private verifyWebhookSignature(payload: any, signature: string): boolean {
    try {
      const computedSignature = crypto
        .createHmac('sha512', this.secretKey)
        .update(JSON.stringify(payload))
        .digest('hex');
      
      return computedSignature === signature;
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }
} 