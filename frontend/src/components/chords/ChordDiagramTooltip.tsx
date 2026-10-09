"use client";

import React, { useState } from "react";
import { Volume2, Guitar, Music, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getGuitarChordShape, getChordPianoNotes, getChordGuitarNotes, GuitarChordShape } from "@/lib/chords";
import { Chord, Note } from "@tonaljs/tonal";
import * as Tone from "tone";
import { getGrandPianoSampler, getAcousticGuitarSampler } from "@/lib/audio";

interface ChordDiagramTooltipProps {
  chord: string;
  defaultInstrument?: "guitar" | "piano";
}

let pianoSampler: Tone.Sampler | null = null;
let guitarSampler: Tone.Sampler | null = null;
let fallbackPiano: Tone.PolySynth | null = null;
let fallbackGuitar: Tone.PolySynth | null = null;

export const getPiano = () => {
  if (!pianoSampler && typeof window !== "undefined") {
    pianoSampler = getGrandPianoSampler();
  }
  return pianoSampler;
};

export const getGuitar = () => {
  if (!guitarSampler && typeof window !== "undefined") {
    guitarSampler = getAcousticGuitarSampler();
  }
  return guitarSampler;
};

export const getFallbackPiano = () => {
  if (!fallbackPiano && typeof window !== "undefined") {
    fallbackPiano = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.005, decay: 1.5, sustain: 0.1, release: 1.2 }
    }).toDestination();
    fallbackPiano.volume.value = -3;
  }
  return fallbackPiano;
};

export const getFallbackGuitar = () => {
  if (!fallbackGuitar && typeof window !== "undefined") {
    fallbackGuitar = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle8" },
      envelope: { attack: 0.003, decay: 1.2, sustain: 0.08, release: 0.9 }
    }).toDestination();
    fallbackGuitar.volume.value = -1;
  }
  return fallbackGuitar;
};

