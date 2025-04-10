import { NextRequest, NextResponse } from 'next/server';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { languages, fallbackLng } from './i18n-config';

function getLocale(request: NextRequest): string {
  // Negotiator expects plain object so we need to transform headers
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // Use negotiator and intl-localematcher to get best locale
  let languages: string[] = [];
  try {
    languages = new Negotiator({ headers: negotiatorHeaders }).languages();
  } catch (e) {
    console.error('Failed to get languages from Negotiator', e);
  }

  // Try to get locale from cookie or accept-language header
  const locale = matchLocale(languages, ['en', 'ja'], fallbackLng);
  return locale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the request is for the admin/analytics page
  if (pathname.includes('/admin/analytics')) {
    // Check if the admin is authenticated via cookie
    const adminSession = request.cookies.get('admin_session');

    // If not authenticated, redirect to the login page
    if (!adminSession || adminSession.value !== 'authenticated') {
      const url = new URL(`/${getLocale(request)}/admin/login`, request.url);

      // Preserve the original query parameters
      request.nextUrl.searchParams.forEach((value, key) => {
        url.searchParams.set(key, value);
      });

      // Add the redirect parameter
      url.searchParams.set('redirect', pathname);

      return NextResponse.redirect(url);
    }

    // If authenticated, continue to the admin page
    return NextResponse.next();
  }

  // Skip if the request is for a static file, API, or already has a locale
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('/api/') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg')
  ) {
    return;
  }

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = languages.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);

    // Create new URL with the locale prefix
    const newUrl = new URL(
      `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
      request.url
    );

    // Preserve all query parameters from the original request
    request.nextUrl.searchParams.forEach((value, key) => {
      newUrl.searchParams.set(key, value);
    });

    // Redirect to the new URL
    return NextResponse.redirect(newUrl);
  }

  // Get the response
  const response = NextResponse.next();

  return response;
}

export const config = {
  // Matcher ignoring `/_next/`, `/api/`, and static files
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|.*\\..*|favicon.ico).*)',
    // Optional: include root path
    '/',
  ],
};
