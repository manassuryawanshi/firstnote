import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Online Piano Chord Dictionary & Progression Builder",
  description: "Interactive piano chord dictionary, drag-and-drop progression builder sandbox with Tone.js audio playback, and MIDI export for songwriters.",
  alternates: {
    canonical: "/piano",
  },
  openGraph: {
    title: "Online Piano Chord Dictionary & Progression Builder | Chordyn",
    description: "Interactive piano chord dictionary, drag-and-drop progression builder sandbox with Tone.js audio playback, and MIDI export for songwriters.",
    url: "https://chordyn.vercel.app/piano",
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
      "name": "Piano Suite",
      "item": "https://chordyn.vercel.app/piano",
    },
  ],
};

export default function PianoLayout({
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
