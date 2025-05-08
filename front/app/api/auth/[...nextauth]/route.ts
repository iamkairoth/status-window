import NextAuth, { NextAuthOptions } from "next-auth"; // No longer need DefaultSession/User imports here
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs"; // Use bcryptjs for pure JS implementation

// --- Type declarations are now handled SOLELY in types/next-auth.d.ts ---


const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // --- Logic to get credentials from Environment Variables ---
        console.log("Authorize attempt received for email:", credentials?.email); // Log input email

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

        // 1. Check for missing env vars
        if (!adminEmail || !adminPasswordHash) {
            console.error("Admin credentials environment variables (ADMIN_EMAIL or ADMIN_PASSWORD_HASH) not set!");
            console.log("AUTH_DEBUG: Failed - Env vars missing");
            return null;
        }
         console.log("AUTH_DEBUG: Env vars loaded. ADMIN_EMAIL:", adminEmail, "Hash length:", adminPasswordHash.length);


        // 2. Check if email matches
        if (credentials?.email === adminEmail) {
          console.log("AUTH_DEBUG: Email matches.");
          // 3. Compare passwords
          const passwordMatch = await bcrypt.compare(credentials?.password || "", adminPasswordHash);

          if (passwordMatch) {
            console.log("AUTH_DEBUG: Password matches. Authorization successful!");
            // Authentication successful!
            // Return a user object. Its shape MUST match your 'User' interface defined in types/next-auth.d.ts.
            return {
              id: "admin", // Use a fixed ID like "admin"
              email: adminEmail, // Use the email from the environment variable
              isAdmin: true, // Hardcode isAdmin to true for this user
              // Include name, image etc. if they exist on DefaultUser and you need them
            };
          } else {
             console.log("AUTH_DEBUG: Failed - Password mismatch.");
          }
        } else {
            console.log("AUTH_DEBUG: Failed - Email mismatch. Provided:", credentials?.email, "Expected:", adminEmail);
        }

        // If none of the above conditions returned a user, authentication failed
        console.log("AUTH_DEBUG: Final return null.");
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
        // The 'token' object here corresponds to the JWT interface defined in types/next-auth.d.ts.
        // Access properties added in the jwt callback
        // Ensure session.user is an object before adding properties, it should conform to DefaultSession["user"] & { ... }
        if (session.user && typeof session.user === 'object') {
           // Access properties defined in types/next-auth.d.ts
           session.user.id = token.id; // Access 'id' property from token defined in types/next-auth.d.ts
           session.user.isAdmin = token.isAdmin ?? false; // Access 'isAdmin' from token
           // session.user.name, email, image are usually populated by next-auth default flow
        } else {
            // Fallback if session.user isn't pre-populated (less common, depends on DefaultSession)
            // This fallback might not be strictly necessary depending on next-auth version/config
            // but good for safety if session.user might be undefined initially.
            session.user = {
              id: token.id, // Use id from token
              email: token.email || '', // Use email from token if available
              isAdmin: token.isAdmin ?? false, // Use isAdmin from token
              // name, image might need explicit handling if not in token
              // name: token.name || null,
              // image: token.picture || null, // JWT 'picture' claim
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
        // The 'user' object here corresponds to the 'User' interface defined in types/next-auth.d.ts
        // Add properties from the user object to the token (JWT interface defined in types/next-auth.d.ts)
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