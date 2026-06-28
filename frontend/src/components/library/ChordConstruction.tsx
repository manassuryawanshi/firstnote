"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const CHORD_TYPES = [
  { name: "Major Triad", formula: ["1", "3", "5"], intervals: ["Root", "Major 3rd", "Perfect 5th"], notes: ["C", "E", "G"], description: "The foundation of Western harmony. Happy, resolved, and stable." },
  { name: "Minor Triad", formula: ["1", "b3", "5"], intervals: ["Root", "Minor 3rd", "Perfect 5th"], notes: ["C", "Eb", "G"], description: "The sad or serious counterpart to the major triad. Defined by the lowered third." },
  { name: "Diminished Triad", formula: ["1", "b3", "b5"], intervals: ["Root", "Minor 3rd", "Diminished 5th"], notes: ["C", "Eb", "Gb"], description: "Tense and highly dissonant. Wants to resolve inward." },
  { name: "Augmented Triad", formula: ["1", "3", "#5"], intervals: ["Root", "Major 3rd", "Augmented 5th"], notes: ["C", "E", "G#"], description: "Floating, mysterious, and unstable. Wants to resolve outward." },
  { name: "Major 7th", formula: ["1", "3", "5", "7"], intervals: ["Root", "Major 3rd", "Perfect 5th", "Major 7th"], notes: ["C", "E", "G", "B"], description: "Lush, jazzy, and peaceful. The ultimate 'dreamy' chord." },
  { name: "Dominant 7th", formula: ["1", "3", "5", "b7"], intervals: ["Root", "Major 3rd", "Perfect 5th", "Minor 7th"], notes: ["C", "E", "G", "Bb"], description: "Bluesy and tense. The primary chord that pulls you back to the root." },
  { name: "Minor 7th", formula: ["1", "b3", "5", "b7"], intervals: ["Root", "Minor 3rd", "Perfect 5th", "Minor 7th"], notes: ["C", "Eb", "G", "Bb"], description: "Smooth, soulful, and slightly melancholic. Very common in R&B and Jazz." },
  { name: "Major 9th", formula: ["1", "3", "5", "7", "9"], intervals: ["Root", "Major 3rd", "Perfect 5th", "Major 7th", "Major 9th"], notes: ["C", "E", "G", "B", "D"], description: "Extremely rich and colorful. Takes the Major 7th and adds even more depth." },
];

export default function ChordConstruction() {
  const [activeType, setActiveType] = useState<number>(0);

  return (
    <div className="w-full h-full min-h-[500px] flex flex-col items-center">
      
      {/* Formula Blocks Visulizer */}
      <div className="w-full max-w-4xl bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-[2rem] p-12 mb-8 shadow-inner flex flex-col items-center relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-duration-500 pointer-events-none"></div>
         
         <div className="text-center mb-12 relative z-10">
            <h3 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white mb-4">{CHORD_TYPES[activeType].name}</h3>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 font-light max-w-2xl">{CHORD_TYPES[activeType].description}</p>
         </div>

         {/* Visual Block Stack */}
         <div className="flex flex-wrap justify-center gap-4 mb-8 relative z-10">
            {CHORD_TYPES[activeType].formula.map((deg, i) => {
               const isExtension = i > 2; // 7ths, 9ths
               const isAltered = deg.includes('b') || deg.includes('#');
               
               return (
                  <motion.div 
                    key={`${activeType}-${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="flex flex-col items-center gap-4"
                  >
                     <div className={`w-24 h-32 rounded-2xl flex flex-col items-center justify-center border-2 transition-all shadow-xl ${
                        isExtension 
                           ? 'bg-blue-500/20 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
                           : isAltered 
                              ? 'bg-amber-500/20 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                              : 'border-black/10 dark:border-white/10 border-zinc-700'
                     }`}>
                        <div className="text-4xl font-black text-zinc-900 dark:text-white mb-2">{deg}</div>
                        <div className={`text-sm font-bold ${isExtension ? 'text-blue-400' : isAltered ? 'text-amber-400' : 'text-zinc-600 dark:text-zinc-400'}`}>
                           {CHORD_TYPES[activeType].notes[i]}
                        </div>
                     </div>
                     <div className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest text-center w-24">
                        {CHORD_TYPES[activeType].intervals[i]}
                     </div>
                  </motion.div>
               );
            })}
         </div>
         
         <div className="flex gap-6 mt-4">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400"><div className="w-3 h-3 rounded border-black/10 dark:border-white/10 border border-zinc-700"></div> Core Triad Note</div>
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400"><div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/50 shadow-[0_0_5px_#f59e0b]"></div> Altered Note</div>
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400"><div className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/50 shadow-[0_0_5px_#3b82f6]"></div> Extension</div>
         </div>
      </div>

      {/* Selector Grid */}
      <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-4">
         {CHORD_TYPES.map((chord, i) => (
            <button
              key={i}
              onClick={() => setActiveType(i)}
              className={`p-4 rounded-xl border transition-all text-left ${activeType === i ? 'bg-blue-500 text-zinc-900 dark:text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] border-blue-400' : 'bg-white dark:bg-black/30 border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:border-blue-500/50 hover:bg-black/5 dark:bg-white/5'}`}
            >
               <div className="font-bold">{chord.name}</div>
               <div className={`text-xs mt-1 ${activeType === i ? 'text-blue-200' : 'text-zinc-600'}`}>{chord.formula.join(" - ")}</div>
            </button>
         ))}
      </div>

    </div>
  );
}
