/**
 * Vercel Edge Middleware for automatic geo-redirect
 * Redirects users to their preferred language based on:
 * 1. Cookie preference (if user manually selected a language)
 * 2. Browser Accept-Language header
 * 3. IP-based country detection (via Vercel geo headers)
 */

const SUPPORTED_LOCALES = ['en', 'de', 'fr', 'es', 'it', 'ru', 'ar', 'pt', 'tr', 'ja', 'hu', 'nl'];
const DEFAULT_LOCALE = 'en';
const PREFERENCE_COOKIE = 'sp_locale_pref';
const REDIRECTED_COOKIE = 'sp_geo_redirected';

// Map country codes to locales
const COUNTRY_TO_LOCALE = {
  // German-speaking countries
  DE: 'de', AT: 'de', CH: 'de', LI: 'de',
  // French-speaking countries
  FR: 'fr', BE: 'fr', MC: 'fr', LU: 'fr',
  // Spanish-speaking countries
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', PE: 'es', VE: 'es', CL: 'es', EC: 'es',
  GT: 'es', CU: 'es', BO: 'es', DO: 'es', HN: 'es', PY: 'es', SV: 'es', NI: 'es',
  CR: 'es', PA: 'es', UY: 'es', PR: 'es',
  // Italian-speaking countries
  IT: 'it', SM: 'it', VA: 'it',
  // Russian-speaking countries
  RU: 'ru', BY: 'ru', KZ: 'ru', KG: 'ru',
  // Arabic-speaking countries
  SA: 'ar', AE: 'ar', EG: 'ar', IQ: 'ar', MA: 'ar', DZ: 'ar', SD: 'ar', YE: 'ar',
  SY: 'ar', TN: 'ar', JO: 'ar', LY: 'ar', LB: 'ar', OM: 'ar', KW: 'ar', QA: 'ar', BH: 'ar',
  // Portuguese-speaking countries
  BR: 'pt', PT: 'pt', AO: 'pt', MZ: 'pt',
  // Turkish-speaking countries
  TR: 'tr', CY: 'tr',
  // Japanese-speaking countries
  JP: 'ja',
  // Hungarian-speaking countries
  HU: 'hu',
  // Dutch-speaking countries
  NL: 'nl', SR: 'nl',
};

// Map browser language codes to supported locales
function mapLanguageToLocale(lang) {
  if (!lang) return null;

  // Normalize: lowercase and get primary language tag
  const normalized = lang.toLowerCase().split('-')[0];

  if (SUPPORTED_LOCALES.includes(normalized)) {
    return normalized;
  }

  return null;
}

// Parse Accept-Language header and return best matching locale
function getBrowserLocale(acceptLanguage) {
  if (!acceptLanguage) return null;

  // Parse Accept-Language header (e.g., "ja,en-US;q=0.9,en;q=0.8")
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, qValue] = lang.trim().split(';q=');
      return {
        code: code.trim(),
        quality: qValue ? parseFloat(qValue) : 1.0
      };
    })
    .sort((a, b) => b.quality - a.quality);

  // Find first matching supported locale
  for (const { code } of languages) {
    const locale = mapLanguageToLocale(code);
    if (locale) {
      return locale;
    }
  }

  return null;
}

// Get locale from country code
function getCountryLocale(countryCode) {
  if (!countryCode) return null;
  return COUNTRY_TO_LOCALE[countryCode.toUpperCase()] || null;
}

// Get current locale from pathname
function getCurrentLocale(pathname) {
  const match = pathname.match(/^\/([a-z]{2})(\/|$)/);
  if (match && SUPPORTED_LOCALES.includes(match[1])) {
    return match[1];
  }
  return 'en'; // Root is English
}

// Check if path should skip redirect (assets, API, etc.)
function shouldSkipRedirect(pathname) {
  const skipPatterns = [
    /^\/assets\//,
    /^\/api\//,
    /^\/_next\//,
    /^\/favicon/,
    /^\/robots\.txt$/,
    /^\/sitemap/,
    /^\/manifest\.json$/,
    /^\/service-worker\.js$/,
    /^\/preview\.png$/,
    /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp|mp4|webm|pdf)$/i,
  ];

  return skipPatterns.some(pattern => pattern.test(pathname));
}

export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

export default function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Skip static assets and special paths
  if (shouldSkipRedirect(pathname)) {
    return;
  }

  // Get cookies
  const cookies = request.cookies;
  const userPreference = cookies.get(PREFERENCE_COOKIE)?.value;
  const alreadyRedirected = cookies.get(REDIRECTED_COOKIE)?.value;

  // If user has manually set a preference, respect it (no auto-redirect)
  if (userPreference) {
    return;
  }

  // If we've already redirected this session, don't redirect again
  if (alreadyRedirected) {
    return;
  }

  // Get current locale from URL
  const currentLocale = getCurrentLocale(pathname);

  // Determine target locale
  // Priority: 1. Browser language, 2. IP country
  const acceptLanguage = request.headers.get('accept-language');
  const country = request.headers.get('x-vercel-ip-country');

  let targetLocale = getBrowserLocale(acceptLanguage);

  // Fall back to country-based detection if browser language doesn't match
  if (!targetLocale) {
    targetLocale = getCountryLocale(country);
  }

  // Fall back to default if nothing matches
  if (!targetLocale) {
    targetLocale = DEFAULT_LOCALE;
  }

  // If already on the correct locale, let the request proceed
  if (currentLocale === targetLocale) {
    return;
  }

  // Build redirect URL
  let newPathname;
  if (targetLocale === 'en') {
    // English is at root - remove locale prefix if present
    newPathname = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');
  } else {
    // Add locale prefix
    if (currentLocale === 'en') {
      // Currently at root, add prefix
      newPathname = `/${targetLocale}${pathname}`;
    } else {
      // Replace existing prefix
      newPathname = pathname.replace(/^\/[a-z]{2}(\/|$)/, `/${targetLocale}$1`);
    }
  }

  // Ensure trailing slash consistency
  if (!newPathname.endsWith('/') && !newPathname.includes('.')) {
    newPathname += '/';
  }

  const redirectUrl = new URL(newPathname, request.url);
  redirectUrl.search = url.search; // Preserve query params

  // Create redirect response with cookie to prevent redirect loops
  const response = Response.redirect(redirectUrl.toString(), 307);

  // Set cookie to mark that we've redirected (expires in 24 hours)
  // This prevents redirect loops while allowing users to navigate manually
  response.headers.append('Set-Cookie', `${REDIRECTED_COOKIE}=1; Path=/; Max-Age=86400; SameSite=Lax`);

  return response;
}
