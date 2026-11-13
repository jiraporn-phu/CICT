import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      const { pathname } = req.nextUrl;
      
      const adminOnlyRoutes = [
        "/admin",
        "/dashboard",
        "/users",
        "/reports",
        "/categories",
        "/returns",
        "/borrow",
        "/equipment/manage"
      ];

      if (adminOnlyRoutes.some(route => pathname.startsWith(route))) {
        return token?.role === "admin";
      }

      return !!token;
    },
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/equipment/:path*", 
    "/borrow/:path*", 
    "/profile/:path*",
    "/users/:path*",
    "/reports/:path*",
    "/categories/:path*",
    "/returns/:path*",
    "/my-requests/:path*"
  ],
};
