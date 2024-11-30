import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testTrade() {
  try {
    // Create a test user if needed
    const { data: user, error: userError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123'
    });

    if (userError) throw userError;

    // Create test trade
    const { data: trade, error: tradeError } = await supabase
      .from('trades')
      .insert({
        user_id: user.user?.id,
        type: 'sell',
        amount: 100,
        currency: 'btc',
        rate: 50000,
        total: 5000000,
        payment_method: 'wallet'
      })
      .select()
      .single();

    if (tradeError) throw tradeError;

    console.log('Test trade created:', trade);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testTrade(); 