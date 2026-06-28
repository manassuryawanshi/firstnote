"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import * as Tone from "tone";
import { Play } from "lucide-react";
import { getGrandPianoSampler } from "@/lib/audio";
import { Chord } from "@tonaljs/tonal";

const EXAMPLES = [
  {
    name: "The Minor IV",
    description: "The most famous borrowed chord in history. You play the happy IV chord (F Major) and then immediately turn it into a sad minor chord (F Minor) before resolving home. It forces a massive feeling of heartbreak and nostalgia.",
    normal: {
      name: "Standard Progression",
      chords: ["C", "Am", "F", "G"],
    },
    borrowed: {
      name: "With Modal Interchange",
      chords: ["C", "Am", "F", "Fm"],
    }
  },
  {
    name: "The Mario Cadence (bVI - bVII - I)",
    description: "Extremely common in Nintendo soundtracks and epic rock anthems. You borrow the VI and VII chords from the minor key to create an incredibly powerful, ascending staircase of triumph.",
    normal: {
      name: "Standard Progression",
      chords: ["C", "F", "G", "C"],
    },
    borrowed: {
      name: "With Modal Interchange",
      chords: ["C", "Ab", "Bb", "C"],
    }
  },
  {
    name: "Secondary Dominant",
    description: "A secondary dominant temporarily treats a chord other than the tonic as the 'home' chord. For example, instead of moving directly from C to Dm, you slip an A7 in between. A7 is the dominant (V) of Dm, making the resolution incredibly satisfying.",
    normal: {
      name: "Standard Diatonic",
      chords: ["C", "Em", "Dm", "G"],
    },
    borrowed: {
      name: "With Secondary Dominant (V/ii)",
      chords: ["C", "A7", "Dm", "G"],
    }
  },
  {
    name: "Tritone Substitution",
    description: "A classic jazz trick. Instead of playing a standard V7 chord (G7), you replace it with a dominant chord exactly a tritone away (Db7). This creates a buttery smooth chromatic bassline down to the tonic (C).",
    normal: {
      name: "Standard V-I Resolution",
      chords: ["Cmaj7", "Dm7", "G7", "Cmaj7"],
    },
    borrowed: {
      name: "With Tritone Sub (subV7)",
      chords: ["Cmaj7", "Dm7", "Db7", "Cmaj7"],
    }
  },
  {
    name: "Chromatic Mediant",
    description: "Moving a major or minor third away while keeping the same chord quality (e.g., Major to Major). It breaks the rules of the key signature and is used heavily in film scoring to sound suddenly 'magical' or 'alien'.",
    normal: {
      name: "Diatonic Mediant",
      chords: ["C", "Am", "F", "G"],
    },
    borrowed: {
      name: "Chromatic Mediant",
      chords: ["C", "E", "Ab", "G"],
    }
  },
  {
    name: "Neapolitan Sixth",
    description: "A major chord built on the lowered second scale degree (Db Major in the key of C). It's incredibly dramatic, dark, and classically romantic, often used right before the dominant chord.",
    normal: {
      name: "Standard Pre-Dominant",
      chords: ["Cm", "Fm", "G7", "Cm"],
    },
    borrowed: {
      name: "With Neapolitan (bII)",
      chords: ["Cm", "Db", "G7", "Cm"],
    }
  },
  {
    name: "Picardy Third",
    description: "A classical technique where a song in a minor key suddenly ends on a major tonic chord. It provides a massive, uplifting surprise of 'light at the end of the tunnel'.",
    normal: {
      name: "Standard Minor Ending",
      chords: ["Cm", "Fm", "G", "Cm"],
    },
    borrowed: {
      name: "With Picardy Third",
      chords: ["Cm", "Fm", "G", "C"],
    }
  }
];

