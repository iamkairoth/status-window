import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";



// Example user store (replace with Xata later)
const users = [
  {
    id: "1",
    email: "admin@example.com",
    password: bcrypt.hashSync("admin123", 10), // hashed
    isAdmin: true,
  },
];

// Define custom session and token types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      isAdmin?: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    isAdmin?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isAdmin?: boolean;
    sub?: string;
  }
}

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = users.find((u) => u.email === credentials?.email);
        if (user && bcrypt.compareSync(credentials?.password || "", user.password)) {
          return { id: user.id, email: user.email, isAdmin: user.isAdmin };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && typeof session.user === 'object' && token.sub) {
        session.user.id = token.sub;
        session.user.isAdmin = token.isAdmin ?? false;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };