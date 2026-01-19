import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import { type NextAuthConfig } from "next-auth";

const providers = [];

// Only add Google provider if credentials are available
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(Google);
}

// Only add Facebook provider if credentials are available
if (process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET) {
  providers.push(Facebook);
}

export const authConfig = {
  providers,
  secret: process.env.AUTH_SECRET,
  trustHost: true,
} satisfies NextAuthConfig;
