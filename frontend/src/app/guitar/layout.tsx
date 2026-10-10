import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Online Guitar Tuner, Chords & Fretboard Tools",
  description: "Live chromatic guitar tuner with microphone detection, interactive SVG fretboard, CAGED chord shapes library, and alternate tunings calculator.",
  alternates: {
    canonical: "/guitar",
  },
  openGraph: {
    title: "Online Guitar Tuner, Chords & Fretboard Tools | Chordyn",
    description: "Live chromatic guitar tuner with microphone detection, interactive SVG fretboard, CAGED chord shapes library, and alternate tunings calculator.",
    url: "https://chordyn.vercel.app/guitar",
  },
};

const breadcrumbsJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://chordyn.vercel.app",
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Guitar Toolkit",
      "item": "https://chordyn.vercel.app/guitar",
    },
  ],
};

export default function GuitarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      {children}
    </>
  );
}
