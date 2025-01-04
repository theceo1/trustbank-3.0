import { QuidaxSwapService } from '../app/lib/services/quidax-swap';
import supabaseClient from '../app/lib/supabase/client';

async function createVerifiedUser() {
  console.log('\n[Setup] Creating verified user...');
  const email = `receiver${Date.now()}@trustbank.tech`;
  const password = 'SecurePass123!';
  const firstName = 'Alice';
  const lastName = 'Johnson';
  const nin = '70123456789'; // Test NIN for KYC

  try {
    // 1. Create Supabase user
    console.log('[Setup] Creating Supabase account...');
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          nin: nin,
          kyc_level: 1, // Set initial KYC level
        },
      },
    });

    if (authError) throw authError;
    console.log('[Setup] Created Supabase user:', {
      id: authData.user?.id,
      email: authData.user?.email,
    });

    // 2. Create Quidax subaccount
    console.log('[Setup] Creating Quidax subaccount...');
    const response = await fetch('https://www.quidax.com/api/v1/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.QUIDAX_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        first_name: firstName,
        last_name: lastName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create Quidax subaccount: ${error.message}`);
    }

    const quidaxData = await response.json();
    console.log('[Setup] Created Quidax subaccount:', {
      id: quidaxData.data.id,
      sn: quidaxData.data.sn,
      email: quidaxData.data.email,
    });

    // 3. Link Quidax ID to Supabase profile
    console.log('[Setup] Linking Quidax ID to user profile...');
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ quidax_id: quidaxData.data.id })
      .eq('id', authData.user?.id);

    if (updateError) throw updateError;

    // 4. Verify KYC with Dojah
    console.log('[Setup] Verifying KYC with Dojah...');
    const kycResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kyc/nin/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'AppId': process.env.NEXT_PUBLIC_DOJAH_APP_ID!,
        'Authorization': process.env.NEXT_PUBLIC_DOJAH_API_KEY!,
      },
      body: JSON.stringify({
        nin,
        first_name: firstName,
        last_name: lastName,
        selfie_image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx0fHx0dHx0dHx0dHx0dHx0dHx0dHx0dHx0dHx0dHx0dHx0dHx0dHx0dHx0dHx0dHx3/2wBDAR0XFyAeIB4gHh4eIB0dHx0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=', // Base64 test image
      }),
    });

    if (!kycResponse.ok) {
      const error = await kycResponse.json();
      throw new Error(`Failed to verify KYC: ${error.message}`);
    }

    const kycResult = await kycResponse.json();
    console.log('[Setup] KYC verification result:', kycResult);

    // Return all the user details
    return {
      supabase: {
        id: authData.user?.id,
        email: authData.user?.email,
      },
      quidax: {
        id: quidaxData.data.id,
        sn: quidaxData.data.sn,
        email: quidaxData.data.email,
      },
      kyc: {
        level: 1,
        verified: true,
      },
    };
  } catch (error) {
    console.error('[Setup] Error creating verified user:', error);
    throw error;
  }
}

// Run the setup
createVerifiedUser()
  .then((user) => {
    console.log('\n[Setup] Successfully created verified user:', user);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n[Setup] Failed to create verified user:', error);
    process.exit(1);
  }); 