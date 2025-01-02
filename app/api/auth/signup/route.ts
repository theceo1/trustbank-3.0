// app/api/auth/signup/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { QuidaxWalletService } from '@/app/lib/services/quidax-wallet';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Create Quidax account first
    const quidaxResponse = await QuidaxWalletService.createSubAccount(email, name)
      .catch(error => {
        console.error('Failed to create Quidax account:', error);
        throw new Error(`Quidax account creation failed: ${error.message}`);
      });

    if (!quidaxResponse?.data?.id) {
      throw new Error('Invalid response from Quidax: Missing sub-account ID');
    }

    // Create Supabase auth user
    const { data: user, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name
        }
      }
    });

    if (authError) {
      // If auth fails, we should log this as a critical error since we already created the Quidax account
      console.error('Auth failed after Quidax account creation:', {
        quidaxId: quidaxResponse.data.id,
        error: authError
      });
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!user.user?.id) {
      throw new Error('User creation failed: No user ID returned');
    }

    // Create user profile with Quidax ID
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: user.user.id,
        quidax_id: quidaxResponse.data.id,
        full_name: name,
        email: email,
        kyc_level: 0,  // Starting at level 0 (unverified)
        is_verified: false,
        kyc_status: 'pending',  // pending, verified, rejected
        kyc_submitted_at: null,
        kyc_verified_at: null
      });

    if (profileError) {
      console.error('Failed to create user profile:', {
        userId: user.user.id,
        quidaxId: quidaxResponse.data.id,
        error: profileError
      });
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'success',
      message: 'User created successfully'
    });

  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    );
  }
} 