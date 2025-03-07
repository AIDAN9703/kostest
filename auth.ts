import NextAuth, { User } from "next-auth"
import { compare } from "bcryptjs"
import CredentialsProvider from "next-auth/providers/credentials"
import { users, userRoleEnum } from "@/database/schema"
import { eq } from "drizzle-orm"
import { db } from "@/database/db"

// Debug log for environment

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours (1 day)
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours (1 day)
  },
  providers: [
    CredentialsProvider({
        id: "credentials",
        async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) {
                return null;
            }

            const user = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email.toString()))
            .limit(1);

            if (user.length === 0) {
                return null;
            }

            const isPasswordValid = await compare(credentials.password.toString(), user[0].password);

            if (!isPasswordValid) {
                return null;
            }

            return {
                id: user[0].id.toString(),
                email: user[0].email,
                name: user[0].firstName + " " + user[0].lastName,
                role: user[0].role,
                phoneNumber: user[0].phoneNumber || "",
                phoneVerified: user[0].phoneVerified || false,
                profileImage: user[0].profileImage || "",
            } as User;
        },
    }),
    CredentialsProvider({
        id: "credentials-token",
        credentials: {
            userId: { type: "text" },
            email: { type: "text" },
        },
        async authorize(credentials) {
            if (!credentials?.userId || !credentials?.email) {
                return null;
            }

            const user = await db
            .select()
            .from(users)
            .where(eq(users.id, credentials.userId.toString()))
            .limit(1);

            if (user.length === 0) {
                return null;
            }

            return {
                id: user[0].id.toString(),
                email: user[0].email,
                name: user[0].firstName + " " + user[0].lastName,
                role: user[0].role,
                phoneNumber: user[0].phoneNumber || "",
                phoneVerified: user[0].phoneVerified || false,
                profileImage: user[0].profileImage || "",
            } as User;
        },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" 
        ? `__Secure-next-auth.session-token`
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.role = user.role;
        token.phoneNumber = user.phoneNumber;
        token.phoneVerified = user.phoneVerified;
        token.profileImage = user.profileImage;
      }
      return token;
    },
    async session({ session, token }) {
        if(session.user) {
            session.user.id = token.id as string;
            session.user.name = token.name as string;
            session.user.role = token.role as typeof userRoleEnum.enumValues[number];
            session.user.phoneNumber = token.phoneNumber as string;
            session.user.phoneVerified = token.phoneVerified as boolean;
            session.user.profileImage = token.profileImage as string | undefined;
        }
        return session;
    },
  },
});