"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Volume2,
  Play,
  Pause,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Sparkles,
  Guitar,
  Music,
  ExternalLink,
  ChevronDown,
  FileText,
  Bookmark,
  Share2,
  Copy,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ChordPill from "./ChordPill";
import { transposeChordSheet, transposeChord } from "@/lib/chords";
import Link from "next/link";

interface SongSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  tabUrl: string;
  initialTitle?: string;
  initialArtist?: string;
}

interface SongData {
  song_name: string;
  artist_name: string;
  tonality: string;
  capo: number;
  tuning: string;
  difficulty: string;
  content: string;
  uniqueChords: string[];
}

export default function SongSheetModal({
  isOpen,
  onClose,
  tabUrl,
  initialTitle,
  initialArtist
}: SongSheetModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [song, setSong] = useState<SongData | null>(null);

  // Transpose state
  const [semitones, setSemitones] = useState(0);
  const [capo, setCapo] = useState<number>(0);
  const [originalCapo, setOriginalCapo] = useState<number>(0);

  // Auto-scroll state
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1); // 1 = normal, 2 = fast, 0.5 = slow
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Font size
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !tabUrl) return;

    let isCancelled = false;
    setLoading(true);
    setError(null);
    setSemitones(0);
    setIsAutoScrolling(false);

    async function fetchSheet() {
      try {
        const res = await fetch(`/api/chords/sheet?url=${encodeURIComponent(tabUrl)}`);
        if (!res.ok) throw new Error("Failed to load chord sheet");
        const data = await res.json();
        if (!isCancelled) {
          if (data.success && data.sheet) {
            setSong(data.sheet);
            const initialCapo = data.sheet.capo || 0;
            setCapo(initialCapo);
            setOriginalCapo(initialCapo);
          } else {
            setError(data.message || "Could not retrieve chord sheet");
          }
        }
      } catch (err: any) {
        if (!isCancelled) setError(err.message || "Failed to load song chords");
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    fetchSheet();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, tabUrl]);

  // Handle auto-scroll loop
  useEffect(() => {
    if (isAutoScrolling) {
      scrollIntervalRef.current = setInterval(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop += scrollSpeed;
        }
      }, 50);
    } else {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    }

    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [isAutoScrolling, scrollSpeed]);

  if (!isOpen) return null;

  // Active key calculations
  const originalKey = song?.tonality || "C";
  // Sounding concert key (changes only with vocal transposition semitones)
  const soundingKey = transposeChord(originalKey, semitones);

  // Capo transposition: raising the capo by +1 moves the guitar pitch up +1,
  // so the fingered chord shapes must transpose down -1 to preserve the sounding key.
  const capoDelta = capo - originalCapo;
  const effectiveSemitones = semitones - capoDelta;

  // Fingered chord shape key
  const fingeredKey = transposeChord(originalKey, effectiveSemitones);

  // Transposed content using effectiveSemitones (updates chords with capo!)
  const displayContent = song?.content ? transposeChordSheet(song.content, effectiveSemitones) : "";
  const lines = displayContent.split("\n");

  const handleCopy = () => {
    if (!displayContent) return;
    const cleanText = displayContent.replace(/\[\/?ch\]/g, "");
    navigator.clipboard.writeText(
      `${song?.song_name} - ${song?.artist_name}\nChord Shapes: ${fingeredKey} (Sounding Key: ${soundingKey})\nCapo: ${capo === 0 ? "None" : `Fret ${capo}`}\n\n${cleanText}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl h-[92vh] flex flex-col bg-[#09090b] border border-white/10 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden"
        >
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-6 bg-[#121215]/90 border-b border-white/10 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  Verified Chords
                </span>
                {song?.difficulty && (
                  <span className="text-[11px] text-zinc-400 font-medium">
                    • {song.difficulty}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
                {song?.song_name || initialTitle || "Loading Song..."}
              </h2>
              <p className="text-sm font-semibold text-zinc-400">
                {song?.artist_name || initialArtist || ""}
              </p>
            </div>

            {/* Quick Actions & Close */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold transition-all"
                title="Copy Chord Sheet"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
              </button>

              {/* Send to Piano Sandbox */}
              <Link
                href={`/piano`}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5 text-xs font-semibold transition-all"
                title="Open in Piano Suite"
              >
                <Music className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Piano Suite</span>
              </Link>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Controls Bar (Transpose, Capo, Auto-Scroll, Font) */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-[#0d0d10] border-b border-white/5 text-xs shrink-0 select-none">
            {/* Transpose Stepper */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 font-medium">Transpose:</span>
              <div className="flex items-center bg-black/60 rounded-xl border border-white/10 p-0.5">
                <button
                  onClick={() => setSemitones(prev => prev - 1)}
                  className="w-7 h-7 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-bold text-sm"
                  title="Transpose Down (-1 semitone)"
                >
                  -
                </button>
                <div className="px-2.5 py-0.5 text-center min-w-[3.5rem]">
                  <span className="font-bold text-orange-400">{soundingKey}</span>
                  {semitones !== 0 && (
                    <span className="text-[10px] text-zinc-500 ml-1">
                      ({semitones > 0 ? `+${semitones}` : semitones})
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSemitones(prev => prev + 1)}
                  className="w-7 h-7 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-bold text-sm"
                  title="Transpose Up (+1 semitone)"
                >
                  +
                </button>
              </div>

              {semitones !== 0 && (
                <button
                  onClick={() => setSemitones(0)}
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Reset to Original Key"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Capo Indicator / Adjustment */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 font-medium">Capo:</span>
              <div className="flex items-center bg-black/60 rounded-xl border border-white/10 p-0.5">
                <button
                  onClick={() => setCapo(prev => Math.max(0, prev - 1))}
                  className="w-6 h-6 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-bold text-xs"
                  title="Lower capo fret (transposes chord shapes up)"
                >
                  -
                </button>
                <span className="px-2 font-mono font-semibold text-orange-400 min-w-[4.2rem] text-center">
                  {capo === 0 ? "None" : `Fret ${capo}`}
                </span>
                <button
                  onClick={() => setCapo(prev => Math.min(11, prev + 1))}
                  className="w-6 h-6 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-bold text-xs"
                  title="Raise capo fret (transposes chord shapes down for easier open chords)"
                >
                  +
                </button>
              </div>

              {capo !== originalCapo && (
                <button
                  onClick={() => setCapo(originalCapo)}
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title={`Reset Capo to original (Fret ${originalCapo || "None"})`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Auto-Scroll Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all font-semibold ${
                  isAutoScrolling
                    ? "bg-orange-500/20 border-orange-400/50 text-orange-300"
                    : "bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {isAutoScrolling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>Auto-Scroll</span>
              </button>

              {isAutoScrolling && (
                <div className="flex items-center bg-black/60 rounded-xl border border-white/10 p-0.5">
                  {[0.5, 1, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setScrollSpeed(speed)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        scrollSpeed === speed ? "bg-orange-500/30 text-orange-300" : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Font Size Selector */}
            <div className="hidden sm:flex items-center gap-1 bg-black/60 rounded-xl border border-white/10 p-0.5">
              <button
                onClick={() => setFontSize("sm")}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                  fontSize === "sm" ? "bg-white/20 text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                A-
              </button>
              <button
                onClick={() => setFontSize("base")}
                className={`px-2 py-1 rounded-lg text-xs font-bold ${
                  fontSize === "base" ? "bg-white/20 text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize("lg")}
                className={`px-2 py-1 rounded-lg text-sm font-bold ${
                  fontSize === "lg" ? "bg-white/20 text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                A+
              </button>
            </div>
          </div>

          {/* Song Sheet Scroll Body */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar bg-[#050507]"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-400">
                <div className="w-10 h-10 rounded-full border-2 border-orange-500/30 border-t-orange-400 animate-spin" />
                <p className="text-sm font-medium animate-pulse">
                  Retrieving chords & lyrics from global library...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 max-w-md">
                  <p className="font-semibold text-sm">{error}</p>
                  <p className="text-xs text-zinc-400 mt-2">
                    Please try selecting another version from the search results or refine your search.
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`max-w-3xl mx-auto font-mono leading-relaxed transition-all ${
                  fontSize === "sm" ? "text-xs" : fontSize === "lg" ? "text-base" : "text-sm"
                }`}
              >
                {/* Tuning & Metadata Header */}
                <div className="mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
                  <div>
                    <span className="font-semibold text-zinc-300">Tuning:</span> {song?.tuning}
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-300">Chord Shapes:</span>{" "}
                    <span className="text-orange-300 font-bold">{fingeredKey}</span>
                    {capo > 0 && (
                      <span className="text-zinc-500 ml-1.5 font-sans">
                        (Sounding: <strong className="text-zinc-200">{soundingKey}</strong>)
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-300">Capo:</span>{" "}
                    <span className="text-orange-300 font-semibold">{capo === 0 ? "None" : `Fret ${capo}`}</span>
                    {capo !== originalCapo && (
                      <span className="text-zinc-500 ml-1 font-sans">
                        (orig. {originalCapo === 0 ? "None" : `Fret ${originalCapo}`})
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-orange-400 font-sans italic">
                    💡 Hover or tap any chord to view Guitar &amp; Piano diagrams!
                  </div>
                </div>

                {/* Parsed Lines */}
                <div className="space-y-1">
                  {lines.map((line, lineIdx) => {
                    const trimmed = line.trim();

                    // Section Heading e.g. [Chorus], [Verse 1], [Intro]
                    const sectionMatch = trimmed.match(/^\[(.*)\]$/);
                    if (sectionMatch && !trimmed.includes("[ch]")) {
                      return (
                        <div key={lineIdx} className="pt-4 pb-1">
                          <span className="inline-block px-3 py-1 rounded-xl text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-orange-200 shadow-sm">
                            {sectionMatch[1]}
                          </span>
                        </div>
                      );
                    }

                    // Chord Line containing [ch]...[/ch]
                    if (line.includes("[ch]")) {
                      const tokens = line.split(/(\[ch\].*?\[\/ch\])/);
                      return (
                        <div key={lineIdx} className="whitespace-pre min-h-[1.75rem] flex items-center">
                          {tokens.map((token, tIdx) => {
                            if (token.startsWith("[ch]") && token.endsWith("[/ch]")) {
                              const chordName = token.replace(/\[\/?ch\]/g, "").trim();
                              return <ChordPill key={tIdx} chord={chordName} />;
                            }
                            return <span key={tIdx} className="text-zinc-600 whitespace-pre select-none">{token}</span>;
                          })}
                        </div>
                      );
                    }

                    // Lyrics / Monospace line
                    return (
                      <div
                        key={lineIdx}
                        className={`whitespace-pre ${
                          trimmed.length === 0 ? "h-3" : "text-zinc-200 font-normal"
                        }`}
                      >
                        {line}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
