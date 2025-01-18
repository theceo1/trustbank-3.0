import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
const log = debug('worker:quidax-account');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const QUIDAX_API_URL = process.env.QUIDAX_API_URL || 'https://www.quidax.com/api/v1';
const QUIDAX_SECRET_KEY = process.env.QUIDAX_SECRET_KEY!;

async function createQuidaxAccount(payload: {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
}) {
  try {
    log('Creating Quidax account for user:', payload.email);

    // Create Quidax sub-account
    const response = await fetch(`${QUIDAX_API_URL}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${QUIDAX_SECRET_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create Quidax account');
    }

    const { data: quidaxUser } = await response.json();

    // Update user profile with Quidax ID
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ quidax_id: quidaxUser.id })
      .eq('user_id', payload.user_id);

    if (updateError) {
      throw updateError;
    }

    log('Successfully created Quidax account:', quidaxUser.id);
    return quidaxUser.id;

  } catch (error) {
    log('Error creating Quidax account:', error);
    throw error;
  }
}

// Listen for database notifications
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

client.connect();

client.on('notification', async (msg: { channel: string; payload: string }) => {
  if (msg.channel === 'create_quidax_account') {
    try {
      const payload = JSON.parse(msg.payload);
      await createQuidaxAccount(payload);
    } catch (error) {
      log('Error processing notification:', error);
    }
  }
});

client.query('LISTEN create_quidax_account');

log('Worker started and listening for notifications...'); 