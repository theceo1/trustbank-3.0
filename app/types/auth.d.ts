import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      token?: string;
    };
  }

  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    quidaxId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    quidaxId?: string;
  }
} 