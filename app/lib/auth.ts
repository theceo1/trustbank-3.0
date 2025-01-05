//app/lib/auth.ts
import { AuthOptions } from 'next-auth';
import { createClient } from '@supabase/supabase-js';
import CredentialsProvider from 'next-auth/providers/credentials';
import { QUIDAX_CONFIG } from './config/quidax';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide both email and password');
        }

        try {
          const { data: { user }, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error) {
            console.error('Supabase auth error:', error);
            throw new Error(error.message);
          }

          if (!user) {
            throw new Error('Invalid credentials');
          }

          // Get user's Quidax ID from profile
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('quidax_id')
            .eq('user_id', user.id)
            .single();

          if (profileError) {
            console.error('Profile fetch error:', profileError);
            throw new Error('Failed to fetch user profile');
          }

          return {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name,
            quidaxId: profile?.quidax_id,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          throw error;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.quidaxId = user.quidaxId;
        token.quidaxToken = QUIDAX_CONFIG.apiKey;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.token = token.quidaxToken as string;
      }
      return session;
    },
    async signIn({ user }) {
      // Ensure Supabase session is in sync
      const { data: { session: supabaseSession }, error } = await supabase.auth.getSession();
      
      if (error || !supabaseSession) {
        return false;
      }

      return true;
    }
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  events: {
    async signOut() {
      // Sign out from Supabase when signing out from NextAuth
      await supabase.auth.signOut();
    }
  },
  debug: process.env.NODE_ENV === 'development',
};