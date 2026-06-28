"use client";

import { useState, useEffect } from "react";
import * as Tone from "tone";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Scale } from "@tonaljs/tonal";
import { getGrandPianoSampler } from "@/lib/audio";

export default function CourseScaleVisualizer() {
  const [synth, setSynth] = useState<Tone.Sampler | null>(null);
  const [root, setRoot] = useState("C");
  const [scaleType, setScaleType] = useState("major"); // major, minor, pentatonic, blues, harmonic minor
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeNoteIndex, setActiveNoteIndex] = useState<number | null>(null);

  useEffect(() => {
    const sampler = getGrandPianoSampler(() => {
      setIsLoaded(true);
    });
    setSynth(sampler);

    return () => {
      sampler.dispose();
    };
  }, []);

  const scaleData = Scale.get(`${root} ${scaleType}`);
  
  // Add octave for playback
  const notes = scaleData.notes.map((n, i) => {
    // Basic logic to handle octave wrapping
    const oct = root.charCodeAt(0) > n.charCodeAt(0) && i > 0 ? 5 : 4;
    return `${n}${oct}`;
  });

  const playScale = async () => {
    if (!synth || notes.length === 0) return;
    await Tone.start();
    const now = Tone.now();
    notes.forEach((note, i) => {
      synth.triggerAttackRelease(note, "8n", now + i * 0.3);
      setTimeout(() => setActiveNoteIndex(i), i * 300);
    });
    // Play root octave at the end
    const lastNoteName = scaleData.notes[0];
    const lastNote = `${lastNoteName}5`;
    synth.triggerAttackRelease(lastNote, "8n", now + notes.length * 0.3);
    
    // Light up all notes briefly at the end to signify completion
    setTimeout(() => setActiveNoteIndex(-1), notes.length * 300);
    setTimeout(() => setActiveNoteIndex(null), notes.length * 300 + 1000);
  };

  return (
    <div className="mt-12 p-8 rounded-3xl bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 flex flex-col relative overflow-hidden">
      <div className="text-center mb-8">
         <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Scale Visualizer</h3>
         <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Select a root note and a scale type to see the formula and hear how it sounds.
         </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center justify-center mb-12">
         {/* Root Selector */}
         <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest text-center">Root</span>
            <div className="flex flex-wrap justify-center max-w-[200px] gap-2">
               {["C", "D", "E", "F", "G", "A", "B"].map(n => (
                  <button 
                     key={n}
                     onClick={() => setRoot(n)}
                     className={`w-10 h-10 rounded-full font-bold transition-all ${root === n ? 'bg-blue-500 text-zinc-900 dark:text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:bg-white/5'}`}
                  >
                     {n}
                  </button>
               ))}
            </div>
         </div>

         {/* Scale Type Selector */}
         <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest text-center">Scale Type</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
               {["major", "minor", "major pentatonic", "minor pentatonic", "blues", "harmonic minor"].map(type => (
                  <button 
                     key={type}
                     onClick={() => setScaleType(type)}
                     className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${scaleType === type ? 'bg-white text-black' : 'bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:bg-white/5'}`}
                  >
                     {type}
                  </button>
               ))}
            </div>
         </div>
      </div>

      {/* Visualizer & Play Controls */}
      <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center">
         <h2 className="text-4xl font-black text-zinc-900 dark:text-white mb-6 capitalize">{scaleData.name} Scale</h2>
         
         <div className="flex flex-wrap justify-center gap-4 mb-8">
            {scaleData.notes.map((note, i) => {
               const isActive = activeNoteIndex === i || activeNoteIndex === -1;
               return (
                  <motion.div 
                     key={i}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="flex flex-col items-center"
                  >
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-2 border transition-all duration-300 ${isActive ? 'bg-blue-500 text-zinc-900 dark:text-white border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.6)] scale-110' : 'bg-black/5 dark:bg-white/5 text-zinc-900 dark:text-white border-white/20'}`}>
                        {note}
                     </div>
                     <span className={`text-xs font-mono transition-colors duration-300 ${isActive ? 'text-blue-400 font-bold' : 'text-zinc-600 dark:text-zinc-400'}`}>{scaleData.intervals[i]}</span>
                  </motion.div>
               );
            })}
         </div>

         <div className="flex gap-4">
            <button 
               onClick={playScale}
               disabled={!isLoaded}
               className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform ${isLoaded ? 'bg-white text-black' : 'bg-white/20 text-zinc-900 dark:text-white/50 cursor-not-allowed'}`}
            >
               <Play className="w-4 h-4" /> Play Scale
            </button>
         </div>
      </div>
    </div>
  );
}
