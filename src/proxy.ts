import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET || "p3rqS8-8K9L2m4B9xR3vT6yU9zW2a5b8-RENEWED-SESSIONS-CLEARED",
})

export const proxy = withAuth({
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET || "p3rqS8-8K9L2m4B9xR3vT6yU9zW2a5b8-RENEWED-SESSIONS-CLEARED",
})

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/api/expenses/:path*",
    "/api/categories/:path*",
    "/api/statuses/:path*",
  ],
}
