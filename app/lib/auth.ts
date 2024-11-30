import { AuthOptions } from "next-auth";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export const authOptions: AuthOptions = {
  providers: [],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub!;
      }
      return session;
    }
  }
};