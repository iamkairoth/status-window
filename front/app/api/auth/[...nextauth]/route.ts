import NextAuth, { NextAuthOptions, DefaultSession, DefaultUser } from "next-auth"; // Make sure DefaultSession and DefaultUser are imported
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs"; // Use bcryptjs for pure JS implementation

// --- CORRECT WAY TO EXTEND NEXTAUTH TYPES (Required for compilation) ---
// This block tells TypeScript about the custom fields you add to the session, user, and token.

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session extends DefaultSession { // Extend the built-in Session interface
    // Add your custom properties to the Session object's user property
    user: DefaultSession["user"] & { // Combine the default user type with your additions
      id: string; // Assuming user.id is a string
      isAdmin?: boolean; // Your custom property
      // 'email' is usually already on DefaultSession["user"], no need to redefine unless needed
    };
    // You can add other root-level session properties here if needed
    // myCustomField: string;
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback and the Credentials provider's `authorize` callback.
   * It's also the type of the `user` property in the `Session` object.
   */
  interface User extends DefaultUser { // Extend the built-in User interface
    // Add your custom properties to the User object
    id: string; // Must include id as it's required by DefaultUser
    isAdmin?: boolean; // Your custom property
    // 'email' is usually already on DefaultUser, no need to redefine unless needed
  }

  // You can also extend the Account interface if needed
  // interface Account {}

  // You can also extend the Profile interface if needed
  // interface Profile {}
}

declare module "next-auth/jwt" {
  /**
   * Returned as a `token` property on the `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface JWT {
    // Add your custom properties to the JWT payload
    id: string; // Add the user ID to the token
    isAdmin?: boolean; // Your custom property
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
        console.log("Authorize attempt received for email:", credentials?.email); // Log input email

        // --- Logic to get credentials from Environment Variables ---
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

        // 1. Check for missing env vars
        if (!adminEmail || !adminPasswordHash) {
            console.error("Admin credentials environment variables (ADMIN_EMAIL or ADMIN_PASSWORD_HASH) not set!");
            console.log("AUTH_DEBUG: Failed - Env vars missing"); // <<< Add this log
            return null;
        }
         console.log("AUTH_DEBUG: Env vars loaded. ADMIN_EMAIL:", adminEmail, "Hash length:", adminPasswordHash.length); // <<< Add this log (don't log hash value itself)


        // 2. Check if email matches
        if (credentials?.email === adminEmail) {
          console.log("AUTH_DEBUG: Email matches."); // <<< Add this log
          // 3. Compare passwords
          const passwordMatch = await bcrypt.compare(credentials?.password || "", adminPasswordHash);

          if (passwordMatch) {
            console.log("AUTH_DEBUG: Password matches. Authorization successful!"); // <<< Add this log
            // Authentication successful!
            // Return a user object. Its shape MUST match your 'User' interface defined above.
            // Use a consistent, hardcoded ID for this single admin account.
            return {
              id: "admin", // Use a fixed ID like "admin"
              email: adminEmail, // Use the email from the environment variable
              isAdmin: true, // Hardcode isAdmin to true for this user
            };
          } else {
             console.log("AUTH_DEBUG: Failed - Password mismatch."); // <<< Add this log
          }
        } else {
            console.log("AUTH_DEBUG: Failed - Email mismatch. Provided:", credentials?.email, "Expected:", adminEmail); // <<< Add this log
        }

        // If none of the above conditions returned a user, authentication failed
        console.log("AUTH_DEBUG: Final return null."); // <<< Add this log
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // This callback is called whenever a session is checked or updated.
      // It receives the JWT token. You populate the session object here using data from the token.
      // console.log("SESSION_DEBUG: Session callback", { session, token }); // Optional logging
      if (token) {
        // The 'token' object here corresponds to the JWT interface you defined above.
        // We put 'id' and 'isAdmin' into the token in the jwt() callback below.
        // Ensure session.user is an object before adding properties
        if (session.user && typeof session.user === 'object') {
           session.user.id = token.id; // Get id from the token
           session.user.isAdmin = token.isAdmin ?? false; // Get isAdmin from the token
           // session.user.email is usually populated by next-auth default flow
        } else {
            // Fallback if session.user isn't pre-populated (less common)
            session.user = {
              id: token.id,
              email: token.email || '', // Get email from token if available
              isAdmin: token.isAdmin ?? false,
            };
        }
      }
      // console.log("SESSION_DEBUG: Session callback returning", session); // Optional logging
      return session;
    },
    async jwt({ token, user }) {
      // This callback is called whenever a JWT is created (after sign-in) or updated.
      // The 'user' object is only present on the first call after authorize() succeeds.
      // console.log("JWT_DEBUG: JWT callback", { token, user }); // Optional logging
      if (user) {
        // The 'user' object here corresponds to the 'User' interface you defined above
        // (the object returned from the authorize function).
        token.id = user.id; // Add user id (from authorize return) to the token
        token.isAdmin = user.isAdmin; // Add isAdmin (from authorize return) to the token
        // next-auth often automatically adds user.email and user.id (as 'sub') to the token by default
      }
      // console.log("JWT_DEBUG: JWT callback returning", token); // Optional logging
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    // Consider adding a custom error page for /api/auth/error if needed
    // error: '/auth/error',
  },
  session: {
    strategy: "jwt", // Use JWTs for sessions
  },
  // A database is NOT needed for JWT strategy *if* you handle user persistence/lookup
  // entirely within the authorize callback (as you currently are with env vars).
  // database: process.env.DATABASE_URL, // Not needed for JWT with custom authorize

  secret: process.env.NEXTAUTH_SECRET, // Required for signing/verifying JWTs
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };