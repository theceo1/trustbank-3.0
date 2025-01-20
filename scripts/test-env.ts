import { createClient } from '@supabase/supabase-js';
import { QuidaxService } from '../app/lib/services/quidax';

async function testEnvironment() {
  console.log('Testing environment variables...\n');

  // Test Supabase configuration
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const quidaxKey = process.env.QUIDAX_SECRET_KEY;

  console.log('Supabase URL:', supabaseUrl ? '✅ Found' : '❌ Missing');
  console.log('Supabase Service Role Key:', supabaseKey ? '✅ Found' : '❌ Missing');
  console.log('Quidax Secret Key:', quidaxKey ? '✅ Found' : '❌ Missing\n');

  if (!supabaseUrl || !supabaseKey || !quidaxKey) {
    console.error('❌ Missing required environment variables');
    return;
  }

  try {
    console.log('Testing Supabase connection...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from('user_profiles').select('*').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
    } else {
      console.log('✅ Supabase connection successful\n');
    }

    // Test Quidax API
    console.log('Testing Quidax API...');
    try {
      const currencies = ['btc', 'eth', 'usdt'];
      for (const currency of currencies) {
        const response = await QuidaxService.getMarketPrice(currency);
        console.log(`✅ Quidax ${currency.toUpperCase()} price:`, response);
      }
    } catch (error: any) {
      console.error('❌ Quidax API test failed:', error.message);
    }

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
  }
}

testEnvironment(); 