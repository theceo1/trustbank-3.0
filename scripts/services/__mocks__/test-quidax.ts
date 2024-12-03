export class TestQuidaxService {
  static async verifyParentAccount() {
    return {
      status: 'success',
      message: 'Successful',
      data: {
        id: 'mock-parent-id',
        sn: 'MOCK123456',
        email: 'tony@trustbank.tech',
        first_name: 'Anthony',
        last_name: 'Ogugua',
        display_name: 'Digital Kloud Transact Limited',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  static async createSubAccount(data: any) {
    return {
      id: 'mock-sub-account-id',
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      created_at: new Date().toISOString()
    };
  }

  static async getTemporaryQuotation(params: any) {
    return {
      status: 'success',
      message: 'Successful',
      data: {
        from_currency: params.from_currency.toUpperCase(),
        to_currency: params.to_currency.toUpperCase(),
        from_amount: params.from_amount,
        to_amount: params.from_currency === 'btc' ? '1600000.00' : '0.01',
        quoted_price: '160000000.00',
        quoted_currency: 'NGN'
      }
    };
  }

  static async getDepositAddress(userId: string, currency: string) {
    return {
      status: 'success',
      message: 'Successful',
      data: {
        id: 'mock-deposit-address-id',
        currency: currency,
        address: 'mock-btc-address-123',
        network: currency,
        user: {
          id: userId,
          sn: 'MOCK123'
        }
      }
    };
  }

  static async createInstantSwap(params: any) {
    return {
      status: 'success',
      message: 'Successful',
      data: {
        id: 'mock-swap-id',
        user_id: params.user_id,
        from_currency: params.from_currency,
        to_currency: params.to_currency,
        from_amount: params.from_amount,
        to_amount: params.from_currency === 'btc' ? '1600000.00' : '0.01',
        status: 'pending',
        created_at: new Date().toISOString()
      }
    };
  }

  static async checkWalletBalance(userId: string, currency: string) {
    return {
      id: 'mock-wallet-id',
      currency: currency,
      balance: '1.0', // Always return sufficient balance in test mode
      locked: '0.0',
      user: {
        id: userId
      }
    };
  }
} 