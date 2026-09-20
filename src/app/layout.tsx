import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FavoritesProvider } from "@/lib/favorites-context";
import { AuthProvider } from "@/lib/auth-context";
import ThemeProvider from "@/components/ThemeProvider";
import AuthLoadingOverlay from "@/components/AuthLoadingOverlay";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Meteorite Real Estate",
    template: "%s | Meteorite Real Estate",
  },
  description:
    "Meteorite Real Estate — a RERA-certified Dubai brokerage since 2005, helping you buy, sell, lease and manage property across the UAE.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AuthProvider>
            <FavoritesProvider>{children}</FavoritesProvider>
            <AuthLoadingOverlay />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
