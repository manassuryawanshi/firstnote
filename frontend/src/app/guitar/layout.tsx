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

export default function GuitarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
