import NextAuth, { User } from "next-auth"
import { compare } from "bcryptjs"
import CredentialsProvider from "next-auth/providers/credentials"
import { users, userRoleEnum } from "@/database/schema"
import { eq } from "drizzle-orm"
import { db } from "@/database/db"
import Google from "next-auth/providers/google"

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
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
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
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.role = user.role;
        token.phoneNumber = user.phoneNumber;
        token.phoneVerified = user.phoneVerified;
        token.profileImage = user.profileImage;
        
        // If OAuth login, we need to create/update user in our database
        if (account && account.provider === "google") {
          // Check if user exists in our database
          const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, user.email!))
            .limit(1);
            
          if (existingUser.length === 0) {
            // Create a new user with OAuth provider info
            try {
              // Generate a username from email
              const username = user.email!.split('@')[0] + '_' + Math.floor(Math.random() * 10000);
              
              const [newUser] = await db.insert(users).values({
                email: user.email!,
                // Create a username from the email
                username: username,
                // OAuth users don't have a password in our system
                password: crypto.randomUUID(), // random placeholder
                firstName: user.name?.split(' ')[0] || '',
                lastName: user.name?.split(' ').slice(1).join(' ') || '',
                profileImage: user.image || '',
                phoneVerified: false,
                emailVerified: true,
                authProvider: "GOOGLE",
                providerAccountId: account.providerAccountId,
              }).returning({ id: users.id });
              
              if (newUser?.id) {
                token.id = newUser.id.toString();
              }
            } catch (error) {
              console.error("Error creating user from OAuth:", error);
            }
          } else {
            // Update token with data from our database
            token.id = existingUser[0].id.toString();
            token.role = existingUser[0].role;
            token.phoneNumber = existingUser[0].phoneNumber;
            token.phoneVerified = existingUser[0].phoneVerified;
          }
        }
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