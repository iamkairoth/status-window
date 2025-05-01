import NextAuth from "next-auth";
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

const handler = NextAuth({
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
      session.user.id = token.sub;
      session.user.isAdmin = token.isAdmin;
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
});

export { handler as GET, handler as POST };
