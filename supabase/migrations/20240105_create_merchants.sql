-- Create merchant types enum
CREATE TYPE merchant_type AS ENUM (
  'individual',
  'business',
  'enterprise'
);

-- Create merchant verification status enum
CREATE TYPE merchant_verification_status AS ENUM (
  'pending',
  'verified',
  'rejected'
);

-- Create merchants table
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_type merchant_type NOT NULL DEFAULT 'individual',
  description TEXT,
  settlement_wallet_id UUID NOT NULL,
  verification_status merchant_verification_status NOT NULL DEFAULT 'pending',
  verification_data JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Merchant settings
  auto_settlement BOOLEAN NOT NULL DEFAULT false,
  settlement_threshold DECIMAL(20, 8),
  settlement_schedule TEXT, -- cron expression for scheduled settlements
  
  -- Business details
  registration_number TEXT,
  tax_id TEXT,
  website TEXT,
  social_media JSONB,
  
  -- Contact details
  contact_email TEXT,
  contact_phone TEXT,
  address JSONB,
  
  -- Statistics
  total_transactions BIGINT NOT NULL DEFAULT 0,
  total_volume DECIMAL(20, 8) NOT NULL DEFAULT 0,
  
  CONSTRAINT unique_user_merchant UNIQUE (user_id)
);

-- Create merchant_qr_codes table
CREATE TABLE merchant_qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  fixed_amount DECIMAL(20, 8),
  currency TEXT NOT NULL DEFAULT 'USDT',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  metadata JSONB,
  expiry_date TIMESTAMP WITH TIME ZONE,
  usage_limit INTEGER,
  times_used INTEGER NOT NULL DEFAULT 0
);

-- Create merchant_settlements table
CREATE TABLE merchant_settlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  amount DECIMAL(20, 8) NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  transaction_ids UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  settled_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

-- Add indexes
CREATE INDEX idx_merchant_user ON merchants(user_id);
CREATE INDEX idx_merchant_business_name ON merchants(business_name);
CREATE INDEX idx_merchant_verification_status ON merchants(verification_status);
CREATE INDEX idx_merchant_qr_merchant ON merchant_qr_codes(merchant_id);
CREATE INDEX idx_merchant_settlements_merchant ON merchant_settlements(merchant_id);

-- Add RLS policies
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_settlements ENABLE ROW LEVEL SECURITY;

-- Merchants can only view and edit their own data
CREATE POLICY "Users can view own merchant data"
  ON merchants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own merchant data"
  ON merchants FOR UPDATE
  USING (auth.uid() = user_id);

-- QR codes are public for scanning but can only be created by the merchant
CREATE POLICY "Anyone can view QR codes"
  ON merchant_qr_codes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Merchants can manage own QR codes"
  ON merchant_qr_codes FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM merchants WHERE id = merchant_id
    )
  );

-- Settlements are visible to the merchant only
CREATE POLICY "Merchants can view own settlements"
  ON merchant_settlements FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM merchants WHERE id = merchant_id
    )
  ); 