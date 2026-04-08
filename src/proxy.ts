import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export const proxy = withAuth({
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
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