export default function ChordDiagramTooltip({
  chord,
  defaultInstrument = "guitar"
}: ChordDiagramTooltipProps) {
  const [instrument, setInstrument] = useState<"guitar" | "piano">(defaultInstrument);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Eagerly pre-load both instruments on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      getGuitar();
      getPiano();
      getFallbackGuitar();
      getFallbackPiano();
    }
  }, []);

  const [rootPart, bassPart] = chord.split("/");
  const cleanMain = rootPart.trim();
  const chordInfo = Chord.get(cleanMain);

  const guitarShape: GuitarChordShape = getGuitarChordShape(chord);
  const pianoNotes = getChordPianoNotes(chord);
  const guitarNotes = getChordGuitarNotes(chord);

  const rawNotes = chordInfo.notes && chordInfo.notes.length > 0 ? chordInfo.notes : [];
  const displayNotes = bassPart && !rawNotes.includes(bassPart) 
    ? [bassPart, ...rawNotes].join(" • ")
    : (rawNotes.length > 0 ? rawNotes.join(" • ") : chord);

  const handlePlayChord = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (Tone.context.state !== "running") {
        await Tone.start();
      }
      setIsPlayingAudio(true);
      const now = Tone.now();

      if (instrument === "guitar") {
        const sampler = getGuitar();
        if (sampler && sampler.loaded) {
          guitarNotes.forEach((note, idx) => {
            // Realistic guitar downward strum
            sampler.triggerAttackRelease(note, "2n", now + idx * 0.035, 0.85);
          });
        } else {
          // Instant fallback synth if audio sample buffers are still downloading
          const synth = getFallbackGuitar();
          if (synth) {
            guitarNotes.forEach((note, idx) => {
              synth.triggerAttackRelease(note, "2n", now + idx * 0.035, 0.8);
            });
          }
        }
      } else {
        const sampler = getPiano();
        if (sampler && sampler.loaded) {
          pianoNotes.forEach((note, idx) => {
            // Piano arpeggiated voicing
            sampler.triggerAttackRelease(note, "1.5n", now + idx * 0.03, 0.8);
          });
        } else {
          // Instant fallback synth if audio sample buffers are still downloading
          const synth = getFallbackPiano();
          if (synth) {
            pianoNotes.forEach((note, idx) => {
              synth.triggerAttackRelease(note, "1.5n", now + idx * 0.03, 0.75);
            });
          }
        }
      }

      setTimeout(() => setIsPlayingAudio(false), 900);
    } catch (err) {
      console.error("Audio playback error:", err);
      setIsPlayingAudio(false);
    }
  };

  // Guitar SVG coordinate calculations
  const numStrings = 6;
  const numFrets = 4;
  const width = 160;
  const height = 150;
  const paddingX = 24;
  const paddingTop = 28;
  const paddingBottom = 16;

  const stringSpacing = (width - paddingX * 2) / (numStrings - 1);
  const fretSpacing = (height - paddingTop - paddingBottom) / numFrets;

  const baseFret = guitarShape.baseFret || 1;

  // Mini Piano generation (C3 to B4 or C4 to B4)
  const WHITE_KEYS = ["C", "D", "E", "F", "G", "A", "B", "C", "D", "E", "F", "G", "A", "B"];
  const BLACK_KEYS_MAP: Record<number, string> = {
    0: "C#", 1: "D#", 3: "F#", 4: "G#", 5: "A#",
    7: "C#", 8: "D#", 10: "F#", 11: "G#", 12: "A#"
  };

  const cleanPianoNotesNormalized = pianoNotes.map(n => Note.simplify(n).replace(/[0-9]/g, ""));

  // Format type nicely (shorten overly long strings)
  const formatType = (typeStr: string) => {
    if (!typeStr) return cleanMain.endsWith("m") ? "Minor" : "Major";
    const s = typeStr.toLowerCase();
    if (s.includes("suspended second") || s === "sus2") return "Sus2";
    if (s.includes("suspended fourth") || s === "sus4") return "Sus4";
    if (s.includes("major seventh") || s === "maj7") return "Maj7";
    if (s.includes("minor seventh") || s === "min7" || s === "m7") return "Min7";
    if (s.includes("dominant seventh") || s === "7") return "Dom7";
    if (s.includes("diminished seventh") || s === "dim7") return "Dim7";
    if (s.includes("half-diminished") || s === "m7b5") return "m7♭5";
    if (s.includes("diminished") || s === "dim") return "Dim";
    if (s.includes("augmented") || s === "aug") return "Aug";
    if (s === "major") return "Major";
    if (s === "minor") return "Minor";
    if (s.includes("second")) return "2nd";
    if (s.includes("fourth")) return "4th";
    if (s.includes("seventh")) return "7th";
    if (s.includes("ninth")) return "9th";
    return typeStr.length > 9 ? typeStr.slice(0, 9) : typeStr;
  };

  const baseType = chordInfo.type ? formatType(chordInfo.type) : (cleanMain.endsWith("m") ? "Minor" : "Major");
  const chordTypeLabel = bassPart ? `${baseType}/${bassPart}` : baseType;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="p-3.5 bg-[#0d0d0e]/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] w-60 text-left select-none text-white z-50 pointer-events-auto"
    >
      {/* Top Header */}
      <div className="pb-2.5 mb-2.5 border-b border-white/10">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-nowrap">
              <span className="font-extrabold text-xl text-orange-400 tracking-tight leading-none shrink-0">
                {chord}
              </span>
              <span className="text-[9px] font-bold text-zinc-300 uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-white/10 border border-white/10 truncate max-w-[110px]">
                {chordTypeLabel}
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 font-mono mt-1.5 truncate">
              {displayNotes}
            </div>
          </div>

          {/* Audio Play Button */}
          <button
            onClick={handlePlayChord}
            title={`Play ${chord} on ${instrument}`}
            className={`w-8 h-8 rounded-xl border shrink-0 flex items-center justify-center transition-all cursor-pointer ${
              isPlayingAudio
                ? "bg-orange-500/30 border-orange-400/50 text-orange-300 scale-95 shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                : "bg-white/5 border-white/10 hover:bg-white/15 text-zinc-300 hover:text-white"
            }`}
          >
            <Volume2 className={`w-4 h-4 ${isPlayingAudio ? "animate-pulse" : ""}`} />
          </button>
        </div>
      </div>

      {/* Instrument Toggle */}
      <div className="flex bg-black/40 p-0.5 rounded-lg border border-white/10 mb-2.5">
        <button
          onClick={() => setInstrument("guitar")}
          className={`flex-1 py-1 flex items-center justify-center gap-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
            instrument === "guitar"
              ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Guitar className="w-3.5 h-3.5" /> Guitar
        </button>
        <button
          onClick={() => setInstrument("piano")}
          className={`flex-1 py-1 flex items-center justify-center gap-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
            instrument === "piano"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Music className="w-3.5 h-3.5" /> Piano
        </button>
      </div>

      {/* Guitar Diagram */}
      {instrument === "guitar" ? (
        <div className="flex flex-col items-center justify-center py-1">
          <svg width={width} height={height} className="overflow-visible">
            {/* Base Fret Label */}
            {baseFret > 1 && (
              <text
                x={paddingX - 14}
                y={paddingTop + fretSpacing * 0.7}
                fill="#a1a1aa"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                {baseFret}fr
              </text>
            )}

            {/* Nut (Thick line if baseFret is 1) */}
            <line
              x1={paddingX}
              y1={paddingTop}
              x2={width - paddingX}
              y2={paddingTop}
              stroke={baseFret === 1 ? "#ffffff" : "#52525b"}
              strokeWidth={baseFret === 1 ? "3.5" : "1.5"}
              strokeLinecap="round"
            />

            {/* Horizontal Frets */}
            {Array.from({ length: numFrets }).map((_, fIdx) => (
              <line
                key={`fret-${fIdx}`}
                x1={paddingX}
                y1={paddingTop + (fIdx + 1) * fretSpacing}
                x2={width - paddingX}
                y2={paddingTop + (fIdx + 1) * fretSpacing}
                stroke="#3f3f46"
                strokeWidth="1.2"
              />
            ))}

            {/* Vertical Strings */}
            {Array.from({ length: numStrings }).map((_, sIdx) => {
              const x = paddingX + sIdx * stringSpacing;
              const fretVal = guitarShape.frets[sIdx];
              return (
                <g key={`string-${sIdx}`}>
                  {/* String line */}
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={paddingTop + numFrets * fretSpacing}
                    stroke="#71717a"
                    strokeWidth={sIdx < 3 ? "1.6" : "1.1"}
                  />

                  {/* Top indicator: X or O */}
                  {fretVal === -1 ? (
                    <text
                      x={x}
                      y={paddingTop - 10}
                      fill="#ef4444"
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      ×
                    </text>
                  ) : fretVal === 0 ? (
                    <circle
                      cx={x}
                      cy={paddingTop - 10}
                      r="4"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="1.5"
                    />
                  ) : null}

                  {/* String label bottom (E A D G B E) */}
                  <text
                    x={x}
                    y={height - 2}
                    fill="#71717a"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {["E", "A", "D", "G", "B", "e"][sIdx]}
                  </text>
                </g>
              );
            })}

            {/* Barre bar if present */}
            {guitarShape.barres && guitarShape.barres.length > 0 && (
              guitarShape.barres.map((bFret, bIdx) => {
                const relFret = bFret - baseFret + 1;
                if (relFret < 1 || relFret > numFrets) return null;
                const y = paddingTop + (relFret - 0.5) * fretSpacing;
                return (
                  <rect
                    key={`barre-${bIdx}`}
                    x={paddingX}
                    y={y - 4}
                    width={width - paddingX * 2}
                    height={8}
                    rx="4"
                    fill="#d946ef"
                    opacity="0.8"
                  />
                );
              })
            )}

            {/* Dots for Finger Positions */}
            {guitarShape.frets.map((fret, sIdx) => {
              if (fret === -1 || fret === 0 || fret === null) return null;
              const relFret = fret - baseFret + 1;
              if (relFret < 1 || relFret > numFrets) return null;

              const x = paddingX + sIdx * stringSpacing;
              const y = paddingTop + (relFret - 0.5) * fretSpacing;
              const finger = guitarShape.fingers?.[sIdx];

              return (
                <g key={`dot-${sIdx}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r="7.5"
                    fill="#f43f5e"
                    className="drop-shadow-[0_2px_4px_rgba(244,63,94,0.5)]"
                  />
                  {finger && (
                    <text
                      x={x}
                      y={y}
                      fill="#ffffff"
                      fontSize="9"
                      fontFamily="sans-serif"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {finger}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      ) : (
        /* Piano Keyboard Diagram */
        <div className="py-2 flex flex-col items-center">
          <div className="relative w-full h-24 bg-[#141416] rounded-xl border border-white/10 p-1 flex justify-center items-start overflow-hidden">
            <div className="relative flex">
              {WHITE_KEYS.slice(0, 10).map((keyNote, idx) => {
                const isActive = cleanPianoNotesNormalized.includes(keyNote);
                return (
                  <div
                    key={`white-${idx}`}
                    className={`relative w-5 h-20 rounded-b-sm border-r border-black/30 transition-colors flex items-end justify-center pb-1 ${
                      isActive ? "bg-emerald-400 text-black font-bold shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-zinc-200 text-zinc-500"
                    }`}
                  >
                    <span className="text-[8px] font-mono select-none">{keyNote}</span>
                  </div>
                );
              })}

              {/* Black keys overlaid */}
              {WHITE_KEYS.slice(0, 9).map((_, idx) => {
                const blackNote = BLACK_KEYS_MAP[idx];
                if (!blackNote) return null;
                const isActive = cleanPianoNotesNormalized.includes(blackNote);
                const leftOffset = idx * 20 + 13;

                return (
                  <div
                    key={`black-${idx}`}
                    style={{ left: `${leftOffset}px` }}
                    className={`absolute top-0 w-3.5 h-12 rounded-b-sm z-10 transition-colors flex items-end justify-center pb-0.5 ${
                      isActive ? "bg-cyan-400 text-black font-bold shadow-[0_0_8px_rgba(6,182,212,0.6)]" : "bg-[#18181b] border border-black/50"
                    }`}
                  >
                    {isActive && (
                      <span className="text-[6px] font-mono leading-none select-none text-black font-black">
                        #
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <span className="text-[9px] text-zinc-400 mt-2 font-mono text-center truncate max-w-full">
            Voicing: <span className="text-zinc-200 font-semibold">{pianoNotes.map(n => Note.simplify(n)).join(" - ")}</span>
          </span>
        </div>
      )}
    </div>
  );
}
