import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "admin@test.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // --- HARDCODED TESTING CREDENTIALS ---

        // 1. Admin Test Account
        if (credentials.email === "admin" && credentials.password === "admin") {
          return { 
            id: "1", 
            name: "System Admin", 
            email: "admin@aceec.ac.in", 
            role: "ADMIN" 
          };
        }
        
        // 2. HOD Test Account
        if (credentials.email === "hod" && credentials.password === "hod") {
          return { 
            id: "2", 
            name: "CSM HOD", 
            email: "hod@aceec.ac.in", 
            role: "HOD" 
          };
        }

        // If credentials don't match, reject the login
        return null;
      }
    })
  ],
  callbacks: {
    // This injects our custom RBAC role into the encrypted token
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role; 
      }
      return token;
    },
    // This makes the role available to our frontend pages
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role; 
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  // CHANGED: We are now pulling the secure key from your .env file
  // so it perfectly matches the key proxy.js uses!
  secret: process.env.NEXTAUTH_SECRET, 
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };