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
  metadataBase: new URL("https://chordyn.vercel.app"),
  title: {
    default: "Chordyn — Song Chords, Piano & Guitar Tools",
    template: "%s | Chordyn",
  },
  description: "Explore song chords, transpose progressions, tune your guitar, build piano progressions, and learn music theory with Chordyn.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192x192.png?v=3",
    apple: "/apple-touch-icon.png?v=3",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Chordyn",
  },
  verification: {
    google: "rsmP3tnBH38XZ0mAGggv0I5_LWrW6NyoXHPvII3_ncM",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Chordyn — Song Chords, Piano & Guitar Tools",
    description: "Explore song chords, transpose progressions, tune your guitar, build piano progressions, and learn music theory with Chordyn.",
    url: "https://chordyn.vercel.app",
    siteName: "Chordyn",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Chordyn Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chordyn — Song Chords, Piano & Guitar Tools",
    description: "Explore song chords, transpose progressions, tune your guitar, build piano progressions, and learn music theory with Chordyn.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://chordyn.vercel.app/#website",
      "url": "https://chordyn.vercel.app",
      "name": "Chordyn",
      "description": "The ultimate toolkit for musicians. Play, learn, and orchestrate with Chordyn.",
      "publisher": {
        "@type": "Organization",
        "name": "Chordyn",
        "url": "https://chordyn.vercel.app",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://chordyn.vercel.app/#application",
      "name": "Chordyn",
      "applicationCategory": "MultimediaApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes cursorBlink {
                0%, 49.9% { opacity: 1; }
                50%, 100% { opacity: 0; }
              }
              .animate-cursor-blink {
                animation: cursorBlink 0.75s step-end infinite !important;
              }
            `,
          }}
        />
      </head>
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
