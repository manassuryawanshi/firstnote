"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Tone from "tone";
import { Play, Square } from "lucide-react";

export default function SyncopationTrainer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSyncopated, setIsSyncopated] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const snareRef = useRef<Tone.NoiseSynth | null>(null);
  const kickRef = useRef<Tone.MembraneSynth | null>(null);
  const loopRef = useRef<Tone.Sequence | null>(null);

  useEffect(() => {
    const snare = new Tone.NoiseSynth({
      noise: { type: "white" },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0 }
    }).toDestination();
    snare.volume.value = -10;
    snareRef.current = snare;

    const kick = new Tone.MembraneSynth().toDestination();
    kick.volume.value = -5;
    kickRef.current = kick;

    setIsLoaded(true);

    return () => {
      if (loopRef.current) loopRef.current.dispose();
      snare.dispose();
      kick.dispose();
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
    setCurrentStep(-1);
  };

  const startPlayback = async () => {
    await Tone.start();
    stopPlayback();
    
    Tone.Transport.bpm.value = 100;
    
    // We'll use 16th notes for a full bar (16 steps)
    const steps = Array.from({ length: 16 }, (_, i) => i);
    
    const seq = new Tone.Sequence((time, step) => {
      // Basic 4 on the floor kick
      if (step % 4 === 0) {
         kickRef.current?.triggerAttackRelease("C1", "8n", time);
      }

      // Snare pattern
      let playSnare = false;
      let accent = false;

      if (!isSyncopated) {
         // Straight beat: snare on 2 and 4 (steps 4 and 12)
         if (step === 4 || step === 12) {
            playSnare = true;
            accent = true;
         }
      } else {
         // Syncopated beat: snare pushed to offbeats
         // e.g. beat 2.5 (step 6), beat 4 (step 12), and maybe step 9
         if (step === 6 || step === 9 || step === 14) {
            playSnare = true;
            accent = true;
         }
      }

      if (playSnare && snareRef.current) {
         snareRef.current.envelope.decay = accent ? 0.2 : 0.1;
         snareRef.current.triggerAttackRelease("16n", time);
      }
      
      Tone.Draw.schedule(() => {
        setCurrentStep(step as number);
      }, time);
      
    }, steps, "16n").start(0);

    loopRef.current = seq;
    Tone.Transport.start();
    setIsPlaying(true);
  };

  // Re-start if playing and mode changes
  useEffect(() => {
     if (isPlaying) {
        startPlayback();
     }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSyncopated]);

  return (
    <div className="w-full flex flex-col items-center gap-8">
      <div className="flex gap-4">
         <button
            onClick={() => setIsSyncopated(false)}
            className={`px-6 py-3 rounded-2xl border font-bold transition-all ${!isSyncopated ? 'bg-indigo-500 border-indigo-400 text-zinc-900 dark:text-white' : 'bg-white dark:bg-black/20 border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400'}`}
         >
            Straight Beat
         </button>
         <button
            onClick={() => setIsSyncopated(true)}
            className={`px-6 py-3 rounded-2xl border font-bold transition-all ${isSyncopated ? 'bg-blue-500 border-blue-400 text-zinc-900 dark:text-white' : 'bg-white dark:bg-black/20 border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400'}`}
         >
            Syncopated
         </button>
      </div>

      <div className="w-full max-w-3xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center">
         
         <div className="grid grid-cols-8 md:grid-cols-16 gap-1 md:gap-2 mb-12 w-full">
            {Array.from({ length: 16 }).map((_, i) => {
               const isStepActive = currentStep === i;
               const isDownbeat = i % 4 === 0;
               let isSnareHit = false;
               
               if (!isSyncopated && (i === 4 || i === 12)) isSnareHit = true;
               if (isSyncopated && (i === 6 || i === 9 || i === 14)) isSnareHit = true;

               return (
                  <div key={i} className="flex flex-col items-center">
                     <div 
                        className={`w-full h-12 md:h-16 rounded-lg border-2 flex items-center justify-center transition-all duration-75
                           ${isStepActive ? 'bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)] scale-110 z-10' : 
                             isSnareHit ? (isSyncopated ? 'bg-blue-500/50 border-blue-400' : 'bg-indigo-500/50 border-indigo-400') :
                             isDownbeat ? 'bg-black/5 dark:bg-white/5 border-white/20' : 'bg-white dark:bg-black/50 border-transparent'}
                        `}
                     />
                     {isDownbeat && <span className="text-[10px] text-zinc-600 mt-2 font-bold">{Math.floor(i/4) + 1}</span>}
                  </div>
               );
            })}
         </div>

         <button
            onClick={() => isPlaying ? stopPlayback() : startPlayback()}
            disabled={!isLoaded}
            className={`flex items-center gap-2 px-10 py-4 rounded-full font-bold transition-all text-lg ${isPlaying ? 'bg-blue-500 text-zinc-900 dark:text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:bg-blue-400' : 'bg-white text-black hover:scale-105'}`}
         >
            {isPlaying ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            {isPlaying ? 'Stop Groove' : 'Start Groove'}
         </button>
      </div>
    </div>
  );
}
