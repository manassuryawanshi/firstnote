"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface PianoKeyboardProps {
  activeNotes?: string[]; // e.g. ["C4", "E4", "G4"]
  startOctave?: number;
  octaves?: number;
  onPlayNote?: (note: string) => void;
  theme?: "green" | "blue";
}

export default function PianoKeyboard({ 
  activeNotes = [], 
  startOctave = 4, 
  octaves = 2,
  onPlayNote,
  theme = "green"
}: PianoKeyboardProps) {
  
  const [playingNotes, setPlayingNotes] = useState<string[]>([]);
  
  const handlePointerDown = (note: string) => {
    setPlayingNotes(prev => [...prev, note]);
    if (onPlayNote) onPlayNote(note);
  };

  const handlePointerUp = (note: string) => {
    setPlayingNotes(prev => prev.filter(n => n !== note));
  };
  
  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  // Generate the full range of keys based on requested octaves
  const keys = [];
  for (let o = 0; o < octaves; o++) {
    const currentOctave = startOctave + o;
    for (let n = 0; n < NOTES.length; n++) {
      const noteName = NOTES[n];
      const isBlack = noteName.includes('#');
      keys.push({
        note: `${noteName}${currentOctave}`,
        isBlack,
        name: noteName
      });
    }
  }

  // Helper to check if a note is active
  const isActive = (keyNote: string) => {
    // If it's currently being played manually by the user
    if (playingNotes.includes(keyNote)) return true;

    return activeNotes.some(active => {
      if (/[0-9]/.test(active)) return active === keyNote;
      return active === keyNote.replace(/[0-9]/g, '');
    });
  };

  return (
    <div className="relative flex select-none bg-white dark:bg-black p-2 rounded-xl border-b-8 border-x-4 border-t-4 border-zinc-900 shadow-2xl overflow-x-auto">
      {keys.map((key, i) => {
        const active = isActive(key.note);
        
        if (key.isBlack) {
          return (
            <div 
              key={key.note}
              className="relative z-20"
              style={{ width: 0 }} // Black keys don't take up layout space in flex, they float over white keys
            >
               <motion.div 
                 initial={false}
                 style={{ transformOrigin: 'top' }}
                 animate={{ backgroundColor: active ? (theme === 'blue' ? '#06b6d4' : '#22c55e') : '#18181b', scaleY: active ? 0.96 : 1 }}
                 whileHover={{ backgroundColor: active ? (theme === 'blue' ? '#06b6d4' : '#22c55e') : (theme === 'blue' ? '#164e63' : '#14532d') }}
                 className={`absolute -left-3 md:-left-4 w-6 md:w-8 h-20 md:h-24 rounded-b-lg border-2 z-20 shadow-xl flex items-end justify-center pb-2 cursor-pointer
                   ${active ? (theme === 'blue' ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.4)]') : 'border-black'}`}
                 onPointerDown={() => handlePointerDown(key.note)}
                 onPointerUp={() => handlePointerUp(key.note)}
                 onPointerLeave={() => handlePointerUp(key.note)}
               >
                 {active && <span className="text-[10px] font-bold text-black">{key.note}</span>}
               </motion.div>
            </div>
          );
        }

        // White key
        return (
          <motion.div 
            key={key.note}
            initial={false}
            style={{ transformOrigin: 'top' }}
            animate={{ backgroundColor: active ? (theme === 'blue' ? '#67e8f9' : '#86efac') : '#ffffff', scaleY: active ? 0.98 : 1 }}
            whileHover={{ backgroundColor: active ? (theme === 'blue' ? '#67e8f9' : '#86efac') : (theme === 'blue' ? '#cffafe' : '#dcfce7') }}
            className={`w-10 md:w-12 h-32 md:h-40 shrink-0 rounded-b-xl border-x border-b border-zinc-300 flex items-end justify-center pb-4 z-10 cursor-pointer select-none
              ${active ? (theme === 'blue' ? 'shadow-[inset_0_0_20px_rgba(6,182,212,0.5)]' : 'shadow-[inset_0_0_20px_rgba(34,197,94,0.5)]') : ''}
            `}
            onPointerDown={() => handlePointerDown(key.note)}
            onPointerUp={() => handlePointerUp(key.note)}
            onPointerLeave={() => handlePointerUp(key.note)}
          >
             <span className={`text-[10px] font-bold ${active ? (theme === 'blue' ? 'text-cyan-800' : 'text-green-800') : 'text-zinc-600 dark:text-zinc-400'}`}>{key.note}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
