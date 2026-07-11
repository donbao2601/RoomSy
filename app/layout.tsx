import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { getLocale } from "@/lib/i18n/getLocale";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-be-vietnam-pro",
});

export const metadata: Metadata = {
  title: "ROOMSY",
  description: "Marketplace cho thuê phòng trọ, căn hộ & ở ghép tại Việt Nam",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = getLocale();

  return (
    <html lang={locale}>
      <body className={`${beVietnamPro.variable} font-sans antialiased`}>
        <LanguageProvider initialLocale={locale}>
          <Navbar locale={locale} />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
