"use client";

import { useState, useEffect, useMemo } from "react";
import { Chord, Note, Interval } from "@tonaljs/tonal";
import { Play, Minus, Plus, ArrowLeftRight, Sparkles, BookOpen, Piano, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import PianoKeyboard from "./PianoKeyboard";
import * as Tone from "tone";

const ROOTS = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];
const QUALITIES = [
  { label: "Major", value: "maj" },
  { label: "Minor", value: "minor" },
  { label: "Diminished", value: "dim" },
  { label: "Augmented", value: "aug" },
  { label: "Major 7th", value: "maj7" },
  { label: "Minor 7th", value: "m7" },
  { label: "Dominant 7th", value: "7" },
  { label: "Suspended 2", value: "sus2" },
  { label: "Suspended 4", value: "sus4" },
  { label: "Minor 7 flat 5", value: "m7b5" },
  { label: "Major 9th", value: "maj9" },
  { label: "Minor 9th", value: "m9" },
  { label: "Dominant 9th", value: "9" },
];

const CHORD_INSIGHTS: Record<string, { mood: string, usage: string, relative: string, progressions: string, genres: string }> = {
  maj: { 
    mood: "Happy, Stable, Resolved, Triumphant", 
    usage: "The foundational anchor of Western music. Functioning as the Tonic (I), Subdominant (IV), or Dominant (V), it establishes the tonal center and provides resolution. Its perfect fifth provides power while the major third provides brightness.",
    relative: "Ionian, Lydian, Mixolydian",
    progressions: "I - IV - V - I (Classic), I - vi - IV - V (50s Pop)",
    genres: "Pop, Rock, Country, Classical"
  },
  minor: { 
    mood: "Sad, Serious, Emotional, Melancholy", 
    usage: "Creates profound emotional depth and narrative tension. Often functions as the supertonic (ii), mediant (iii), or submediant (vi) in major keys, or as the core tonic (i) in minor keys.",
    relative: "Aeolian (Natural Minor), Dorian, Phrygian",
    progressions: "i - VI - III - VII (Epic), i - iv - V (Tragic)",
    genres: "Metal, R&B, Cinematic, Trap"
  },
  dim: { 
    mood: "Tense, Unstable, Dark, Suspenseful", 
    usage: "An inherently unstable chord built on two minor thirds. It desperately wants to resolve. Primarily used as a passing chord or a leading tone (vii°) that pulls strongly to the root.",
    relative: "Locrian, Diminished Whole-Half",
    progressions: "vii° - I (Resolution), I - I#dim - ii (Passing)",
    genres: "Classical, Jazz, Film Scoring"
  },
  aug: { 
    mood: "Suspenseful, Dreamy, Floating, Alien", 
    usage: "Built with two major thirds, it lacks a perfect fifth, making it feel perfectly symmetrical and ungrounded. Used as a dominant substitute (V+) to create a powerful, pulling tension towards a stable major chord.",
    relative: "Whole Tone Scale",
    progressions: "I - I+ - vi (Voice Leading), V+ - I (Turnaround)",
    genres: "Jazz, Romantic Classical, Neo-Soul"
  },
  maj7: { 
    mood: "Lush, Jazzy, Romantic, Nostalgic", 
    usage: "Adds a layer of sophistication to the standard major triad by stacking a major seventh. It softens the triad's impact, making it less 'triumphant' and more 'reflective'. Functioning often as Imaj7 or IVmaj7.",
    relative: "Ionian, Lydian",
    progressions: "Imaj7 - vi7 - ii7 - V7 (Jazz Standard), Imaj7 - IVmaj7",
    genres: "Jazz, Lo-Fi, R&B, Bossa Nova"
  },
  m7: { 
    mood: "Smooth, Melancholy, Soulful, Mellow", 
    usage: "A softer, less harsh iteration of the standard minor triad. By adding the minor seventh, it loses some of the pure sadness and replaces it with a smooth, groovy melancholy. The foundational chord of the ii-V-i.",
    relative: "Dorian, Aeolian",
    progressions: "ii7 - V7 - Imaj7 (The Jazz Cornerstone), i7 - v7",
    genres: "Neo-Soul, Hip-Hop, Jazz, Funk"
  },
  "7": { 
    mood: "Bluesy, Pulling, Funky, Unresolved", 
    usage: "The ultimate engine of motion in harmony. The dominant 7th contains a tritone (between the 3rd and flat 7th) that begs to resolve inward to the root. Used almost universally as the V7 chord.",
    relative: "Mixolydian, Blues Scale",
    progressions: "V7 - I (Authentic Cadence), I7 - IV7 - V7 (12-Bar Blues)",
    genres: "Blues, Funk, Rock & Roll, Gospel"
  },
  sus2: { 
    mood: "Open, Airy, Floating, Modern", 
    usage: "Creates a vast, open sound by omitting the emotional 3rd entirely and replacing it with a major 2nd. Without a 3rd, it is neither major nor minor, allowing it to float ambivalently before resolving.",
    relative: "Pentatonic, Ionian",
    progressions: "Isus2 - I (Soft Resolution), V - Isus2 (Modern Pop)",
    genres: "Modern Pop, Ambient, Contemporary Worship"
  },
  sus4: { 
    mood: "Anticipatory, Tense, Driving, Heroic", 
    usage: "Creates strong forward momentum by replacing the 3rd with a perfect 4th. The 4th clashes with the 5th, generating a powerful, bright tension that almost always demands a resolution down to the 3rd.",
    relative: "Mixolydian, Ionian",
    progressions: "Vsus4 - V - I (Classic Cadence), Isus4 - I",
    genres: "Classic Rock, Pop, Orchestral"
  },
  m7b5: { 
    mood: "Mysterious, Jazz-noir, Tragic, Pleading", 
    usage: "Also known as the 'half-diminished' chord. It contains the dark diminished triad but softens it with a minor 7th. It is the absolute workhorse of minor key jazz, functioning as the ii° in a ii-V-i.",
    relative: "Locrian",
    progressions: "iiø7 - V7alt - i (Minor Turnaround)",
    genres: "Jazz, Bossa Nova, Noir Soundtracks"
  },
  maj9: { 
    mood: "Ethereal, Dreamy, Complex, Sparkly", 
    usage: "Expands the maj7 chord by adding the 9th (a 2nd an octave up). This creates an incredibly dense, beautiful, and sparkling texture. It is a very 'wide' chord that requires careful voicing to avoid muddiness.",
    relative: "Lydian, Ionian",
    progressions: "Imaj9 - IVmaj9 (Vamp), ii9 - V13 - Imaj9",
    genres: "Neo-Soul, Smooth Jazz, R&B"
  },
  m9: { 
    mood: "Deep, Cinematic, Sophisticated, Brooding", 
    usage: "Adds incredibly rich texture to a minor chord by stacking both the minor 7th and the major 9th. It is often used for deep emotional or moody sections where a standard minor chord sounds too basic.",
    relative: "Dorian",
    progressions: "i9 - iv9 (Vamp), vi9 - ii9",
    genres: "Jazz Fusion, Lo-Fi Hip Hop, Cinematic"
  },
  "9": { 
    mood: "Funky, Bright, Forward, Spicy", 
    usage: "A dominant 7th chord with an added major 9th. It retains the strong pulling power of the dominant 7th but adds a bright, colorful crunch. The undisputed king of funk guitar and blues turnarounds.",
    relative: "Mixolydian",
    progressions: "I9 (James Brown Vamp), ii7 - V9 - Imaj7",
    genres: "Funk, Blues, R&B, Soul"
  }
};

