import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/env.mjs";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const supabase = createClient(
          env.NEXT_PUBLIC_SUPABASE_URL,
          env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error) {
          console.error('Supabase auth error:', error);
          throw new Error(error.message);
        }

        if (!data?.user) {
          throw new Error('No user returned from Supabase');
        }

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  debug: process.env.NODE_ENV === 'development',
};