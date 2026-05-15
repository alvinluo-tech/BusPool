import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Fallback: read NEXT_LOCALE cookie directly
  if (!locale || !routing.locales.includes(locale as "en" | "zh")) {
    try {
      const cookieStore = await cookies();
      locale = cookieStore.get("NEXT_LOCALE")?.value;
    } catch {
      // cookies() may not be available in all contexts
    }
  }

  if (!locale || !routing.locales.includes(locale as "en" | "zh")) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default,
  };
});
