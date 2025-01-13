-- Create platform_revenue table
CREATE TABLE IF NOT EXISTS public.platform_revenue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trade_id UUID REFERENCES public.trades(id),
  amount DECIMAL(20, 8) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  fee_type VARCHAR(20) NOT NULL, -- 'platform' or 'processing'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create function to record platform revenue
CREATE OR REPLACE FUNCTION public.record_platform_revenue()
RETURNS TRIGGER AS $$
BEGIN
  -- Record platform fee (TrustBank's 1.6%)
  INSERT INTO public.platform_revenue (
    trade_id,
    amount,
    currency,
    fee_type,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.amount * 0.016, -- 1.6% platform fee
    'NGN',
    'platform',
    NEW.created_at,
    NEW.updated_at
  );

  -- Record processing fee (Quidax's 1.4%)
  INSERT INTO public.platform_revenue (
    trade_id,
    amount,
    currency,
    fee_type,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.amount * 0.014, -- 1.4% processing fee
    'NGN',
    'processing',
    NEW.created_at,
    NEW.updated_at
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for recording revenue
DROP TRIGGER IF EXISTS on_trade_revenue ON public.trades;
CREATE TRIGGER on_trade_revenue
  AFTER INSERT ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION public.record_platform_revenue(); 