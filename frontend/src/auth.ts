import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { z } from "zod"

// Validation schema for credentials
const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    // Google OAuth - Essential for healthcare platforms
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    // Email/Password - Essential for healthcare compliance
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const response = await fetch('http://localhost:8080/api/auth/verify-credentials', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            if (data.success && data.user) {
              return {
                id: data.user.id,
                email: data.user.email,
                name: data.user.name,
                role: data.user.role,
                image: data.user.image,
              }
            }
          }
          return null
        } catch (error) {
          console.error('Credentials authentication error:', error)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle OAuth sign-in (Google)
      if (account?.provider === "google") {
        try {
          const response = await fetch(`http://localhost:8080/api/auth/oauth-user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            if (data.success) {
              // Update user object with database ID and role
              user.id = data.user.id
              user.role = data.user.role
              return true
            }
          }

          console.error('Failed to save OAuth user to database')
          return false
        } catch (error) {
          console.error('Error saving OAuth user:', error)
          return false
        }
      }

      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role || "patient" // Default role for healthcare
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Redirect to appropriate dashboard based on user role
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  trustHost: true,
})

// Helper function to register new users
export async function registerUser(email: string, password: string, name: string, role: string = "patient") {
  try {
    const response = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        name,
        role,
      }),
    })

    const data = await response.json()

    if (response.ok && data.success) {
      return {
        success: true,
        message: data.message || 'User registered successfully',
        user: data.user
      }
    } else {
      return {
        success: false,
        error: data.message || data.error || 'Registration failed'
      }
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Registration failed"
    }
  }
}
