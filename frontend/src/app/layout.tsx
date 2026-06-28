import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
        <TutorialProvider>
          <Navbar />
          <div className="flex-1 flex flex-col w-full">
            {children}
          </div>
          <Footer />
        </TutorialProvider>
      </body>
    </html>
  );
}
