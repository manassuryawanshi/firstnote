"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import * as Tone from "tone";
import { Play, Square } from "lucide-react";
import { getGrandPianoSampler } from "@/lib/audio";

const SCALE_NOTES = [
  { note: "C5", name: "C", isChordTone: true },
  { note: "D5", name: "D", isChordTone: false },
  { note: "E5", name: "E", isChordTone: true },
  { note: "F5", name: "F", isChordTone: false },
  { note: "G5", name: "G", isChordTone: true },
  { note: "A5", name: "A", isChordTone: false },
  { note: "B5", name: "B", isChordTone: false },
  { note: "C6", name: "C", isChordTone: true },
];

export default function SongwritingTool() {
  const [synth, setSynth] = useState<Tone.Sampler | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlayingBacking, setIsPlayingBacking] = useState(false);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  
  const loopRef = useRef<Tone.Loop | null>(null);

  useEffect(() => {
    const sampler = getGrandPianoSampler(() => {
      setIsLoaded(true);
    });
    // Boost the melody piano volume slightly
    sampler.volume.value = 5;
    setSynth(sampler);

    return () => {
      if (loopRef.current) {
         loopRef.current.dispose();
      }
      sampler.dispose();
      Tone.Transport.stop();
    };
  }, []);

  const toggleBackingTrack = async () => {
    if (!synth) return;
    await Tone.start();

    if (isPlayingBacking) {
      Tone.Transport.stop();
      if (loopRef.current) {
         (loopRef.current as any).stop();
         (loopRef.current as any).dispose();
         loopRef.current = null;
      }
      setIsPlayingBacking(false);
    } else {
      Tone.Transport.bpm.value = 40; // Very slow so the piano rings out naturally
      
      const loop = new Tone.Loop((time) => {
         // Play the piano chord softly with a long release
         synth.triggerAttackRelease(["C3", "G3", "E4", "B4"], "1m", time, 0.3);
      }, "1m").start(0);
      
      loopRef.current = loop as any;
      Tone.Transport.start();
      setIsPlayingBacking(true);
    }
  };

  const playNote = async (noteObj: { note: string, name: string, isChordTone: boolean }) => {
    if (!synth) return;
    await Tone.start();
    
    // Play slightly louder for melody
    synth.triggerAttackRelease(noteObj.note, "4n", undefined, 1);
    
    setActiveNote(noteObj.note);
    setTimeout(() => {
      setActiveNote(null);
    }, 300);
  };

  return (
    <div className="w-full rounded-3xl border border-black/10 dark:border-white/10 bg-gradient-to-b from-blue-900/20 to-purple-900/20 p-8 flex flex-col items-center">
      <div className="text-center mb-8 max-w-lg">
         <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Melody Sandbox</h3>
         <p className="text-sm text-zinc-600 dark:text-zinc-400">
            1. Start the C Major backing chord.<br/>
            2. Play the <span className="text-blue-400 font-bold">Blue</span> notes (Chord Tones). Notice how stable and peaceful they sound.<br/>
            3. Play the <span className="text-zinc-600 dark:text-zinc-400 font-bold">Gray</span> notes (Passing Tones). Notice the friction and tension they create against the chord!
         </p>
      </div>

      <button
         onClick={toggleBackingTrack}
         disabled={!isLoaded}
         className={`flex items-center gap-2 w-full md:w-auto justify-center px-6 md:px-8 py-3 md:py-4 rounded-full font-bold transition-all text-base md:text-lg mb-12 ${isPlayingBacking ? 'bg-blue-500 text-zinc-900 dark:text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'bg-white text-black hover:scale-105'}`}
      >
         {isPlayingBacking ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
         {isPlayingBacking ? 'Stop Backing Chord' : 'Start Backing Chord'}
      </button>

      <div className="flex flex-nowrap overflow-x-auto w-full justify-start md:justify-center gap-2 md:gap-4 pb-4 px-4 scrollbar-hide">
         {SCALE_NOTES.map((noteObj, i) => {
            const isClicking = activeNote === noteObj.note;
            
            return (
               <button
                  key={i}
                  onPointerDown={() => playNote(noteObj)}
                  className={`
                     relative w-16 h-32 rounded-2xl border flex flex-col justify-end items-center pb-4 transition-all duration-100 select-none
                     ${isClicking ? 'translate-y-2 scale-95 brightness-150' : 'hover:-translate-y-1'}
                     ${noteObj.isChordTone 
                        ? 'bg-blue-500/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                        : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10'}
                  `}
               >
                  <span className={`text-2xl font-black mb-1 ${noteObj.isChordTone ? 'text-blue-400' : 'text-zinc-600 dark:text-zinc-400'}`}>
                     {noteObj.name}
                  </span>
                  {noteObj.isChordTone && <span className="text-[10px] uppercase font-bold tracking-widest text-blue-500/80">Stable</span>}
               </button>
            );
         })}
      </div>
    </div>
  );
}
