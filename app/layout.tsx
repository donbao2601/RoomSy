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
  icons: {
    icon: [
      { url: "/roomsy-favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/roomsy-favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
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
          <div className="md:pt-[88px]">{children}</div>
        </LanguageProvider>
      </body>
    </html>
  );
}