export default function BorrowedChords() {
  const [synth, setSynth] = useState<Tone.Sampler | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeExample, setActiveExample] = useState(0);
  const [playingProgression, setPlayingProgression] = useState<"normal" | "borrowed" | null>(null);
  const [activeChordIndex, setActiveChordIndex] = useState<number | null>(null);

  useEffect(() => {
    const sampler = getGrandPianoSampler(() => setIsLoaded(true));
    setSynth(sampler);
    return () => {
      sampler.dispose();
      Tone.Transport.stop();
    };
  }, []);

  const playProgression = async (type: "normal" | "borrowed") => {
    if (!synth || playingProgression) return;
    await Tone.start();
    
    setPlayingProgression(type);
    const chords = EXAMPLES[activeExample][type].chords;
    const now = Tone.now();

    chords.forEach((chordName, i) => {
      const chord = Chord.get(chordName);
      // Construct voicings (basic triads with octave bass)
      const rootNote = `${chord.notes[0]}2`; // bass note
      const upperNotes = chord.notes.map((n, idx) => {
         const oct = n.charCodeAt(0) < chord.notes[0].charCodeAt(0) && idx > 0 ? 4 : 3;
         return `${n}${oct}`;
      });
      
      const allNotes = [rootNote, ...upperNotes];

      // Schedule audio
      synth.triggerAttackRelease(allNotes, "2n", now + i);
      
      // Schedule visual update
      setTimeout(() => {
        setActiveChordIndex(i);
      }, i * 1000);
    });

    // Reset visuals after it finishes playing
    setTimeout(() => {
      setActiveChordIndex(null);
      setPlayingProgression(null);
    }, chords.length * 1000 + 500);
  };

  const currentExample = EXAMPLES[activeExample];

  return (
    <div className="mt-12 w-full p-8 rounded-3xl bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 flex flex-col items-center">
      
      <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-5xl">
         {EXAMPLES.map((ex, i) => (
            <button
               key={i}
               onClick={() => {
                  if (!playingProgression) {
                     setActiveExample(i);
                  }
               }}
               className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeExample === i ? 'bg-teal-500 text-zinc-900 dark:text-white shadow-[0_0_15px_rgba(20,184,166,0.5)]' : 'bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:bg-white/5'}`}
            >
               {ex.name}
            </button>
         ))}
      </div>

      <div className="text-center max-w-2xl mb-10">
         <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">{currentExample.description}</p>
      </div>

      <div className="w-full flex flex-col xl:flex-row gap-8 justify-center">
         
         {/* Normal Progression */}
         <div className="flex-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center">
            <h4 className="text-zinc-900 dark:text-white font-bold mb-6 min-h-[3rem] flex items-center justify-center text-center">{currentExample.normal.name}</h4>
            <div className="flex gap-2 lg:gap-3 w-full justify-center mb-8">
               {currentExample.normal.chords.map((chord, i) => {
                  const isActive = playingProgression === "normal" && activeChordIndex === i;
                  return (
                     <div 
                        key={i}
                        className={`flex-none aspect-square w-12 sm:w-14 lg:w-16 rounded-xl flex items-center justify-center text-xs sm:text-sm font-black transition-all duration-300 ${isActive ? 'bg-white text-black scale-105 shadow-[0_0_20px_rgba(255,255,255,0.5)]' : 'bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400'}`}
                     >
                        {chord}
                     </div>
                  );
               })}
            </div>
            <button 
               onClick={() => playProgression("normal")}
               disabled={!isLoaded || !!playingProgression}
               className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${!playingProgression && isLoaded ? 'bg-black/5 dark:bg-white/5 text-zinc-900 dark:text-white hover:bg-white/20' : 'opacity-50 cursor-not-allowed text-zinc-600 dark:text-zinc-400'}`}
            >
               <Play className="w-4 h-4 fill-current" /> Play Standard
            </button>
         </div>

         {/* Borrowed Progression */}
         <div className="flex-1 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 flex flex-col items-center">
            <h4 className="text-blue-400 font-bold mb-6 min-h-[3rem] flex items-center justify-center text-center">{currentExample.borrowed.name}</h4>
            <div className="flex gap-2 lg:gap-3 w-full justify-center mb-8">
               {currentExample.borrowed.chords.map((chord, i) => {
                  const isActive = playingProgression === "borrowed" && activeChordIndex === i;
                  const isTheBorrowedChord = !currentExample.normal.chords.includes(chord) || chord === "C" && i === 3 && currentExample.name === "Picardy Third"; // Simple highlight

                  let bgClass = "bg-white dark:bg-black/50 border border-blue-500/20 text-blue-900/50";
                  if (isActive) {
                     bgClass = "bg-blue-500 text-zinc-900 dark:text-white scale-105 shadow-[0_0_20px_rgba(244,63,94,0.6)]";
                  } else if (isTheBorrowedChord) {
                     bgClass = "bg-white dark:bg-black/50 border-2 border-blue-500/50 text-blue-400";
                  }

                  return (
                     <div 
                        key={i}
                        className={`flex-none aspect-square w-12 sm:w-14 lg:w-16 rounded-xl flex items-center justify-center text-xs sm:text-sm font-black transition-all duration-300 ${bgClass}`}
                     >
                        {chord}
                     </div>
                  );
               })}
            </div>
            <button 
               onClick={() => playProgression("borrowed")}
               disabled={!isLoaded || !!playingProgression}
               className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${!playingProgression && isLoaded ? 'bg-blue-500 text-zinc-900 dark:text-white hover:bg-blue-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'opacity-50 cursor-not-allowed bg-blue-900/20 text-blue-900/50'}`}
            >
               <Play className="w-4 h-4 fill-current" /> Play Borrowed
            </button>
         </div>

      </div>
    </div>
  );
}
