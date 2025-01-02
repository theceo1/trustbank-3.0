// app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { QuidaxClient } from '@/app/lib/services/quidax-client';
import { APIError, handleApiError } from '@/app/lib/api-utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Create Supabase user
    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      throw new APIError(authError.message, 400);
    }

    // Create Quidax sub-account
    try {
      const response = await QuidaxClient.post('/users/create-subaccount', {
        email,
        name
      });

      if (!response.ok) {
        throw new Error('Failed to create Quidax sub-account');
      }

      const data = await response.json();
      if (data.status !== 'success') {
        throw new Error(data.message || 'Failed to create Quidax sub-account');
      }

      // Update user profile with Quidax ID
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ quidax_id: data.data.id })
        .eq('id', authData.user!.id);

      if (updateError) {
        throw new Error('Failed to update user profile');
      }

      return NextResponse.json({
        status: 'success',
        data: {
          user: authData.user,
          quidax_id: data.data.id
        }
      });
    } catch (error: unknown) {
      // If Quidax account creation fails, delete the Supabase user
      if (authData.user) {
        await supabase.auth.admin.deleteUser(authData.user.id);
      }
      throw error;
    }
  } catch (error: unknown) {
    return handleApiError(error);
  }
} 