// Global sampler instance outside of React's render cycle
let globalSampler: Tone.Sampler | null = null;
const getSampler = () => {
  if (!globalSampler) {
    const SALAMANDER_BASE = "https://tonejs.github.io/audio/salamander/";
    globalSampler = new Tone.Sampler({
      urls: {
        A0: SALAMANDER_BASE + "A0.mp3",
        C1: SALAMANDER_BASE + "C1.mp3",
        "D#1": SALAMANDER_BASE + "Ds1.mp3",
        "F#1": SALAMANDER_BASE + "Fs1.mp3",
        A1: SALAMANDER_BASE + "A1.mp3",
        C2: SALAMANDER_BASE + "C2.mp3",
        "D#2": SALAMANDER_BASE + "Ds2.mp3",
        "F#2": SALAMANDER_BASE + "Fs2.mp3",
        A2: SALAMANDER_BASE + "A2.mp3",
        C3: SALAMANDER_BASE + "C3.mp3",
        "D#3": SALAMANDER_BASE + "Ds3.mp3",
        "F#3": SALAMANDER_BASE + "Fs3.mp3",
        A3: SALAMANDER_BASE + "A3.mp3",
        C4: SALAMANDER_BASE + "C4.mp3",
        "D#4": SALAMANDER_BASE + "Ds4.mp3",
        "F#4": SALAMANDER_BASE + "Fs4.mp3",
        A4: SALAMANDER_BASE + "A4.mp3",
        C5: SALAMANDER_BASE + "C5.mp3",
        "D#5": SALAMANDER_BASE + "Ds5.mp3",
        "F#5": SALAMANDER_BASE + "Fs5.mp3",
        A5: SALAMANDER_BASE + "A5.mp3",
        C6: SALAMANDER_BASE + "C6.mp3",
        "D#6": SALAMANDER_BASE + "Ds6.mp3",
        "F#6": SALAMANDER_BASE + "Fs6.mp3",
        A6: SALAMANDER_BASE + "A6.mp3",
        C7: SALAMANDER_BASE + "C7.mp3",
        "D#7": SALAMANDER_BASE + "Ds7.mp3",
        "F#7": SALAMANDER_BASE + "Fs7.mp3",
        A7: SALAMANDER_BASE + "A7.mp3",
        C8: SALAMANDER_BASE + "C8.mp3"
      }
    }).toDestination();
  }
  return globalSampler;
};

