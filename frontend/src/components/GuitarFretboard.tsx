"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Chord, Note, Interval, Progression, Key } from "@tonaljs/tonal";
import { ChevronDown, Play, Plus, Minus, Info, Music, Hash, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as Tone from "tone";

const ROOTS = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];
const QUALITIES = [
  { label: "Major", value: "maj" },
  { label: "Minor", value: "minor" },
  { label: "Diminished", value: "dim" },
  { label: "Major 7th", value: "maj7" },
  { label: "Minor 7th", value: "m7" },
  { label: "Dominant 7th", value: "7" },
];

const CAGED_DICTIONARY: Record<string, { id: string; rootString: number; fretOffsets: (number|null)[]; fingers: (number|null)[] }[]> = {
  "maj": [
    { id: "E Shape", rootString: 5, fretOffsets: [0, 0, 1, 2, 2, 0], fingers: [1, 1, 2, 4, 3, 1] },
    { id: "A Shape", rootString: 4, fretOffsets: [0, 2, 2, 2, 0, null], fingers: [1, 4, 3, 2, 1, null] },
    { id: "D Shape", rootString: 3, fretOffsets: [2, 3, 2, 0, null, null], fingers: [2, 3, 1, null, null, null] },
    { id: "C Shape", rootString: 4, fretOffsets: [0, 1, 0, 2, 3, null], fingers: [1, 2, 1, 3, 4, null] },
    { id: "G Shape", rootString: 5, fretOffsets: [3, 0, 0, 0, 2, 3], fingers: [4, 1, 1, 1, 2, 3] }
  ],
  "minor": [
    { id: "Em Shape", rootString: 5, fretOffsets: [0, 0, 0, 2, 2, 0], fingers: [1, 1, 1, 4, 3, 1] },
    { id: "Am Shape", rootString: 4, fretOffsets: [0, 1, 2, 2, 0, null], fingers: [1, 2, 4, 3, 1, null] },
    { id: "Dm Shape", rootString: 3, fretOffsets: [1, 3, 2, 0, null, null], fingers: [1, 3, 2, null, null, null] }
  ],
  "maj7": [
    { id: "Emaj7 Shape", rootString: 5, fretOffsets: [0, 0, 1, 1, 2, 0], fingers: [1, 1, 2, 2, 3, 1] },
    { id: "Amaj7 Shape", rootString: 4, fretOffsets: [0, 2, 1, 2, 0, null], fingers: [1, 4, 2, 3, 1, null] }
  ],
  "m7": [
    { id: "Em7 Shape", rootString: 5, fretOffsets: [0, 0, 0, 0, 2, 0], fingers: [1, 1, 1, 1, 3, 1] },
    { id: "Am7 Shape", rootString: 4, fretOffsets: [0, 1, 0, 2, 0, null], fingers: [1, 2, 1, 3, 1, null] }
  ],
  "7": [
    { id: "E7 Shape", rootString: 5, fretOffsets: [0, 0, 1, 0, 2, 0], fingers: [1, 1, 2, 1, 3, 1] },
    { id: "A7 Shape", rootString: 4, fretOffsets: [0, 2, 0, 2, 0, null], fingers: [1, 4, 1, 3, 1, null] },
    { id: "D7 Shape", rootString: 3, fretOffsets: [2, 1, 2, 0, null, null], fingers: [3, 1, 2, null, null, null] }
  ],
  "dim": [
    { id: "Edim Shape", rootString: 5, fretOffsets: [null, 2, 0, 2, 1, 0], fingers: [null, 3, null, 4, 2, 1] }
  ]
};

const TUNINGS: Record<string, string[]> = {
  "Standard": ["E4", "B3", "G3", "D3", "A2", "E2"],
  "Drop D": ["E4", "B3", "G3", "D3", "A2", "D2"],
  "Half-Step Down": ["Eb4", "Bb3", "Gb3", "Db3", "Ab2", "Eb2"],
  "DADGAD": ["D4", "A3", "G3", "D3", "A2", "D2"]
};

const getChroma = (noteName: string) => Note.chroma(noteName);

