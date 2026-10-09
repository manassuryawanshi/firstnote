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

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
