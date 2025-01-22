import { createClient } from '@supabase/supabase-js';
import debug from 'debug';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { QuidaxService } from '@/app/lib/services/quidax';

const log = debug('migrate:quidax');
debug.enable('migrate:*');

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

class TestQuidaxService {
  private static baseUrl = process.env.QUIDAX_API_URL || 'https://www.quidax.com/api/v1';
  private static apiKey = process.env.QUIDAX_SECRET_KEY;

  static async createSubAccount(params: {
    email: string;
    first_name: string;
    last_name: string;
    country: string;
  }) {
    try {
      const response = await fetch(
        `${this.baseUrl}/users`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            email: params.email,
            first_name: params.first_name,
            last_name: params.last_name,
            country: params.country
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create Quidax sub-account');
      }

      return response.json();
    } catch (error) {
      console.error('Create sub-account error:', error);
      throw error;
    }
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function migrateQuidaxIds() {
  try {
    log('Starting Quidax ID migration...');

    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('user_id')
      .is('quidax_id', null);

    if (error) throw error;
    
    log(`Found ${users?.length || 0} users without Quidax IDs`);

    for (const user of users || []) {
      try {
        const { data: authUser } = await supabase
          .from('users')
          .select('email, first_name, last_name')
          .eq('id', user.user_id)
          .single();

        if (!authUser) {
          log(`⚠️ No auth user found for ${user.user_id}`);
          continue;
        }

        // Create Quidax sub-account
        log(`🔄 Creating Quidax account for: ${authUser.email}`);
        const quidaxUser = await QuidaxService.createSubAccount({
          email: authUser.email,
          first_name: authUser.first_name || 'User',
          last_name: authUser.last_name || 'User',
          country: 'ng'
        });

        // Update user profile with Quidax ID
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ quidax_id: quidaxUser.data.id })
          .eq('user_id', user.user_id);

        if (updateError) {
          log(`Failed to update profile for ${authUser.email}:`, updateError);
          continue;
        }

        log(`✅ Successfully updated ${authUser.email} with Quidax ID: ${quidaxUser.data.id}`);

      } catch (userError) {
        log(`Failed to process user ${user.user_id}:`, userError);
      }
    }

    log('Migration completed!');

  } catch (error) {
    log('Migration failed:', error);
    throw error;
  }
}

migrateQuidaxIds().catch(console.error); 