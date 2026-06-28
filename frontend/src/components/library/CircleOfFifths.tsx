"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Key } from "@tonaljs/tonal";

const KEYS = [
  { major: "C", minor: "Am", sig: "0" },
  { major: "G", minor: "Em", sig: "1#" },
  { major: "D", minor: "Bm", sig: "2#" },
  { major: "A", minor: "F#m", sig: "3#" },
  { major: "E", minor: "C#m", sig: "4#" },
  { major: "B", minor: "G#m", sig: "5#" },
  { major: "F#", minor: "D#m", sig: "6#" },
  { major: "Db", minor: "Bbm", sig: "5b" },
  { major: "Ab", minor: "Fm", sig: "4b" },
  { major: "Eb", minor: "Cm", sig: "3b" },
  { major: "Bb", minor: "Gm", sig: "2b" },
  { major: "F", minor: "Dm", sig: "1b" },
];

export default function CircleOfFifths() {
  const [activeKey, setActiveKey] = useState<number | null>(null);

  const getDiatonicChords = (index: number) => {
    const root = KEYS[index].major;
    try {
       const keyData = Key.majorKey(root);
       return keyData.chords;
    } catch {
       return [];
    }
  };

  return (
    <div className="w-full h-full min-h-[500px] flex flex-col xl:flex-row items-center justify-center gap-12">
      
      {/* Circle Graphic */}
      <div className="relative w-80 h-80 sm:w-96 sm:h-96 shrink-0">
         {/* Inner guides */}
         <div className="absolute inset-0 rounded-full border border-blue-500/10"></div>
         <div className="absolute inset-8 rounded-full border border-blue-500/10"></div>
         <div className="absolute inset-16 rounded-full border border-blue-500/10"></div>

         {KEYS.map((k, i) => {
           const angle = (i * 30) - 90; // Start C at top (-90 deg)
           const rad = angle * (Math.PI / 180);
           const outerRadius = 160;
           const innerRadius = 110;
           const sigRadius = 200;

           const outerX = Math.cos(rad) * outerRadius;
           const outerY = Math.sin(rad) * outerRadius;

           const innerX = Math.cos(rad) * innerRadius;
           const innerY = Math.sin(rad) * innerRadius;

           const sigX = Math.cos(rad) * sigRadius;
           const sigY = Math.sin(rad) * sigRadius;

           const isActive = activeKey === i;

           return (
             <div key={i} className="absolute top-1/2 left-1/2" style={{ transform: 'translate(-50%, -50%)' }}>
                
                {/* Major Keys (Outer Ring) */}
                <div className="absolute top-1/2 left-1/2" style={{ transform: `translate(${outerX}px, ${outerY}px) translate(-50%, -50%)` }}>
                   <motion.button 
                     onClick={() => setActiveKey(i)}
                     className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${isActive ? 'bg-blue-500 text-zinc-900 dark:text-white shadow-[0_0_20px_#3b82f6] scale-110' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-black/10 dark:border-white/10 hover:border-blue-500 hover:text-zinc-900 dark:text-white hover:bg-blue-500/20'}`}
                     whileHover={{ scale: 1.1 }}
                   >
                     {k.major}
                   </motion.button>
                </div>

                {/* Minor Keys (Inner Ring) */}
                <div className="absolute top-1/2 left-1/2" style={{ transform: `translate(${innerX}px, ${innerY}px) translate(-50%, -50%)` }}>
                   <motion.button 
                     onClick={() => setActiveKey(i)}
                     className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all ${isActive ? 'bg-blue-400 text-black shadow-[0_0_15px_#60a5fa] scale-110' : 'bg-zinc-100 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 border border-black/10 dark:border-white/10 hover:border-blue-400 hover:text-zinc-900 dark:text-white hover:bg-blue-500/10'}`}
                     whileHover={{ scale: 1.1 }}
                   >
                     {k.minor}
                   </motion.button>
                </div>

                {/* Key Signatures (Outer labels) */}
                <div 
                  className={`absolute text-xs font-bold transition-all ${isActive ? 'text-blue-400' : 'text-zinc-600'}`}
                  style={{ transform: `translate(${sigX}px, ${sigY}px) translate(-50%, -50%)` }}
                >
                  {k.sig}
                </div>
             </div>
           );
         })}
         
         {/* Center Logo/Text */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-dashed border-blue-500/30 flex flex-col items-center justify-center p-4 text-center">
            <span className="text-xs text-blue-400/50 uppercase tracking-widest font-bold">Circle of</span>
            <span className="text-xl text-zinc-900 dark:text-white font-black">Fifths</span>
         </div>
      </div>

      {/* Info Panel */}
      <div className="flex-1 w-full bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-[2rem] p-8 shadow-inner min-h-[300px] flex flex-col justify-center relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-duration-500 pointer-events-none"></div>
         
         {activeKey === null ? (
            <div className="text-center text-zinc-600 dark:text-zinc-400">
               <div className="w-16 h-16 rounded-full border border-zinc-700 mx-auto flex items-center justify-center mb-4">?</div>
               <p>Select a key on the circle to explore its relative minor, key signature, and diatonic chords.</p>
            </div>
         ) : (
            <div className="relative z-10">
               <div className="flex items-end gap-4 mb-8">
                  <h3 className="text-6xl font-black text-zinc-900 dark:text-white">{KEYS[activeKey].major}</h3>
                  <div className="mb-2 text-xl font-bold text-blue-400">Major</div>
               </div>

               <div className="flex flex-col sm:flex-row gap-6 mb-8">
                  <div className="flex-1">
                     <div className="text-xs text-zinc-600 dark:text-zinc-400 uppercase font-bold tracking-wider mb-2">Relative Minor</div>
                     <div className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        {KEYS[activeKey].minor} <span className="text-sm font-normal text-zinc-600 dark:text-zinc-400">minor</span>
                     </div>
                  </div>
                  <div className="flex-1">
                     <div className="text-xs text-zinc-600 dark:text-zinc-400 uppercase font-bold tracking-wider mb-2">Key Signature</div>
                     <div className="text-2xl font-bold text-zinc-900 dark:text-white">{KEYS[activeKey].sig}</div>
                  </div>
               </div>

               <div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 uppercase font-bold tracking-wider mb-4">Diatonic Chords</div>
                  <div className="flex flex-wrap gap-3">
                     {getDiatonicChords(activeKey).map((chord, i) => (
                        <div key={i} className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl flex flex-col items-center min-w-[60px]">
                           <span className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">{['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'][i]}</span>
                           <span className="font-bold text-zinc-900 dark:text-white">{chord}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         )}
      </div>

    </div>
  );
}
