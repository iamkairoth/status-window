import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// --- Type declarations are handled SOLELY in types/next-auth.d.ts ---

// <<< ADD THIS LOG TEMPORARILY >>>
// This log runs when the file is initially processed.
console.log("route.ts processing start.");
console.log("route.ts processing. Raw ADMIN_EMAIL:", process.env.ADMIN_EMAIL); // Check if email loads
console.log("route.ts processing. Raw ADMIN_PASSWORD_HASH:", process.env.ADMIN_PASSWORD_HASH);
console.log("route.ts processing. Raw ADMIN_PASSWORD_HASH length:", process.env.ADMIN_PASSWORD_HASH?.length);
// <<< END ADDED LOG >>>


const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // --- THIS IS WHERE THE AUTHORIZE FUNCTION BELONGS ---
      async authorize(credentials) {
        console.log("Authorize attempt received for email:", credentials?.email); // Log input email

        const adminEmail = process.env.ADMIN_EMAIL;
        let adminPasswordHash = process.env.ADMIN_PASSWORD_HASH; // Use 'let'

        // 1. Check for missing env vars
        if (!adminEmail || !adminPasswordHash) {
            console.error("Admin credentials environment variables (ADMIN_EMAIL or ADMIN_PASSWORD_HASH) not set!");
            console.log("AUTH_DEBUG: Failed - Env vars missing");
            return null;
        }

        // Log the loaded hash and length BEFORE any potential modification
        console.log("AUTH_DEBUG: Env vars loaded. ADMIN_EMAIL:", adminEmail, "Hash length:", adminPasswordHash.length);
        // Optional: Log the raw hash string itself if you want absolute certainty (be careful not to expose this in production logs)
        // console.log("AUTH_DEBUG: Raw Loaded Hash:", adminPasswordHash);


        // --- WORKAROUND TEST (Revised based on '$' stripping) ---
        // Hypothesis: All '$' signs are stripped, resulting in length 57.
        // Prepend the standard bcrypt prefix "$2b$10$" if the loaded hash
        // is length 57 and doesn't start with '$' (confirming stripping).
        const expectedStrippedLength = 53; // Original hash length (60) - number of '$' signs (3)
        const standardBcryptPrefix = '$2b$10$'; // The prefix that gets stripped

        if (adminPasswordHash.length === expectedStrippedLength && !adminPasswordHash.startsWith('$')) {
             console.warn("AUTH_DEBUG: Applying '$' stripping workaround.");
             // Prepend the standard bcrypt prefix
             adminPasswordHash = standardBcryptPrefix + adminPasswordHash;
             console.log("AUTH_DEBUG: Hash after workaround:", adminPasswordHash, "New length:", adminPasswordHash.length);
        }
        // Note: If your hash started with $2a$ instead of $2b$, you'd adjust the prefix accordingly.
        // --- END WORKAROUND TEST ---


        if (credentials?.email === adminEmail) {
          console.log("AUTH_DEBUG: Email matches.");
          // 3. Compare passwords - use the potentially modified adminPasswordHash
          // bcrypt.compare needs the hash string starting with $2a$ or $2b$ etc.
          const passwordMatch = await bcrypt.compare(credentials?.password || "", adminPasswordHash);

          if (passwordMatch) {
            console.log("AUTH_DEBUG: Password matches. Authorization successful!");
            // Authentication successful!
            // Return a user object. Its shape MUST match your 'User' interface defined in types/next-auth.d.ts.
            return {
              id: "admin",
              email: adminEmail,
              isAdmin: true,
            };
          } else {
             console.log("AUTH_DEBUG: Failed - Password mismatch.");
          }
        } else {
            console.log("AUTH_DEBUG: Failed - Email mismatch. Provided:", credentials?.email, "Expected:", adminEmail);
        }

        console.log("AUTH_DEBUG: Final return null.");
        return null;
      },
      // --- END OF AUTHORIZE FUNCTION ---
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