interface PianoChordLibraryProps {
  onInjectProgression?: (progression: string[]) => void;
}

export default function PianoChordLibrary({ onInjectProgression }: PianoChordLibraryProps) {
  const [root, setRoot] = useState("C");
  const [quality, setQuality] = useState("maj");
  const [octave, setOctave] = useState(4);
  const [transposeAmount, setTransposeAmount] = useState(0);
  
  const [chordInfo, setChordInfo] = useState<any>(null);
  const [activeNotes, setActiveNotes] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const query = `${root}${quality}`;
      const parsed = Chord.get(query);
      
      if (parsed.empty) {
        setError("Invalid chord parameters");
        setChordInfo(null);
        setActiveNotes([]);
        return;
      }

      setError("");
      setChordInfo(parsed);

      const rootPitched = `${root}${octave}`;
      const absoluteParsed = Chord.getChord(parsed.type, rootPitched);
      setActiveNotes(absoluteParsed.notes);

    } catch (err) {
      setError("Error parsing chord");
    }
  }, [root, quality, octave]);

  // Eagerly initialize the sampler on mount
  useEffect(() => {
     getSampler();
  }, []);

  const playChord = async () => {
    if (activeNotes.length === 0) return;
    await Tone.start();
    const sampler = getSampler();
    Tone.loaded().then(() => {
       const now = Tone.now();
       sampler.triggerAttackRelease(activeNotes, "1n", now);
    });
  };

  const playSingleNote = async (note: string) => {
    await Tone.start();
    const sampler = getSampler();
    Tone.loaded().then(() => {
       sampler.triggerAttackRelease(note, "8n", Tone.now());
    });
  };

  const transpose = (semitones: number) => {
    // Current pitch is root + octave, e.g., C4
    const currentPitch = `${root}${octave}`;
    const newPitch = Note.transpose(currentPitch, Interval.fromSemitones(semitones));
    
    // Note.transpose might return a double flat/sharp. Let's simplify it.
    const simplified = Note.simplify(newPitch);
    const newRoot = simplified.replace(/[0-9-]/g, "");
    const newOct = parseInt(simplified.replace(/[^0-9-]/g, ""), 10);
    
    // Fallback logic to match our ROOTS array exactly
     const matchRoot = ROOTS.find(r => Note.chroma(r) === Note.chroma(newRoot)) || newRoot;
    
    setRoot(matchRoot);
    setTransposeAmount(prev => prev + semitones);
    if (!isNaN(newOct) && newOct >= 1 && newOct <= 6) {
       setOctave(newOct);
    }
  };

  const commonProgression = useMemo(() => {
    const isMinor = quality.includes("m") && !quality.includes("maj");
    if (isMinor) {
      return [
        `${root} minor`, 
        `${Note.transpose(root, "P4")} minor`, 
        `${Note.transpose(root, "P5")} minor`, 
        `${root} minor`
      ];
    } else {
      return [
        `${root} maj`, 
        `${Note.transpose(root, "P4")} maj`, 
        `${Note.transpose(root, "P5")} maj`, 
        `${root} maj`
      ];
    }
  }, [root, quality]);

  const getDynamicInsights = () => {
    const data = CHORD_INSIGHTS[quality];
    if (!data) return null;
    
    const rootName = root.replace(/[0-9-]/g, '');
    const qualityLabel = QUALITIES.find(q => q.value === quality)?.label || quality;
    
    return {
      title: `${rootName} ${qualityLabel}`,
      mood: data.mood,
      usage: data.usage.replace(/^The /g, `The ${rootName} `).replace(/^A /g, `A ${rootName} `),
      relative: data.relative,
      progressions: data.progressions,
      genres: data.genres
    };
  };

  const dynamicInsights = getDynamicInsights();

  return (
    <div className="relative rounded-[3rem] p-[2px] overflow-hidden group shadow-2xl">
      <div className="absolute w-[4000px] h-[4000px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_0deg,rgba(34,197,94,0.3)_0%,rgba(255,255,255,0.9)_50%,rgba(34,197,94,0.3)_100%)] opacity-30 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
      <div className="relative bg-[#0a0a0a]/95 rounded-[calc(3rem-2px)] p-8 backdrop-blur-3xl h-full w-full">
        <div className="flex flex-col md:flex-row gap-12 relative z-10">
          <div className="w-full md:w-1/3 space-y-6">
           <div className="space-y-4 bg-white dark:bg-black/40 p-6 rounded-3xl border border-black/10 dark:border-white/10 shadow-inner">
             <h3 className="text-2xl font-black text-green-400 mb-2">Chord Dictionary</h3>
             <p className="text-zinc-600 dark:text-zinc-400 font-light text-sm">Select any note and quality to map its exact fingerings on the keyboard.</p>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div className="flex-1 group">
                <label className="text-[10px] uppercase tracking-widest text-zinc-600 dark:text-zinc-400 font-bold mb-2 block group-hover:text-green-500 transition-colors">Root Note</label>
                <div className="relative w-full">
                  <select 
                    value={root} 
                    onChange={(e) => { setRoot(e.target.value); setTransposeAmount(0); }}
                    className="w-full bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-green-500 transition-colors hover:border-white/20 cursor-pointer shadow-inner appearance-none"
                  >
                    {ROOTS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                     <ChevronDown className="w-4 h-4 text-zinc-600 dark:text-zinc-400 group-hover:text-green-400 transition-colors" />
                  </div>
                </div>
              </div>
              
              <div className="flex-1 group">
                <label className="text-[10px] uppercase tracking-widest text-zinc-600 dark:text-zinc-400 font-bold mb-2 block group-hover:text-green-500 transition-colors">Quality</label>
                <div className="relative w-full">
                  <select 
                    value={quality} 
                    onChange={(e) => { setQuality(e.target.value); setTransposeAmount(0); }}
                    className="w-full bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-green-500 transition-colors hover:border-white/20 cursor-pointer shadow-inner appearance-none"
                  >
                    {QUALITIES.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                     <ChevronDown className="w-4 h-4 text-zinc-600 dark:text-zinc-400 group-hover:text-green-400 transition-colors" />
                  </div>
                </div>
              </div>
           </div>

           <div className="flex gap-4">
              <div className="flex-1 group">
                <label className="text-[10px] uppercase tracking-widest text-zinc-600 dark:text-zinc-400 font-bold mb-2 block group-hover:text-green-500 transition-colors">Octave</label>
                <div className="flex items-center gap-2 bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl p-1 shadow-inner">
                  <button 
                    onClick={() => setOctave(Math.max(1, octave - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white transition-colors"
                  ><Minus className="w-4 h-4" /></button>
                  <div className="flex-1 text-center font-bold">{octave}</div>
                  <button 
                    onClick={() => setOctave(Math.min(6, octave + 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white transition-colors"
                  ><Plus className="w-4 h-4" /></button>
                </div>
              </div>
              
              <div className="flex-1 group">
                <label className="text-[10px] uppercase tracking-widest text-zinc-600 dark:text-zinc-400 font-bold mb-2 block group-hover:text-green-500 transition-colors">Transpose</label>
                <div className="flex items-center justify-between gap-2 bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl p-1 shadow-inner">
                  <button 
                    onClick={() => transpose(-1)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 font-bold text-sm hover:text-zinc-900 dark:text-white transition-colors"
                  >-1</button>
                  <div className="flex-1 text-center font-bold text-green-400 text-sm">
                    {transposeAmount > 0 ? `+${transposeAmount}` : transposeAmount}
                  </div>
                  <button 
                    onClick={() => transpose(1)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 font-bold text-sm hover:text-zinc-900 dark:text-white transition-colors"
                  >+1</button>
                </div>
              </div>
           </div>

           {error && <p className="text-red-400 text-sm">{error}</p>}

           {chordInfo && !error && (
             <div className="bg-white dark:bg-black/40 rounded-3xl p-6 border border-black/10 dark:border-white/10 space-y-6 shadow-inner transition-all hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                <div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-widest font-bold mb-1">Chord Name</div>
                  <div className="text-xl font-bold text-zinc-900 dark:text-white capitalize">{root} {QUALITIES.find(q => q.value === quality)?.label}</div>
                </div>

                <div>
                   <div className="text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-widest font-bold mb-2">Interval Structure</div>
                   <div className="flex flex-wrap gap-2">
                     {chordInfo.intervals.map((int: string, i: number) => (
                       <div key={i} className="px-3 py-1 bg-white dark:bg-black/50 rounded-full text-xs font-bold text-zinc-900 dark:text-white border border-black/10 dark:border-white/10 shadow-inner">
                         {int}
                       </div>
                     ))}
                   </div>
                </div>

                <button onClick={playChord} className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-black rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg">
                   <Play className="w-5 h-5 fill-black" /> Audition Chord
                </button>
             </div>
           )}

           {onInjectProgression && (
              <div className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-900/20 rounded-3xl border border-green-500/30 mt-4 shadow-[0_0_30px_rgba(34,197,94,0.1)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                   <h4 className="text-sm font-bold text-green-400 mb-4 flex items-center gap-2">
                     <Sparkles className="w-4 h-4" /> AI Quick Generator
                   </h4>
                   <div className="flex flex-wrap gap-2 mb-6">
                      {commonProgression.map((c, i) => (
                        <span key={i} className="px-3 py-1 bg-white dark:bg-black/60 rounded-md text-xs font-bold text-green-100 border border-green-500/20 shadow-inner">{c}</span>
                      ))}
                   </div>
                   <button 
                     onClick={() => onInjectProgression(commonProgression)}
                     className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-black rounded-xl text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                   >
                     Send to Sandbox <ArrowLeftRight className="w-4 h-4" />
                   </button>
                </div>
              </div>
            )}
        </div>

         <div className="w-full md:w-2/3 flex flex-col justify-center items-center bg-white dark:bg-black/40 rounded-[2rem] border border-black/10 dark:border-white/10 p-8 relative overflow-hidden min-h-[600px] shadow-inner">
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/30 via-transparent to-transparent pointer-events-none"></div>
           
           <div className="absolute top-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-zinc-600 dark:text-zinc-400 font-bold flex items-center gap-2 z-10 pointer-events-none opacity-80">
              <Piano className="w-3 h-3" /> Playable Keyboard
           </div>

           <div className="w-full overflow-x-auto pb-4 mb-4 mt-8">
              <PianoKeyboard 
                activeNotes={activeNotes} 
                startOctave={Math.max(1, octave - 1)} 
                octaves={3} 
                onPlayNote={playSingleNote}
              />
           </div>
           
           {chordInfo && !error && (
             <div className="w-full flex flex-col items-center">
               <div className="flex gap-4 text-center mb-6">
                  {activeNotes.map((note, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex flex-col items-center"
                    >
                      <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center text-green-400 font-bold mb-2 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                        {note.replace(/[0-9-]/g, '')}
                      </div>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400 font-bold tracking-widest">OCT {note.replace(/[^0-9-]/g, '')}</span>
                    </motion.div>
                  ))}
               </div>

               {dynamicInsights && (
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="w-full max-w-2xl bg-white dark:bg-black/60 rounded-[2rem] p-8 border border-black/10 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl flex flex-col gap-6 text-left"
                 >
                    <div className="text-center mb-2 pb-6 border-b border-black/10 dark:border-white/10">
                       <h3 className="text-sm font-black text-green-400 tracking-widest uppercase flex items-center justify-center gap-2">
                         <BookOpen className="w-4 h-4" /> Musical Insights for {dynamicInsights.title}
                       </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="group">
                           <h4 className="text-[10px] font-black tracking-widest text-zinc-600 dark:text-zinc-400 uppercase mb-2 group-hover:text-green-500 transition-colors">Associated Mood</h4>
                           <p className="text-sm font-bold text-green-300 bg-green-500/10 inline-block px-3 py-1 rounded-md border border-green-500/20">{dynamicInsights.mood}</p>
                        </div>
                        <div className="group">
                           <h4 className="text-[10px] font-black tracking-widest text-zinc-600 dark:text-zinc-400 uppercase mb-2 group-hover:text-green-500 transition-colors">Musical Usage</h4>
                           <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-light">{dynamicInsights.usage}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-6 md:border-l border-black/10 dark:border-white/10 md:pl-8">
                        <div className="group">
                           <h4 className="text-[10px] font-black tracking-widest text-zinc-600 dark:text-zinc-400 uppercase mb-2 group-hover:text-green-500 transition-colors">Common Progressions</h4>
                           <p className="text-sm font-mono text-zinc-900 dark:text-white bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-black/10 dark:border-white/10">{dynamicInsights.progressions}</p>
                        </div>
                        <div className="group">
                           <h4 className="text-[10px] font-black tracking-widest text-zinc-600 dark:text-zinc-400 uppercase mb-2 group-hover:text-green-500 transition-colors">Relative Scales</h4>
                           <p className="text-sm text-zinc-600 dark:text-zinc-400">{dynamicInsights.relative}</p>
                        </div>
                        <div className="group">
                           <h4 className="text-[10px] font-black tracking-widest text-zinc-600 dark:text-zinc-400 uppercase mb-2 group-hover:text-green-500 transition-colors">Associated Genres</h4>
                           <p className="text-sm text-zinc-600 dark:text-zinc-400">{dynamicInsights.genres}</p>
                        </div>
                      </div>
                    </div>
                 </motion.div>
               )}
             </div>
           )}
        </div>
        
      </div>
    </div>
    </div>
  );
}
