import { NextResponse } from 'next/server';
import { QuidaxService } from '@/app/lib/services/quidax';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ProfileService } from '@/app/lib/services/profile';

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user?.id) {
      console.error('Session error:', { sessionError });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { currency, amount, address, network } = body;
    console.log('Withdrawal request received:', { 
      currency, 
      amount, 
      address,
      userId: session.user.id 
    });

    if (!currency || !amount || !address) {
      console.error('Missing required fields:', { currency, amount, address });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user's Quidax ID
    const profile = await ProfileService.getProfile(session.user.id);
    if (!profile?.quidax_id) {
      console.error('User profile not found:', { userId: session.user.id });
      return NextResponse.json(
        { error: 'User profile not properly set up' },
        { status: 400 }
      );
    }

    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: session.user.id,
        type: 'withdrawal',
        status: 'pending',
        currency: currency.toLowerCase(),
        amount: amount.toString(),
        destination_address: address,
        network: network || undefined
      })
      .select()
      .single();

    if (txError) {
      console.error('Failed to create transaction record:', txError);
      return NextResponse.json(
        { error: 'Failed to create transaction record' },
        { status: 500 }
      );
    }

    // Initiate the blockchain withdrawal
    try {
      // Get current wallet balance to validate withdrawal amount
      const walletBalance = await QuidaxService.getWalletBalance(profile.quidax_id, currency.toLowerCase());
      const availableBalance = parseFloat(walletBalance.balance);
      const withdrawalAmount = parseFloat(amount);

      console.log('Balance check:', {
        availableBalance,
        withdrawalAmount,
        currency: currency.toLowerCase(),
        difference: availableBalance - withdrawalAmount
      });

      // Validate numbers first
      if (isNaN(availableBalance) || isNaN(withdrawalAmount)) {
        console.error('Invalid number values:', { availableBalance, withdrawalAmount });
        return NextResponse.json(
          { 
            error: 'Invalid amount',
            details: {
              available: availableBalance,
              requested: withdrawalAmount,
              currency: currency.toUpperCase()
            }
          },
          { status: 400 }
        );
      }

      // Convert to BigInt for precise comparison (multiply by 10^8 to handle 8 decimal places)
      const availableBalanceBigInt = BigInt(Math.floor(availableBalance * 100000000));
      const withdrawalAmountBigInt = BigInt(Math.floor(withdrawalAmount * 100000000));

      if (withdrawalAmountBigInt > availableBalanceBigInt) {
        console.log('Insufficient balance:', {
          available: availableBalance.toFixed(8),
          requested: withdrawalAmount.toFixed(8),
          difference: (availableBalance - withdrawalAmount).toFixed(8)
        });

        await supabase
          .from('transactions')
          .update({ 
            status: 'failed',
            error_message: `Insufficient balance. Available: ${availableBalance.toFixed(8)} ${currency.toUpperCase()}, Requested: ${withdrawalAmount.toFixed(8)} ${currency.toUpperCase()}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', transaction.id);

        return NextResponse.json(
          { 
            error: 'Insufficient balance',
            details: {
              available: availableBalance.toFixed(8),
              requested: withdrawalAmount.toFixed(8),
              currency: currency.toUpperCase(),
              message: `You do not have enough ${currency.toUpperCase()} to complete this withdrawal. Please check your balance and try again.`
            }
          },
          { status: 400 }
        );
      }

      // Also validate minimum withdrawal amount
      const minWithdrawal = 0.000001; // Set minimum withdrawal amount
      if (withdrawalAmount < minWithdrawal) {
        return NextResponse.json(
          { 
            error: 'Amount is below minimum withdrawal limit',
            details: {
              minimum: minWithdrawal,
              currency: currency.toUpperCase(),
              message: `The minimum withdrawal amount is ${minWithdrawal} ${currency.toUpperCase()}`
            }
          },
          { status: 400 }
        );
      }

      const withdrawal = await QuidaxService.createWithdrawal({
        user_id: profile.quidax_id,
        currency: currency.toLowerCase(),
        amount: amount.toString(),
        fund_uid: address,
        network: network,
        transaction_note: `Withdrawal to ${address}`,
        narration: 'External wallet withdrawal'
      });

      if (!withdrawal?.id) {
        throw new Error('Failed to initiate withdrawal');
      }

      // Update transaction with withdrawal ID
      await supabase
        .from('transactions')
        .update({ 
          external_id: withdrawal.id,
          status: withdrawal.status.toLowerCase(),
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id);

      return NextResponse.json({
        status: 'success',
        message: 'Withdrawal initiated successfully',
        data: {
          withdrawal_id: withdrawal.id,
          status: withdrawal.status,
          transaction_id: transaction.id
        }
      });

    } catch (withdrawError: any) {
      // Update transaction as failed
      await supabase
        .from('transactions')
        .update({ 
          status: 'failed',
          error_message: withdrawError.message,
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id);

      // Handle specific Quidax API errors
      if (withdrawError.message.includes('insufficient balance')) {
        return NextResponse.json(
          { error: 'Insufficient balance' },
          { status: 400 }
        );
      } else if (withdrawError.message.includes('invalid address')) {
        return NextResponse.json(
          { error: 'Invalid wallet address' },
          { status: 400 }
        );
      } else if (withdrawError.message.includes('minimum withdrawal')) {
        return NextResponse.json(
          { error: 'Amount is below minimum withdrawal limit' },
          { status: 400 }
        );
      }

      throw withdrawError;
    }

  } catch (error: any) {
    console.error('Withdrawal error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process withdrawal',
        code: error.code,
        details: error.details
      },
      { status: error.status || 500 }
    );
  }
} 