export default function GuitarFretboard() {
  const [root, setRoot] = useState("C");
  const [quality, setQuality] = useState("maj");
  const [tuningName, setTuningName] = useState("Standard");

  const NUM_FRETS = 15;
  const currentTuning = TUNINGS[tuningName];

  // AUDIO ENGINE
  const samplerRef = useRef<Tone.Sampler | null>(null);

  useEffect(() => {
    // Initialize a high-quality acoustic guitar sampler using actual recorded samples
    const GUITAR_BASE = "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_steel-mp3/";
    samplerRef.current = new Tone.Sampler({
      urls: {
        "A2": GUITAR_BASE + "A2.mp3",
        "C3": GUITAR_BASE + "C3.mp3",
        "E3": GUITAR_BASE + "E3.mp3",
        "G3": GUITAR_BASE + "G3.mp3",
        "A3": GUITAR_BASE + "A3.mp3",
        "C4": GUITAR_BASE + "C4.mp3",
        "E4": GUITAR_BASE + "E4.mp3",
        "G4": GUITAR_BASE + "G4.mp3",
        "A4": GUITAR_BASE + "A4.mp3",
        "C5": GUITAR_BASE + "C5.mp3",
        "E5": GUITAR_BASE + "E5.mp3",
      },
      release: 2,
    }).toDestination();
    
    // Volume boost to ensure the samples are punchy
    samplerRef.current.volume.value = 5;

    return () => {
      samplerRef.current?.dispose();
    };
  }, []);

  const playChord = async (notes: string[]) => {
    if (!samplerRef.current || !samplerRef.current.loaded) return;
    await Tone.start();
    
    const now = Tone.now();
    // Strum effect: offset each note by 30ms downwards
    notes.forEach((note, index) => {
       samplerRef.current?.triggerAttackRelease(note, "2n", now + index * 0.03);
    });
  };

  // Transpose Logic
  const transpose = (direction: 1 | -1) => {
    let currentIndex = ROOTS.indexOf(root);
    // If using flat equivalent, find by chroma
    if (currentIndex === -1) {
       const targetChroma = getChroma(root);
       currentIndex = ROOTS.findIndex(r => getChroma(r) === targetChroma);
    }
    let newIndex = (currentIndex + direction) % ROOTS.length;
    if (newIndex < 0) newIndex += ROOTS.length;
    setRoot(ROOTS[newIndex]);
  };

  // Derive the chord notes
  const chordInfo = useMemo(() => Chord.get(`${root}${quality}`), [root, quality]);
  const chordNotes = chordInfo.empty ? [] : chordInfo.notes;
  const chordChromas = chordNotes.map(getChroma);

  // Generate the full matrix of notes on the fretboard
  const fretboardMatrix = useMemo(() => {
    return currentTuning.map((openNote) => {
      const stringNotes = [];
      for (let fret = 0; fret <= NUM_FRETS; fret++) {
        const noteName = Note.transpose(openNote, Interval.fromSemitones(fret));
        const chroma = getChroma(noteName);
        const isChordNote = chordChromas.includes(chroma);
        const isRoot = chroma === getChroma(root);
        stringNotes.push({ note: noteName, chroma, isChordNote, isRoot, fret });
      }
      return stringNotes;
    });
  }, [currentTuning, chordChromas, root]);

  // Voicing Engine (CAGED Dictionary or Mathematical Fallback)
  const voicings = useMemo(() => {
    
    // CAGED Dictionary Engine (Standard Tuning Only)
    if (tuningName === "Standard" && CAGED_DICTIONARY[quality]) {
      const shapes = CAGED_DICTIONARY[quality];
      const targetChroma = getChroma(root);
      const stringChromas = currentTuning.map(getChroma);
      
      const generatedVoicings = shapes.map(shape => {
        const rootStringChroma = stringChromas[shape.rootString];
        let rootNoteFret = (targetChroma - rootStringChroma + 12) % 12;
        
        const rootOffsetInShape = shape.fretOffsets[shape.rootString];
        if (rootOffsetInShape === null) return null; // Should never happen
        
        let anchorFret = rootNoteFret - rootOffsetInShape;
        while (anchorFret < 0) {
           anchorFret += 12;
        }

        const fretPositions: (number | null)[] = [];
        const voicingNotes: string[] = [];
        const fingerMap: (number | null)[] = [];
        
        let minFret = 999;
        let maxFret = -1;

        for (let stringIdx = 0; stringIdx < 6; stringIdx++) {
           const offset = shape.fretOffsets[stringIdx];
           if (offset === null) {
              fretPositions.push(null);
              fingerMap.push(null);
           } else {
              const actualFret = anchorFret + offset;
              fretPositions.push(actualFret);
              voicingNotes.push(fretboardMatrix[stringIdx][actualFret].note);
              
              if (actualFret === 0) {
                 fingerMap.push(null);
              } else {
                 fingerMap.push(shape.fingers[stringIdx]);
              }

              if (actualFret > 0 && actualFret < minFret) minFret = actualFret;
              if (actualFret > maxFret) maxFret = actualFret;
           }
        }
        
        if (minFret === 999) minFret = 1;
        if (maxFret < minFret + 3) maxFret = minFret + 3;

        // Detect barre
        let barreFret = null;
        let barreStart = null;
        let barreEnd = null;
        if (minFret > 0) {
           const fingerOnMinFret = fretPositions.map((f, i) => f === minFret && fingerMap[i] === 1 ? i : null).filter(i => i !== null) as number[];
           if (fingerOnMinFret.length > 1) {
              barreFret = minFret;
              barreEnd = Math.min(...fingerOnMinFret);
              barreStart = Math.max(...fingerOnMinFret);
           }
        }

        const strumNotes = [...voicingNotes].reverse();
        const title = anchorFret === 0 ? `Standard Voicing` : `${shape.id} (${anchorFret}fr)`;

        return { 
          id: title, bounds: [minFret, maxFret], fretPositions, strumNotes, fingerMap,
          barre: barreFret ? { fret: barreFret, start: barreStart, end: barreEnd } : null,
          anchorFret
        };
      }).filter(v => v !== null);

      return generatedVoicings.sort((a, b) => a!.anchorFret - b!.anchorFret);
    }

    // Fallback Mathematical Engine (Alternate Tunings)
    const positions = [
      { id: "Open Voicing", bounds: [0, 4] },
      { id: "Mid Voicing", bounds: [5, 9] },
      { id: "High Voicing", bounds: [10, 14] }
    ];

    return positions.map(pos => {
      const voicingNotes: string[] = [];
      const fretPositions: (number | null)[] = [];
      const fingerMap: (number | null)[] = [];
      
      for (let stringIdx = 0; stringIdx < 6; stringIdx++) {
        let foundFret: number | null = null;
        for (let fret = pos.bounds[0]; fret <= pos.bounds[1]; fret++) {
           if (fretboardMatrix[stringIdx][fret].isChordNote) {
              foundFret = fret;
              voicingNotes.push(fretboardMatrix[stringIdx][fret].note);
              break;
           }
        }
        if (pos.bounds[0] === 0 && fretboardMatrix[stringIdx][0].isChordNote && foundFret !== 0) {
           foundFret = 0;
           voicingNotes[voicingNotes.length - 1] = fretboardMatrix[stringIdx][0].note;
        }
        fretPositions.push(foundFret);
        fingerMap.push(foundFret && foundFret > 0 ? 0 : null); // No real finger numbers for fallback
      }
      
      const strumNotes = [...voicingNotes].reverse();
      
      return { ...pos, fretPositions, strumNotes, fingerMap, barre: null };
    });
  }, [fretboardMatrix, tuningName, root, quality]);

const CHORD_INSIGHTS: Record<string, { mood: string, usage: string, relative: string, progressions: string, genres: string }> = {
  maj: { 
    mood: "Happy, Stable, Resolved", 
    usage: "The foundational anchor of Western music. Functioning as the Tonic (I), Subdominant (IV), or Dominant (V).",
    relative: "Ionian, Lydian, Mixolydian",
    progressions: "I - IV - V - I (Classic), I - vi - IV - V (50s Pop)",
    genres: "Pop, Rock, Country, Classical"
  },
  minor: { 
    mood: "Sad, Serious, Emotional", 
    usage: "Creates profound emotional depth and narrative tension.",
    relative: "Aeolian (Natural Minor), Dorian, Phrygian",
    progressions: "i - VI - III - VII (Epic), i - iv - V (Tragic)",
    genres: "Metal, R&B, Cinematic, Trap"
  },
  dim: { 
    mood: "Tense, Unstable, Dark", 
    usage: "An inherently unstable chord built on two minor thirds. Used as a passing chord.",
    relative: "Locrian",
    progressions: "vii° - I (Resolution)",
    genres: "Classical, Jazz, Film Scoring"
  },
  aug: { 
    mood: "Suspenseful, Dreamy", 
    usage: "Built with two major thirds, it feels floating and ungrounded. Used as a dominant substitute.",
    relative: "Whole Tone Scale",
    progressions: "V+ - I (Turnaround)",
    genres: "Jazz, Romantic Classical, Neo-Soul"
  },
  maj7: { 
    mood: "Lush, Jazzy, Romantic", 
    usage: "Adds a layer of sophistication to the standard major triad.",
    relative: "Ionian, Lydian",
    progressions: "Imaj7 - vi7 - ii7 - V7",
    genres: "Jazz, Lo-Fi, R&B, Bossa Nova"
  },
  m7: { 
    mood: "Smooth, Melancholy, Soulful", 
    usage: "A softer, less harsh iteration of the standard minor triad.",
    relative: "Dorian, Aeolian",
    progressions: "ii7 - V7 - Imaj7",
    genres: "Neo-Soul, Hip-Hop, Jazz, Funk"
  },
  "7": { 
    mood: "Bluesy, Pulling, Funky", 
    usage: "The ultimate engine of motion in harmony containing a tritone.",
    relative: "Mixolydian, Blues Scale",
    progressions: "V7 - I",
    genres: "Blues, Funk, Rock & Roll, Gospel"
  },
  sus2: { 
    mood: "Open, Airy, Floating", 
    usage: "Creates a vast, open sound by omitting the emotional 3rd entirely.",
    relative: "Pentatonic, Ionian",
    progressions: "Isus2 - I",
    genres: "Modern Pop, Ambient, Worship"
  },
  sus4: { 
    mood: "Anticipatory, Tense", 
    usage: "Creates strong forward momentum by replacing the 3rd with a perfect 4th.",
    relative: "Mixolydian",
    progressions: "Vsus4 - V - I",
    genres: "Classic Rock, Pop, Orchestral"
  },
  m7b5: { 
    mood: "Mysterious, Jazz-noir", 
    usage: "The 'half-diminished' chord. The absolute workhorse of minor key jazz.",
    relative: "Locrian",
    progressions: "iiø7 - V7alt - i",
    genres: "Jazz, Bossa Nova, Noir"
  },
  maj9: { 
    mood: "Ethereal, Complex", 
    usage: "Expands the maj7 chord by adding the 9th, creating an incredibly dense texture.",
    relative: "Lydian",
    progressions: "Imaj9 - IVmaj9",
    genres: "Neo-Soul, Smooth Jazz, R&B"
  },
  m9: { 
    mood: "Cinematic, Sophisticated", 
    usage: "Adds incredibly rich texture to a minor chord by stacking the minor 7th and major 9th.",
    relative: "Dorian",
    progressions: "i9 - iv9",
    genres: "Jazz Fusion, Lo-Fi, Cinematic"
  },
  "9": { 
    mood: "Bright, Spicy, Funky", 
    usage: "A dominant 7th chord with an added major 9th. The king of funk guitar.",
    relative: "Mixolydian",
    progressions: "I9 (Vamp)",
    genres: "Funk, Blues, R&B"
  }
};

  // Insights
  const getInsights = () => {
    const isMinor = quality.includes("m") && !quality.includes("maj");
    const intervals = chordInfo.intervals.join(", ");
    
    // Attempt progression mapping
    let progressionArr: string[] = [];
    if (!isMinor) {
       progressionArr = Progression.fromRomanNumerals(root, ["I", "V", "vi", "IV"]);
    } else {
       progressionArr = Progression.fromRomanNumerals(root, ["i", "VI", "III", "VII"]);
    }

    const data = CHORD_INSIGHTS[quality] || CHORD_INSIGHTS["maj"];

    return { 
       mood: data.mood, 
       usage: data.usage,
       relative: data.relative,
       genres: data.genres,
       intervals, 
       progressionArr 
    };
  };
  const insights = getInsights();

  return (
    <div className="relative rounded-[3rem] shadow-2xl w-full bg-white dark:bg-black/40 backdrop-blur-md shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] border border-black/10 dark:border-white/10 overflow-hidden [-webkit-mask-image:-webkit-radial-gradient(white,black)]">
      
      {/* Masked Animated Border */}
      <div 
         className="absolute inset-0 rounded-[3rem] pointer-events-none overflow-hidden"
         style={{
            padding: '2px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
         }}
      >
         <div className="absolute w-[4000px] h-[4000px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_0deg,rgba(217,70,239,0.5)_0%,rgba(255,255,255,1)_50%,rgba(217,70,239,0.5)_100%)]"></div>
      </div>

      <div className="relative z-10 p-8 md:p-12 w-full flex flex-col">
      
      {/* Top Header & Controls */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
         
         <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">Chord <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-500">Library</span></h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Explore voicings, insights, and play chords.</p>
         </div>

         <div className="flex flex-wrap gap-4 bg-white dark:bg-black/50 p-2 rounded-2xl border border-black/10 dark:border-white/10">
            {/* Transpose & Root */}
            <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1">
               <button onClick={() => transpose(-1)} className="w-10 h-10 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white hover:bg-black/5 dark:bg-white/5 rounded-lg transition-colors cursor-pointer"><Minus className="w-4 h-4"/></button>
               <div className="relative group w-[70px]">
                  <select 
                    value={root} onChange={e => setRoot(e.target.value)}
                    className="w-full bg-transparent text-center text-zinc-900 dark:text-white font-black text-xl focus:outline-none appearance-none cursor-pointer"
                  >
                    {ROOTS.map(r => <option key={r} value={r} className="bg-zinc-100 dark:bg-zinc-900 text-sm">{r}</option>)}
                  </select>
               </div>
               <button onClick={() => transpose(1)} className="w-10 h-10 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white hover:bg-black/5 dark:bg-white/5 rounded-lg transition-colors cursor-pointer"><Plus className="w-4 h-4"/></button>
            </div>

            <div className="relative group w-[150px]">
               <select 
                 value={quality} onChange={e => setQuality(e.target.value)}
                 className="w-full h-full bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl py-3 px-5 text-zinc-900 dark:text-white font-bold focus:outline-none focus:border-fuchsia-500 transition-colors appearance-none cursor-pointer"
               >
                 {QUALITIES.map(q => <option key={q.value} value={q.value} className="bg-zinc-100 dark:bg-zinc-900">{q.label}</option>)}
               </select>
               <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 dark:text-zinc-400 pointer-events-none group-hover:text-fuchsia-400" />
            </div>

            <div className="relative group w-[160px]">
               <select 
                 value={tuningName} onChange={e => setTuningName(e.target.value)}
                 className="w-full h-full bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl py-3 px-5 text-zinc-900 dark:text-white font-bold text-sm focus:outline-none focus:border-fuchsia-500 transition-colors appearance-none cursor-pointer"
               >
                 {Object.keys(TUNINGS).map(t => <option key={t} value={t} className="bg-zinc-100 dark:bg-zinc-900">{t} Tuning</option>)}
               </select>
               <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 dark:text-zinc-400 pointer-events-none group-hover:text-fuchsia-400" />
            </div>
         </div>
      </div>

      {/* Voicing Cards Row */}
      <div className="w-full overflow-x-auto pb-8 mb-8 scrollbar-hide transform-gpu">
         <div className="flex gap-6 w-max px-2">
            {voicings.map(voicing => {
               const { id, bounds, fretPositions, strumNotes, fingerMap, barre } = voicing;
               const startFret = bounds[0] === 0 ? 1 : bounds[0];
               const fretsToRender = Array.from({length: 5}, (_, i) => startFret + i);

               return (
                 <div key={id} className="bg-white dark:bg-black/40 border border-black/10 dark:border-white/10 hover:border-fuchsia-500/30 dark:hover:border-fuchsia-500/30 rounded-3xl p-6 flex flex-col items-center w-[180px] shadow-2xl relative group transition-colors duration-300 hover:bg-zinc-50 dark:hover:bg-white/5 transform-gpu shrink-0">
                    
                    <div className="flex justify-between items-center w-full mb-8">
                       <h3 className="font-bold text-zinc-900 dark:text-white tracking-widest text-[10px] uppercase">{id}</h3>
                       <button 
                         onClick={() => playChord(strumNotes)}
                         className="w-8 h-8 rounded-full bg-fuchsia-500 flex items-center justify-center text-black hover:scale-110 active:scale-95 transition-transform shadow-[0_0_15px_rgba(217,70,239,0.4)] cursor-pointer z-50 pointer-events-auto shrink-0"
                       >
                         <Play className="w-4 h-4 ml-0.5" />
                       </button>
                    </div>

                    {/* Classic Vertical Chord Diagram */}
                    <div className="relative w-[100px] h-[140px] flex flex-col mb-2">
                       {/* Top X / O indicators */}
                       <div className="flex justify-between w-full mb-2">
                          {[5, 4, 3, 2, 1, 0].map(stringIdx => {
                             const playedFret = fretPositions[stringIdx];
                             let indicator = "";
                             if (playedFret === null) indicator = "X";
                             else if (playedFret === 0) indicator = "O";
                             return (
                               <div key={`ind-${stringIdx}`} className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 w-[2px] flex justify-center overflow-visible">
                                  {indicator}
                               </div>
                             );
                          })}
                       </div>

                       {/* Fretboard Grid */}
                       <div className="relative w-full flex-1 flex flex-col">
                          {/* Nut / Top Border */}
                          {startFret === 1 ? (
                             <div className="w-full h-[6px] bg-zinc-400 z-10 shrink-0 rounded-sm"></div>
                          ) : (
                             <div className="w-full h-[2px] bg-zinc-600 z-10 shrink-0"></div>
                          )}
                          
                          {/* Fret Number Indicator */}
                          {startFret > 1 && (
                             <div className="absolute top-0 -right-8 text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                                {startFret}fr
                             </div>
                          )}

                          <div className="relative w-full flex-1 border-x-[2px] border-b-[2px] border-zinc-600 flex">
                             {/* Inner Strings */}
                             <div className="absolute inset-0 flex justify-between">
                                {[5, 4, 3, 2, 1, 0].map((_, i) => (
                                  <div key={`str-${i}`} className={`w-[2px] h-full ${i===0||i===5?'bg-transparent':'bg-zinc-600'}`}></div>
                                ))}
                             </div>

                             {/* Inner Frets */}
                             <div className="absolute inset-0 flex flex-col justify-evenly">
                                {[...Array(4)].map((_, i) => (
                                  <div key={`fret-${i}`} className="w-full h-[2px] bg-zinc-600"></div>
                                ))}
                             </div>

                             {/* Barre Indicator */}
                             {barre && barre.start !== null && barre.end !== null && (() => {
                                const leftPct = ((5 - barre.start) / 5) * 100;
                                const widthPct = ((barre.start - barre.end) / 5) * 100;
                                const yIdx = fretsToRender.indexOf(barre.fret);
                                if (yIdx === -1) return null;
                                
                                return (
                                  <div 
                                    className="absolute bg-fuchsia-500 rounded-full z-10 shadow-[0_0_12px_rgba(217,70,239,0.8)]"
                                    style={{
                                       left: `${leftPct}%`,
                                       width: `${widthPct}%`,
                                       top: `${((yIdx + 0.5) / 5) * 100}%`,
                                       height: '14px',
                                       transform: 'translateY(-50%)'
                                    }}
                                  ></div>
                                );
                             })()}

                             {/* Notes & Fingers */}
                             {[5, 4, 3, 2, 1, 0].map((stringIdx, xIdx) => {
                                const playedFret = fretPositions[stringIdx];
                                if (playedFret === null || playedFret === 0) return null;
                                
                                const yIdx = fretsToRender.indexOf(playedFret);
                                if (yIdx === -1) return null;

                                const isRoot = fretboardMatrix[stringIdx][playedFret].isRoot;
                                const fingerNum = fingerMap[stringIdx];

                                return (
                                   <div 
                                     key={`note-${stringIdx}`}
                                     className={`absolute w-3.5 h-3.5 rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-20 ${
                                       isRoot ? 'bg-fuchsia-500 text-black shadow-[0_0_8px_rgba(217,70,239,0.8)]' : 'bg-zinc-200 text-black shadow-md'
                                     }`}
                                     style={{ 
                                       left: `${(xIdx / 5) * 100}%`, 
                                       top: `${((yIdx + 0.5) / 5) * 100}%` 
                                     }}
                                   >
                                      {fingerNum && fingerNum !== 0 && (
                                         <span className="text-[8px] font-black">{fingerNum}</span>
                                      )}
                                   </div>
                                );
                             })}
                          </div>
                       </div>
                    </div>
                 </div>
               );
            })}
         </div>
      </div>

      {/* Premium Chord Analysis Dashboard */}
      <div className="w-full flex flex-col mt-4">
         <h3 className="text-zinc-900 dark:text-white text-sm font-bold tracking-widest uppercase mb-6 pl-3 border-l-2 border-fuchsia-500">Harmonic Analysis</h3>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left Column (Stats) */}
            <div className="flex flex-col gap-4">
               
               <div className="bg-white dark:bg-black/60 border border-black/10 dark:border-white/10 rounded-2xl p-6 flex flex-col relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                     <Info className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                     <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-widest">Aesthetic Profile</span>
                  </div>
                  <div className="flex items-end gap-2 relative z-10 mb-4">
                     <span className="text-2xl font-light text-zinc-900 dark:text-white tracking-tight">{insights.mood}</span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed relative z-10">
                     {insights.usage}
                  </p>
               </div>

               <div className="bg-white dark:bg-black/60 border border-black/10 dark:border-white/10 rounded-2xl p-6 flex flex-col relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                     <Layers className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                     <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-widest">Context & Scales</span>
                  </div>
                  <div className="flex flex-col gap-3 relative z-10">
                     <div className="flex flex-col">
                        <span className="text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-widest font-bold mb-1">Associated Genres</span>
                        <span className="text-sm text-zinc-900 dark:text-white">{insights.genres}</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-widest font-bold mb-1">Relative Scales</span>
                        <span className="text-sm text-zinc-900 dark:text-white">{insights.relative}</span>
                     </div>
                  </div>
               </div>

            </div>

            {/* Right Column (Progression & Intervals) */}
            <div className="flex flex-col gap-4">
               
               <div className="bg-white dark:bg-black/60 border border-black/10 dark:border-white/10 rounded-2xl p-6 flex flex-col relative group h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                     <Music className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                     <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-widest">Contextual Progression</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 relative z-10 mb-8">
                     {insights.progressionArr.map((chord, i) => (
                       <div key={i} className="flex items-center gap-3">
                          <div className={`px-5 py-2.5 rounded-xl font-bold text-sm tracking-wider ${i === 0 ? 'bg-fuchsia-500 text-black shadow-[0_0_15px_rgba(217,70,239,0.3)]' : 'border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 border border-black/10 dark:border-white/10'}`}>
                             {chord}
                          </div>
                          {i < insights.progressionArr.length - 1 && (
                             <div className="text-zinc-600 font-light">→</div>
                          )}
                       </div>
                     ))}
                  </div>

                  <div className="flex items-center gap-3 mb-4 relative z-10 mt-auto">
                     <Hash className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                     <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-widest">Interval Structure</span>
                  </div>
                  <div className="flex items-end gap-2 relative z-10">
                     <span className="text-3xl font-light text-zinc-900 dark:text-white tracking-tight font-mono">{insights.intervals}</span>
                  </div>
               </div>

            </div>

         </div>
      </div>

    </div>
    </div>
  );
}
