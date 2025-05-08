import NextAuth, { NextAuthOptions, DefaultSession, DefaultUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs"; // Use bcryptjs for pure JS implementation

// --- CORRECT WAY TO EXTEND NEXTAUTH TYPES (from previous fix) ---

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      isAdmin?: boolean;
    };
  }
  interface User extends DefaultUser {
    id: string;
    isAdmin?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isAdmin?: boolean;
    // email?: string; // Optionally add if you rely on email in the token
  }
}

// --- END CORRECT TYPE EXTENSION ---


const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // --- MODIFIED: Get credentials from Environment Variables ---
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

        // Check if environment variables are set
        if (!adminEmail || !adminPasswordHash) {
            console.error("Admin credentials environment variables (ADMIN_EMAIL or ADMIN_PASSWORD_HASH) not set!");
            // IMPORTANT: Return null here to indicate login failure due to misconfiguration
            return null;
        }

        // 1. Check if the provided email matches the admin email from env var
        if (credentials?.email === adminEmail) {
          // 2. Compare the provided password with the HASHED password from env var
          // Use the async version of compare for better performance
          const passwordMatch = await bcrypt.compare(credentials?.password || "", adminPasswordHash);

          if (passwordMatch) {
            // Authentication successful!
            // Return a user object. Its shape MUST match your 'User' interface.
            // Use a consistent, hardcoded ID for this single admin account.
            return {
              id: "admin", // Use a fixed ID like "admin"
              email: adminEmail, // Use the email from the environment variable
              isAdmin: true, // Hardcode isAdmin to true for this user
            };
          }
        }

        // Return null if email doesn't match or password comparison fails
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        // Populate session user with data from the JWT token
        if (session.user && typeof session.user === 'object') {
           session.user.id = token.id;
           session.user.isAdmin = token.isAdmin ?? false;
           // session.user.email is usually populated by next-auth automatically
        } else {
            // Fallback if session.user isn't pre-populated
            session.user = {
              id: token.id,
              email: token.email || '', // Get email from token if available
              isAdmin: token.isAdmin ?? false,
            };
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      // On sign-in, the 'user' object is available (from authorize function)
      if (user) {
        // Add custom properties from the user object to the token
        token.id = user.id; // Add user id (from authorize return) to the token
        token.isAdmin = user.isAdmin; // Add isAdmin (from authorize return) to the token
        // next-auth usually adds user.email and user.id (as 'sub') by default
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    // Consider adding a custom error page for /api/auth/error if needed
    // error: '/auth/error',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };