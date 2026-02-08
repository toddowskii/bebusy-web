import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/ThemeProvider";
import DevErrorFilter from '@/components/DevErrorFilter'
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BeBusy - Social Network for Productive People",
  description: "Connect with focused, productive individuals. Share your progress, join focus groups, and stay motivated.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: 'var(--card-background)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
            }}
          />
          {/* Dev-only error filter to ignore noisy extension errors in dev */}
          <DevErrorFilter />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
