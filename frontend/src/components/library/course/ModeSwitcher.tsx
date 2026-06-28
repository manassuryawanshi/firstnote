"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import * as Tone from "tone";
import { Play } from "lucide-react";
import { Mode, Interval } from "@tonaljs/tonal";
import { getGrandPianoSampler } from "@/lib/audio";

const MODES = [
  { name: "ionian", aka: "Major", flavor: "Happy, Pure", color: "from-cyan-500/20", borderColor: "border-cyan-500", highlightIdx: -1 },
  { name: "dorian", aka: "Minor, raised 6", flavor: "Funky, Cool", color: "from-teal-500/20", borderColor: "border-teal-500", highlightIdx: 5 }, // 6th note is highlighted
  { name: "phrygian", aka: "Minor, flat 2", flavor: "Spanish, Metal", color: "from-blue-500/20", borderColor: "border-blue-500", highlightIdx: 1 }, // 2nd note
  { name: "lydian", aka: "Major, sharp 4", flavor: "Dreamy, Magical", color: "from-purple-500/20", borderColor: "border-purple-500", highlightIdx: 3 }, // 4th note
  { name: "mixolydian", aka: "Major, flat 7", flavor: "Bluesy, Rock", color: "from-yellow-500/20", borderColor: "border-yellow-500", highlightIdx: 6 }, // 7th note
  { name: "aeolian", aka: "Natural Minor", flavor: "Sad, Epic", color: "from-blue-500/20", borderColor: "border-blue-500", highlightIdx: -1 },
  { name: "locrian", aka: "Half Diminished", flavor: "Chaotic, Evil", color: "from-zinc-500/20", borderColor: "border-zinc-500", highlightIdx: 4 }, // flat 5
];

export default function ModeSwitcher() {
  const [synth, setSynth] = useState<Tone.Sampler | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeModeIdx, setActiveModeIdx] = useState(0);
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

  const playMode = async () => {
    if (!synth) return;
    await Tone.start();
    
    const modeObj = MODES[activeModeIdx];
    // We can use Tone.Frequency to transpose from C4 based on Tonal.js semitones.
    
    const intervals = Mode.get(modeObj.name).intervals;
    const notes = intervals.map(interval => {
      const semitones = Interval.semitones(interval) || 0;
      return Tone.Frequency("C4").transpose(semitones).toNote();
    });
    
    const now = Tone.now();
    notes.forEach((note, i) => {
      synth.triggerAttackRelease(note, "8n", now + i * 0.3);
      setTimeout(() => setActiveNoteIndex(i), i * 300);
    });
    
    // Play the octave
    synth.triggerAttackRelease("C5", "8n", now + notes.length * 0.3);
    
    setTimeout(() => setActiveNoteIndex(-1), notes.length * 300);
    setTimeout(() => setActiveNoteIndex(null), notes.length * 300 + 1000);
  };

  const currentMode = MODES[activeModeIdx];
  const intervals = Mode.get(currentMode.name).intervals;
  
  // Tonal.js Mode doesn't have a direct "notes from root" function, so we manually do it for UI
  const noteLetters = intervals.map(interval => {
    const semitones = Interval.semitones(interval) || 0;
    return Tone.Frequency("C4").transpose(semitones).toNote().replace(/[0-9]/g, '');
  });

  return (
    <div className="w-full flex flex-col md:flex-row gap-8">
      {/* Selector */}
      <div className="flex flex-col gap-2 w-full md:w-64 shrink-0">
         {MODES.map((mode, index) => {
            const isActive = activeModeIdx === index;
            return (
               <button
                  key={mode.name}
                  onClick={() => setActiveModeIdx(index)}
                  className={`flex flex-col items-start p-4 rounded-2xl border transition-all ${isActive ? 'bg-black/5 dark:bg-white/5 ' + mode.borderColor : 'bg-white dark:bg-black/20 border-black/10 dark:border-white/10 hover:bg-black/5 dark:bg-white/5'}`}
               >
                  <div className="capitalize font-bold text-zinc-900 dark:text-white text-lg">{mode.name}</div>
                  <div className="text-xs font-mono text-zinc-600 dark:text-zinc-400 mt-1">{mode.aka}</div>
               </button>
            );
         })}
      </div>

      {/* Visualizer */}
      <div className={`flex-1 rounded-3xl border border-black/10 dark:border-white/10 bg-gradient-to-br ${currentMode.color} to-transparent p-8 flex flex-col items-center justify-center min-h-[400px]`}>
         <h2 className="text-4xl font-black text-zinc-900 dark:text-white capitalize mb-2">{currentMode.name}</h2>
         <p className="text-lg font-mono text-zinc-600 dark:text-zinc-400 mb-12">{currentMode.flavor}</p>

         <div className="flex flex-wrap justify-center gap-4 mb-12">
            {noteLetters.map((note, i) => {
               const isActiveNote = activeNoteIndex === i || activeNoteIndex === -1;
               const isCharacterNote = currentMode.highlightIdx === i;
               
               return (
                  <motion.div 
                     key={i}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="flex flex-col items-center relative"
                  >
                     {isCharacterNote && (
                        <div className="absolute -top-8 text-[10px] font-bold text-zinc-900 dark:text-white bg-white/20 px-2 py-1 rounded-full whitespace-nowrap">Character Note</div>
                     )}
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-2 border transition-all duration-300 
                        ${isActiveNote ? 'bg-white text-black scale-110 shadow-[0_0_20px_rgba(255,255,255,0.5)]' : 
                          isCharacterNote ? 'bg-white/20 text-zinc-900 dark:text-white border-white' : 'bg-white dark:bg-black/30 text-zinc-600 dark:text-zinc-400 border-black/10 dark:border-white/10'}
                     `}>
                        {note}
                     </div>
                     <span className={`text-xs font-mono transition-colors duration-300 ${isActiveNote ? 'text-zinc-900 dark:text-white font-bold' : isCharacterNote ? 'text-zinc-900 dark:text-white' : 'text-zinc-600'}`}>
                        {intervals[i]}
                     </span>
                  </motion.div>
               );
            })}
         </div>

         <button 
            onClick={playMode}
            disabled={!isLoaded || activeNoteIndex !== null}
            className="flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
         >
            <Play className="w-5 h-5 fill-current" /> Play Mode
         </button>
      </div>
    </div>
  );
}
