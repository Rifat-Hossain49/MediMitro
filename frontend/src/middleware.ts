import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Define route categories
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
  const isPublicRoute = ["/", "/auth/signin", "/auth/signup"].includes(nextUrl.pathname)
  const isAuthRoute = nextUrl.pathname.startsWith("/auth/")
  const isProtectedRoute = [
    "/dashboard",
    "/profile", 
    "/appointments",
    "/records",
    "/prescriptions",
    "/settings",
    "/ehr",
    "/meds",
    "/pharmacy",
    "/physician",
    "/ambulance",
    "/hire-ambulance",
    "/icu",
    "/symptom-checker",
    "/admin"
  ].some(route => nextUrl.pathname.startsWith(route))

  // Allow API auth routes
  if (isApiAuthRoute) {
    return NextResponse.next()
  }

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  // Redirect non-logged-in users to signin for protected routes
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/signin", nextUrl))
  }

  // Allow all other routes
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};


