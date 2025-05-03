import { auth } from "./auth";

const protectedRoutes = ["/dashboard", "/settings", "/profile"];

export default auth((req) => {
  console.log(req.auth);
  console.log(req.nextUrl.pathname);

  if (!req.auth && protectedRoutes.includes(req.nextUrl.pathname)) {
    const newUrl = new URL("/login", req.nextUrl.origin);
    return Response.redirect(newUrl);
  } else if (req.auth && req.nextUrl.pathname === "/register") {
    const newUrl = new URL("/", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/register",
    "/login",
    "/dashboard/:path*",
    "/settings/:path*",
    "/profile/:path*",
  ],
};
