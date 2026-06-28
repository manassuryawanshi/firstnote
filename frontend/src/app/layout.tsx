import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import PWARegister from "@/components/PWARegister";
import { TutorialProvider } from "@/context/TutorialContext";
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
  title: "FirstNote",
  description: "The ultimate toolkit for musicians. Play, learn, and orchestrate with FirstNote.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FirstNote",
  },
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black flex flex-col min-h-screen`}>
        <PWARegister />
        <TutorialProvider>
          <Navbar />
          <div className="flex-1 flex flex-col w-full pb-28 md:pb-0">
            {children}
          </div>
          <BottomNav />
          <Footer />
        </TutorialProvider>
      </body>
    </html>
  );
}
