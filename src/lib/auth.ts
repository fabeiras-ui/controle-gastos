import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "fake-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "fake-secret",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          const user = await prisma.user.findUnique({ where: { email: credentials.email } })
          if (!user || !user.password) return null
          const isValid = await bcrypt.compare(credentials.password, user.password)
          if (!isValid) return null
          return { 
            id: user.id.toString(), 
            name: user.nickname, 
            email: user.email,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  pages: { 
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!user.email) return false
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        })

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email,
              nickname: user.name || user.email.split('@')[0],
            }
          })
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      
      // Limpa campos que podem aumentar muito o tamanho do cookie (HTTP 431)
      if (token.picture) delete token.picture
      if (token.image) delete token.image
      if (token.name) delete token.name
      
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}
