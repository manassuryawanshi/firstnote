"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const MODES = [
  { name: "Ionian", scale: "Major", formula: "W-W-H-W-W-W-H", vibe: "Happy, Bright, Resolution", useCase: "Pop, Classical", degrees: ["1", "2", "3", "4", "5", "6", "7"] },
  { name: "Dorian", scale: "Minor", formula: "W-H-W-W-W-H-W", vibe: "Jazzy, Soulful, Slightly Dark", useCase: "Jazz, Funk, Blues", degrees: ["1", "2", "b3", "4", "5", "6", "b7"] },
  { name: "Phrygian", scale: "Minor", formula: "H-W-W-W-H-W-W", vibe: "Exotic, Spanish, Tense", useCase: "Flamenco, Metal", degrees: ["1", "b2", "b3", "4", "5", "b6", "b7"] },
  { name: "Lydian", scale: "Major", formula: "W-W-W-H-W-W-H", vibe: "Dreamy, Floating, Cinematic", useCase: "Film Scoring, Sci-Fi", degrees: ["1", "2", "3", "#4", "5", "6", "7"] },
  { name: "Mixolydian", scale: "Major", formula: "W-W-H-W-W-H-W", vibe: "Bluesy, Classic Rock, Unresolved", useCase: "Rock, Blues, Jam Bands", degrees: ["1", "2", "3", "4", "5", "6", "b7"] },
  { name: "Aeolian", scale: "Minor", formula: "W-H-W-W-H-W-W", vibe: "Sad, Melancholy, Epic", useCase: "Rock, Pop, Metal", degrees: ["1", "2", "b3", "4", "5", "b6", "b7"] },
  { name: "Locrian", scale: "Diminished", formula: "H-W-W-H-W-W-W", vibe: "Unstable, Dark, Dissonant", useCase: "Heavy Metal, Avant-Garde", degrees: ["1", "b2", "b3", "4", "b5", "b6", "b7"] },
];

export default function ModesGuide() {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  return (
    <div className="w-full h-full min-h-[500px] flex flex-col md:flex-row gap-8">
      
      {/* Mode List / Navigation */}
      <div className="w-full md:w-1/3 flex flex-col gap-2">
         {MODES.map((mode, i) => {
            const isActive = activeIndex === i;
            return (
               <button
                 key={i}
                 onClick={() => setActiveIndex(i)}
                 className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${isActive ? 'bg-blue-500/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-white dark:bg-black/20 border-black/10 dark:border-white/10 hover:bg-black/5 dark:bg-white/5 hover:border-black/10 dark:border-white/10'}`}
               >
                  <div>
                     <div className={`font-bold text-lg transition-colors ${isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:text-white'}`}>{i + 1}. {mode.name}</div>
                     <div className={`text-xs uppercase tracking-wider mt-1 ${isActive ? 'text-blue-400' : 'text-zinc-600'}`}>{mode.scale}</div>
                  </div>
                  {isActive && (
                     <motion.div layoutId="modeIndicator" className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa]"></motion.div>
                  )}
               </button>
            );
         })}
      </div>

      {/* Mode Details */}
      <div className="w-full md:w-2/3 bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-[2rem] p-8 lg:p-12 shadow-inner relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-duration-500 pointer-events-none"></div>
         
         <motion.div
           key={activeIndex}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.3 }}
           className="relative z-10 h-full flex flex-col"
         >
            <div className="mb-8">
               <div className="flex items-center gap-4 mb-2">
                  <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center border border-blue-500/30">{activeIndex + 1}</span>
                  <h3 className="text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white">{MODES[activeIndex].name}</h3>
               </div>
               <div className="text-zinc-600 dark:text-zinc-400 text-lg">The {activeIndex + 1}{['st', 'nd', 'rd', 'th'][activeIndex > 3 ? 3 : activeIndex]} degree of the Major Scale.</div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-12">
               <div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-widest font-bold mb-2">Vibe / Character</div>
                  <div className="text-xl font-medium text-zinc-900 dark:text-white">{MODES[activeIndex].vibe}</div>
               </div>
               <div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-widest font-bold mb-2">Common Use Case</div>
                  <div className="text-xl font-medium text-zinc-900 dark:text-white">{MODES[activeIndex].useCase}</div>
               </div>
            </div>

            {/* Formula / Degrees Visualizer */}
            <div className="mt-auto">
               <div className="text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-widest font-bold mb-6">Interval Formula</div>
               <div className="flex justify-between items-center bg-white dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-2xl p-6 mb-4">
                  {MODES[activeIndex].degrees.map((deg, i) => {
                     const isAltered = deg.includes('b') || deg.includes('#');
                     return (
                        <div key={i} className="flex flex-col items-center gap-3">
                           <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border ${isAltered ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-black/10 dark:border-white/10 border-zinc-700 text-zinc-900 dark:text-white'}`}>
                              {deg}
                           </div>
                           {i < MODES[activeIndex].degrees.length - 1 && (
                              <div className="text-xs font-bold text-zinc-600 mt-2">
                                 {MODES[activeIndex].formula.split('-')[i]}
                              </div>
                           )}
                        </div>
                     );
                  })}
               </div>
               <div className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div> Highlighted intervals indicate alterations from the major scale.
               </div>
            </div>
         </motion.div>
      </div>

    </div>
  );
}
