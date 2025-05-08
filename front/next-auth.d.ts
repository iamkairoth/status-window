// types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth"; // Import Default types
import { JWT as DefaultJWT } from "next-auth/jwt"; // Import Default JWT type

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session extends DefaultSession { // Extend the built-in Session interface
    // Augment the built-in user property type
    // Combine the default user type (which includes name, email, image)
    // with your custom additions (id, isAdmin)
    user: DefaultSession["user"] & {
      id: string; // Add your custom fields (id is also required by DefaultUser)
      isAdmin?: boolean; // Your custom property
      // name, email, image are inherited from DefaultSession["user"]
    };
    // Add any other top-level session properties you need here
    // myCustomField?: string;
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback and the Credentials provider's `authorize` callback.
   * It's also the type of the `user` property in the `Session` object.
   */
  interface User extends DefaultUser { // Extend the built-in User interface
    // Add your custom properties to the User object
    id: string; // Add your custom fields (id is also required by DefaultUser)
    isAdmin?: boolean; // Your custom property
    // name, email, image are inherited from DefaultUser
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
  interface JWT extends DefaultJWT { // Extend the built-in JWT interface
    // Add your custom properties to the JWT payload
    id: string; // Add user id to the JWT payload (often aligns with 'sub')
    isAdmin?: boolean; // Add your custom field to the JWT payload
    // name, email, picture (from DefaultJWT) are inherited from DefaultJWT
  }
}