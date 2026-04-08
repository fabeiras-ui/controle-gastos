import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/",
  },
})

export const proxy = withAuth({
  pages: {
    signIn: "/",
  },
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
