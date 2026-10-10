import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn Music Theory — Interactive Lessons",
  description: "Master music theory with 13 structured interactive modules covering chords, scales, intervals, modes, circle of fifths, and functional harmony.",
  alternates: {
    canonical: "/library",
  },
  openGraph: {
    title: "Learn Music Theory — Interactive Lessons | Chordyn",
    description: "Master music theory with 13 structured interactive modules covering chords, scales, intervals, modes, circle of fifths, and functional harmony.",
    url: "https://chordyn.vercel.app/library",
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
      "name": "Learn & Theory",
      "item": "https://chordyn.vercel.app/library",
    },
  ],
};

export default function LibraryLayout({
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
