// app/types/wallet.ts
export interface QuidaxUser {
  id: string;
  sn: string;
  email: string | null;
  reference: string | null;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface NetworkInfo {
  id: string;
  name: string;
  deposits_enabled: boolean;
  withdraws_enabled: boolean;
}

export interface WalletData {
  id: string;
  name: string;
  currency: string;
  balance: string;
  locked: string;
  staked: string;
  user: QuidaxUser;
  converted_balance: string;
  reference_currency: string;
  is_crypto: boolean;
  created_at: string;
  updated_at: string;
  blockchain_enabled: boolean;
  default_network: string | null;
  networks: NetworkInfo[];
  deposit_address: string | null;
  destination_tag: string | null;
}

export interface WalletResponse {
  status: string;
  message: string;
  data: WalletData | WalletData[];
}