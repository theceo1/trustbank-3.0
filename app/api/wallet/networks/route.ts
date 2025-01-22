import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { QuidaxClient } from '@/lib/services/quidax-client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const cookieStore = cookies();
    const token = cookieStore.get('sb-access-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const currency = searchParams.get('currency');

    if (!currency) {
      return NextResponse.json(
        { error: 'Currency parameter is required' },
        { status: 400 }
      );
    }

    // Get networks from Quidax
    const quidaxClient = QuidaxClient.getInstance();
    const networks = await quidaxClient.getNetworks(currency);

    return NextResponse.json(networks);
  } catch (error) {
    console.error('Error fetching networks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch networks' },
      { status: 500 }
    );
  }
} 