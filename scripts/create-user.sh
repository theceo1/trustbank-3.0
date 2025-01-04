#!/bin/bash

# Load environment variables
source .env.local

# Run the user creation
echo "Creating verified user..."
QUIDAX_API_URL="https://www.quidax.com/api/v1" \
QUIDAX_SECRET_KEY="$QUIDAX_SECRET_KEY" \
NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
DOJAH_APP_ID="$DOJAH_APP_ID" \
DOJAH_API_KEY="$DOJAH_API_KEY" \
npm run create:verified-user 