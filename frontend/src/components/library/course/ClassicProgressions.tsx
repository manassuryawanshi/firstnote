"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import * as Tone from "tone";
import { Play } from "lucide-react";
import { getGrandPianoSampler } from "@/lib/audio";

const PROGRESSIONS = [
  { name: "The Pop Punk", numerals: ["I", "V", "vi", "IV"], chords: ["C", "G", "Am", "F"], description: "High energy, nostalgic." },
  { name: "The Jazz Standard", numerals: ["ii", "V", "I", "I"], chords: ["Dm7", "G7", "Cmaj7", "Cmaj7"], description: "Smooth, resolving, sophisticated." },
  { name: "The 50s Doo-Wop", numerals: ["I", "vi", "IV", "V"], chords: ["C", "Am", "F", "G"], description: "Romantic, classic ballad." }
];

export default function ClassicProgressions() {
  const [synth, setSynth] = useState<Tone.Sampler | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeProgression, setActiveProgression] = useState<number | null>(null);
  const [activeChordIndex, setActiveChordIndex] = useState<number | null>(null);

  useEffect(() => {
    const sampler = getGrandPianoSampler(() => {
      setIsLoaded(true);
    });
    setSynth(sampler);

    return () => {
      sampler.dispose();
    };
  }, []);

  // Hardcode some voicings so they sound like actual progressions instead of blocky root position jumps
  const getVoicing = (chord: string) => {
    const voicings: Record<string, string[]> = {
      "C": ["C3", "G3", "C4", "E4"],
      "G": ["G2", "G3", "B3", "D4"],
      "Am": ["A2", "A3", "C4", "E4"],
      "F": ["F2", "F3", "A3", "C4"],
      "Dm7": ["D3", "A3", "C4", "F4"],
      "G7": ["G2", "F3", "B3", "D4"],
      "Cmaj7": ["C3", "G3", "B3", "E4"],
      "Fmaj7": ["F2", "C3", "E3", "A3"],
      "Em7": ["E2", "B2", "D3", "G3"],
      "E": ["E2", "B2", "E3", "G#3"],
      "Fm": ["F2", "F3", "Ab3", "C4"]
    };
    return voicings[chord] || ["C4", "E4", "G4"];
  };

  const playProgression = async (index: number) => {
    if (!synth) return;
    await Tone.start();
    
    setActiveProgression(index);
    const prog = PROGRESSIONS[index];
    const now = Tone.now();

    prog.chords.forEach((chordName, i) => {
      const voicedNotes = getVoicing(chordName);
      
      // Play chord as an arpeggiated block for a nice musical feel
      voicedNotes.forEach((note, j) => {
         synth.triggerAttackRelease(note, "1n", now + i * 1.5 + j * 0.05);
      });
      
      setTimeout(() => {
         setActiveChordIndex(i);
      }, i * 1500);
    });

    setTimeout(() => {
      setActiveChordIndex(null);
      setActiveProgression(null);
    }, prog.chords.length * 1500 + 500);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {PROGRESSIONS.map((prog, index) => {
        const isPlaying = activeProgression === index;
        
        return (
          <div 
            key={prog.name}
            className={`w-full p-6 rounded-3xl border transition-all duration-300 ${isPlaying ? 'bg-black/5 dark:bg-white/5 border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.05)]' : 'bg-white dark:bg-black/20 border-black/10 dark:border-white/10 hover:bg-black/5 dark:bg-white/5'}`}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
               <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                     {prog.name}
                     {isPlaying && (
                        <span className="flex gap-1">
                           <motion.span animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-emerald-500 rounded-full inline-block" />
                           <motion.span animate={{ height: [4, 16, 4] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }} className="w-1 bg-emerald-500 rounded-full inline-block" />
                           <motion.span animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }} className="w-1 bg-emerald-500 rounded-full inline-block" />
                        </span>
                     )}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{prog.description}</p>
               </div>
               
               <button
                  onClick={() => playProgression(index)}
                  disabled={!isLoaded || activeProgression !== null}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${isPlaying ? 'bg-emerald-500 text-zinc-900 dark:text-white scale-105' : 'bg-white text-black hover:bg-zinc-200'}`}
               >
                  <Play className="w-4 h-4 fill-current" /> {isPlaying ? 'Playing...' : 'Listen'}
               </button>
            </div>

            <div className="grid grid-cols-4 gap-2 md:gap-4">
               {prog.chords.map((chord, i) => {
                  const isChordActive = isPlaying && activeChordIndex === i;
                  return (
                     <div 
                        key={i} 
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${isChordActive ? 'bg-emerald-500/20 border-emerald-500/50 scale-105' : 'bg-black/5 dark:bg-white/5 border-transparent'}`}
                     >
                        <div className={`text-2xl md:text-3xl font-black mb-1 ${isChordActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}>{chord}</div>
                        <div className={`text-xs md:text-sm font-bold tracking-widest ${isChordActive ? 'text-emerald-400' : 'text-zinc-600'}`}>{prog.numerals[i]}</div>
                     </div>
                  );
               })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
