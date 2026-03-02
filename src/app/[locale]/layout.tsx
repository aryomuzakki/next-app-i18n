import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";
import { cookies } from "next/headers";
import { getUserData } from "@/lib/auth";
import QueryProvider from "@/components/layout/query-provider";
import { AuthProvider } from "@/components/layout/auth-provider";
import { ThemeProvider } from "@/components/layout/theme-provider";
import ProgressProvider from "@/components/layout/progress-provider";
import { LoginFlowProvider } from "@/components/layout/login-flow-provider";
import { PopupBannerProvider } from "@/components/layout/popup-banner-provider";
import BottomNav from "@/components/layout/bottom-nav";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next.js i18n Demo",
  description: "An internationalized Next.js app using next-intl",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const user = token ? await getUserData(token) : null;

  return (
    <html
      lang={locale}
      suppressHydrationWarning
    >
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider>
          <div
            id="app"
            className="app:border-x app:border-border app:min-h-[calc(100dvh-4px)] mx-auto h-full min-h-dvh max-w-(--app-max-width)"
            style={
              {
                // "--header-height": "78px",
                "--content-height": "calc(100dvh - var(--header-height))",
              } as React.CSSProperties
            }
          >
            <QueryProvider>
              <AuthProvider initialUser={user}>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="light"
                  enableSystem={false}
                  forcedTheme="light"
                  disableTransitionOnChange
                >
                  <ProgressProvider>
                    <LoginFlowProvider>
                      <PopupBannerProvider>
                        {/* <CrmMessageProvider> */}
                        {children}
                        <BottomNav key={2} />
                        {/* </CrmMessageProvider> */}
                      </PopupBannerProvider>
                    </LoginFlowProvider>
                  </ProgressProvider>
                  <Toaster
                    richColors
                    position="top-center"
                    swipeDirections={["top", "right"]}
                    visibleToasts={6}
                    mobileOffset={{ left: 0 }}
                    style={
                      {
                        "--width": "512px",
                      } as React.CSSProperties
                    }
                    // className="pt-(--offset-top)! top-0! bottom-0 bg-foreground/20"
                  />
                </ThemeProvider>
              </AuthProvider>
            </QueryProvider>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
