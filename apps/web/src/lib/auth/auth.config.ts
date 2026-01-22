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

export const authConfig: NextAuthConfig = {
  providers,
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
