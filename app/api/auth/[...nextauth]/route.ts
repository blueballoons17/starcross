import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user) return null;

        const valid = await verifyPassword(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.userId = user.id;
        // Fetch subscription status on first login
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id as string },
          select: { subscriptionStatus: true, subscriptionCurrentPeriodEnd: true },
        });
        token.subscriptionStatus = dbUser?.subscriptionStatus ?? null;
        token.subscriptionCurrentPeriodEnd = dbUser?.subscriptionCurrentPeriodEnd?.toISOString() ?? null;
      }
      // Refresh subscription data on explicit update trigger
      if (trigger === "update" && token.userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.userId as string },
          select: { subscriptionStatus: true, subscriptionCurrentPeriodEnd: true },
        });
        token.subscriptionStatus = dbUser?.subscriptionStatus ?? null;
        token.subscriptionCurrentPeriodEnd = dbUser?.subscriptionCurrentPeriodEnd?.toISOString() ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId && session.user) {
        (session.user as { id?: string }).id = token.userId as string;
      }
      (session as unknown as Record<string, unknown>).subscriptionStatus = token.subscriptionStatus ?? null;
      (session as unknown as Record<string, unknown>).subscriptionCurrentPeriodEnd = token.subscriptionCurrentPeriodEnd ?? null;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
