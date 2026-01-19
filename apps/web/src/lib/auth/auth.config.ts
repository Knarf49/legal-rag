import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import { type NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [Google, Facebook],
  secret: process.env.AUTH_SECRET,
  trustHost: true,
} satisfies NextAuthConfig;
