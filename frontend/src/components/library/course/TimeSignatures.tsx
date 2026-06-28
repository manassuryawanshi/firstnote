"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Tone from "tone";
import { Play, Square } from "lucide-react";

const TIME_SIGNATURES = [
  { name: "4/4", beats: 4, label: "Common Time" },
  { name: "3/4", beats: 3, label: "Waltz" },
  { name: "5/4", beats: 5, label: "Mission Impossible" },
  { name: "7/8", beats: 7, label: "Complex/Odd" },
];

export default function RhythmTrainer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSignature, setActiveSignature] = useState(TIME_SIGNATURES[0]);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const synthRef = useRef<Tone.MembraneSynth | null>(null);
  const loopRef = useRef<Tone.Sequence | null>(null);

  useEffect(() => {
    // MembraneSynth for a classic metronome "tick/tock" sound
    const synth = new Tone.MembraneSynth({
      pitchDecay: 0.008,
      octaves: 2,
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.01 }
    }).toDestination();
    synth.volume.value = -5;
    synthRef.current = synth;
    setIsLoaded(true);

    return () => {
      if (loopRef.current) loopRef.current.dispose();
      if (synthRef.current) synthRef.current.dispose();
      Tone.Transport.stop();
    };
  }, []);

  const stopPlayback = () => {
    if (loopRef.current) {
      loopRef.current.stop();
      loopRef.current.dispose();
      loopRef.current = null;
    }
    Tone.Transport.stop();
    setIsPlaying(false);
    setCurrentBeat(-1);
  };

  const startPlayback = async (signature: typeof TIME_SIGNATURES[0]) => {
    await Tone.start();
    stopPlayback();
    
    setActiveSignature(signature);
    
    // Set appropriate speed
    // 7/8 is usually played faster since it's 8th notes, so we'll increase BPM for it
    Tone.Transport.bpm.value = signature.name === "7/8" ? 220 : 120;
    
    const steps = Array.from({ length: signature.beats }, (_, i) => i);
    
    const seq = new Tone.Sequence((time, step) => {
      // The first beat (downbeat) is usually accented
      const isDownbeat = step === 0;
      
      // We can change the pitch for the downbeat to make it punchier (classic metronome high 'tick')
      if (synthRef.current) {
        const pitch = isDownbeat ? "C5" : "C4";
        synthRef.current.triggerAttackRelease(pitch, "32n", time);
      }
      
      Tone.Draw.schedule(() => {
        setCurrentBeat(step as number);
      }, time);
      
    }, steps, "4n").start(0);

    loopRef.current = seq;
    Tone.Transport.start();
    setIsPlaying(true);
  };

  return (
    <div className="w-full flex flex-col items-center gap-8">
      <div className="flex flex-wrap justify-center gap-4">
         {TIME_SIGNATURES.map((sig) => {
            const isActive = activeSignature.name === sig.name;
            return (
               <button
                  key={sig.name}
                  onClick={() => {
                     if (isPlaying) {
                        startPlayback(sig);
                     } else {
                        setActiveSignature(sig);
                     }
                  }}
                  className={`flex flex-col items-center px-6 py-3 rounded-2xl border transition-all ${isActive ? 'bg-indigo-500 border-indigo-400 text-zinc-900 dark:text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-105' : 'bg-white dark:bg-black/20 border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:bg-white/5'}`}
               >
                  <span className="text-2xl font-black">{sig.name}</span>
                  <span className="text-xs font-bold tracking-widest uppercase opacity-70">{sig.label}</span>
               </button>
            );
         })}
      </div>

      <div className="w-full max-w-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-8 flex flex-col items-center min-h-[300px] justify-center">
         
         <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-12">
            <AnimatePresence mode="popLayout">
               {Array.from({ length: activeSignature.beats }).map((_, i) => {
                  const isBeatActive = currentBeat === i;
                  const isDownbeat = i === 0;
                  
                  return (
                     <motion.div
                        key={i}
                        layout
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="flex flex-col items-center"
                     >
                        <div 
                           className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-4 flex items-center justify-center transition-all duration-75
                              ${isBeatActive && isDownbeat ? 'bg-indigo-500 border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.8)] scale-125' : 
                                isBeatActive ? 'bg-indigo-500/50 border-indigo-400/80 shadow-[0_0_20px_rgba(99,102,241,0.4)] scale-110' : 
                                'bg-white dark:bg-black/50 border-black/10 dark:border-white/10 text-zinc-600'}
                           `}
                        >
                           <span className={`text-2xl font-black ${isBeatActive ? 'text-zinc-900 dark:text-white' : ''}`}>{i + 1}</span>
                        </div>
                     </motion.div>
                  );
               })}
            </AnimatePresence>
         </div>

         <button
            onClick={() => isPlaying ? stopPlayback() : startPlayback(activeSignature)}
            disabled={!isLoaded}
            className={`flex items-center gap-2 px-10 py-4 rounded-full font-bold transition-all text-lg ${isPlaying ? 'bg-blue-500 text-zinc-900 dark:text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:bg-blue-400' : 'bg-white text-black hover:scale-105'}`}
         >
            {isPlaying ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            {isPlaying ? 'Stop Metronome' : 'Start Metronome'}
         </button>
      </div>
    </div>
  );
}
