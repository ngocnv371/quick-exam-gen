import { updateSession } from "@/lib/supabase/proxy";
import { type NextRequest } from "next/server";
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // Run i18n routing first — handles locale redirects (e.g. / → /en)
  const i18nResponse = handleI18nRouting(request);

  // If it's a redirect, return immediately without touching auth
  if (i18nResponse.status !== 200) {
    console.log(`i18n redirect: ${request.url} → ${i18nResponse.headers.get("Location")}`);
    return i18nResponse;
  }

  // Run Supabase session update and carry over any i18n rewrite headers
  const supabaseResponse = await updateSession(request);
  i18nResponse.headers.forEach((value, key) => {
    supabaseResponse.headers.set(key, value);
  });

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/",
    "/(vi|en)/:path*", // Match root with optional locale
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
