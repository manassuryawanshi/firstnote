"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Tone from "tone";
import { Play } from "lucide-react";
import { getGrandPianoSampler } from "@/lib/audio";

interface IntervalType {
  name: string;
  semitones: number;
  note1: string;
  note2: string;
  emotion: string;
  color: string;
}

const INTERVALS: IntervalType[] = [
  { name: "Perfect Unison", semitones: 0, note1: "C4", note2: "C4", emotion: "Identical, singular", color: "border-zinc-500 text-zinc-600 dark:text-zinc-400" },
  { name: "Minor 2nd", semitones: 1, note1: "C4", note2: "C#4", emotion: "Tense, creepy (Jaws)", color: "border-red-500 text-red-400" },
  { name: "Major 2nd", semitones: 2, note1: "C4", note2: "D4", emotion: "Warm, starting step", color: "border-cyan-400 text-cyan-300" },
  { name: "Minor 3rd", semitones: 3, note1: "C4", note2: "D#4", emotion: "Sad, melancholic", color: "border-blue-500 text-blue-400" },
  { name: "Major 3rd", semitones: 4, note1: "C4", note2: "E4", emotion: "Happy, bright", color: "border-cyan-500 text-cyan-400" },
  { name: "Perfect 4th", semitones: 5, note1: "C4", note2: "F4", emotion: "Heroic (Star Wars)", color: "border-cyan-500 text-cyan-400" },
  { name: "Tritone", semitones: 6, note1: "C4", note2: "F#4", emotion: "Violently dissonant", color: "border-blue-600 text-blue-500" },
  { name: "Perfect 5th", semitones: 7, note1: "C4", note2: "G4", emotion: "Stable, solid (Power Chord)", color: "border-green-500 text-green-400" },
  { name: "Minor 6th", semitones: 8, note1: "C4", note2: "G#4", emotion: "Romantic, tragic", color: "border-pink-500 text-pink-400" },
  { name: "Major 6th", semitones: 9, note1: "C4", note2: "A4", emotion: "Nostalgic, warm", color: "border-yellow-500 text-yellow-400" },
  { name: "Minor 7th", semitones: 10, note1: "C4", note2: "A#4", emotion: "Cool, funky, unresolved", color: "border-indigo-500 text-indigo-400" },
  { name: "Major 7th", semitones: 11, note1: "C4", note2: "B4", emotion: "Dreamy, floating", color: "border-purple-500 text-purple-400" },
  { name: "Perfect Octave", semitones: 12, note1: "C4", note2: "C5", emotion: "Complete resolution", color: "border-emerald-500 text-emerald-400" },
];

export default function IntervalVisualizer() {
  const [synth, setSynth] = useState<Tone.Sampler | null>(null);
  const [activeInterval, setActiveInterval] = useState<IntervalType | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const sampler = getGrandPianoSampler(() => {
      setIsLoaded(true);
    });
    
    setSynth(sampler);

    return () => {
      sampler.dispose();
    };
  }, []);

  const playInterval = async (interval: IntervalType) => {
    if (!synth || isPlaying) return;
    setIsPlaying(true);
    setActiveInterval(interval);
    
    await Tone.start();
    
    // Play notes sequentially then together
    const now = Tone.now();
    synth.triggerAttackRelease(interval.note1, "4n", now);
    synth.triggerAttackRelease(interval.note2, "4n", now + 0.5);
    synth.triggerAttackRelease([interval.note1, interval.note2], "2n", now + 1.2);
    
    setTimeout(() => {
      setIsPlaying(false);
    }, 2500);
  };

  return (
    <div className="mt-12 p-8 rounded-3xl bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 flex flex-col relative overflow-hidden">
      <div className="text-center mb-8">
         <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Interval Trainer</h3>
         <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Click an interval to hear the distance between the two notes. Listen for the specific emotion it creates.
         </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
         {INTERVALS.map(interval => (
            <button
               key={interval.name}
               disabled={isPlaying || !isLoaded}
               onClick={() => playInterval(interval)}
               className={`relative p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 group
                 ${activeInterval?.name === interval.name ? 'bg-black/5 dark:bg-white/5 ' + interval.color : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/5 dark:bg-white/5 text-zinc-900 dark:text-white'}
                 ${isPlaying || !isLoaded ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
               `}
            >
               <Play className={`w-6 h-6 transition-transform group-hover:scale-110 ${activeInterval?.name === interval.name ? '' : 'text-zinc-600 dark:text-zinc-400'}`} />
               <span className="font-bold">{interval.name}</span>
               <span className="text-xs text-zinc-600 dark:text-zinc-400 text-center">{interval.emotion}</span>
            </button>
         ))}
      </div>

      {/* Visualizer Area */}
      <div className="h-32 bg-white dark:bg-black/50 rounded-2xl border border-black/10 dark:border-white/10 flex items-center justify-center relative overflow-hidden">
         <AnimatePresence mode="wait">
            {activeInterval ? (
               <motion.div 
                  key={activeInterval.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center"
               >
                  <div className="flex items-center gap-8 text-3xl font-black mb-2">
                     <span className="text-zinc-900 dark:text-white">{activeInterval.note1.replace(/[0-9]/, '')}</span>
                     <div className="flex flex-col items-center">
                        <div className={`h-1 w-24 rounded-full bg-current ${activeInterval.color.split(' ')[1]}`}></div>
                        <span className={`text-sm mt-1 font-mono ${activeInterval.color.split(' ')[1]}`}>
                           {activeInterval.semitones} steps
                        </span>
                     </div>
                     <span className="text-zinc-900 dark:text-white">{activeInterval.note2.replace(/[0-9]/, '')}</span>
                  </div>
               </motion.div>
            ) : (
               <motion.span 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="text-zinc-600 font-mono"
               >
                  Waiting for interval...
               </motion.span>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
}
