-- Create a function to handle trade creation
CREATE OR REPLACE FUNCTION public.handle_trade_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a corresponding transaction record
  INSERT INTO public.transactions (
    id,
    user_id,
    type,
    amount,
    currency,
    status,
    crypto_amount,
    crypto_currency,
    rate,
    payment_reference,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.user_id,
    NEW.type,
    NEW.amount,
    'NGN',
    NEW.status,
    NEW.amount / NEW.rate,
    NEW.currency,
    NEW.rate,
    NEW.quidax_reference,
    NEW.created_at,
    NEW.updated_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_trade_created ON public.trades;
CREATE TRIGGER on_trade_created
  AFTER INSERT ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_trade_creation();

-- Create a function to handle trade updates
CREATE OR REPLACE FUNCTION public.handle_trade_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the corresponding transaction record
  UPDATE public.transactions
  SET status = NEW.status,
      updated_at = NEW.updated_at
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the update trigger
DROP TRIGGER IF EXISTS on_trade_updated ON public.trades;
CREATE TRIGGER on_trade_updated
  AFTER UPDATE ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_trade_update(); 