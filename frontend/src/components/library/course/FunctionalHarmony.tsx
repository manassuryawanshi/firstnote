"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import * as Tone from "tone";
import { Play } from "lucide-react";
import { getGrandPianoSampler } from "@/lib/audio";

const ROLES = [
  { name: "Tonic (I)", chord: "Cmaj7", role: "The Hero", feeling: "Home, Stable, Safe", color: "from-emerald-500/20 to-teal-500/20", borderColor: "border-emerald-500", notes: ["C3", "G3", "B3", "E4"] },
  { name: "Subdominant (IV)", chord: "Fmaj7", role: "The Journey", feeling: "Wandering, Emotional", color: "from-blue-500/20 to-cyan-500/20", borderColor: "border-blue-500", notes: ["F2", "C3", "E3", "A3"] },
  { name: "Dominant (V)", chord: "G7", role: "The Tension", feeling: "Anxious, Unresolved", color: "from-blue-500/20 to-pink-500/20", borderColor: "border-blue-500", notes: ["G2", "F3", "B3", "D4"] }
];

export default function FunctionalHarmony() {
  const [synth, setSynth] = useState<Tone.Sampler | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const sampler = getGrandPianoSampler(() => {
      setIsLoaded(true);
    });
    setSynth(sampler);

    return () => {
      sampler.dispose();
    };
  }, []);

  const playRole = async (index: number) => {
    if (!synth) return;
    await Tone.start();
    
    setActiveIndex(index);
    const role = ROLES[index];
    const now = Tone.now();

    // Arpeggiate slightly
    role.notes.forEach((note, j) => {
       synth.triggerAttackRelease(note, "1n", now + j * 0.05);
    });

    setTimeout(() => {
      setActiveIndex(null);
    }, 2000);
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 justify-center">
      {ROLES.map((role, index) => {
        const isPlaying = activeIndex === index;
        
        return (
          <div 
            key={role.name}
            className={`flex-1 relative overflow-hidden rounded-3xl border bg-gradient-to-b ${role.color} ${isPlaying ? role.borderColor + ' scale-105 shadow-[0_0_30px_rgba(255,255,255,0.1)]' : 'border-black/10 dark:border-white/10'} p-6 transition-all duration-300 flex flex-col items-center text-center`}
          >
            <div className={`text-3xl font-black mb-2 ${isPlaying ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}>{role.chord}</div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">{role.name}</h3>
            <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest mb-4">{role.role}</span>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-8 flex-1">{role.feeling}</p>

            <button
              onClick={() => playRole(index)}
              disabled={!isLoaded || activeIndex !== null}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform ${isPlaying ? 'bg-white text-black scale-110' : 'bg-black/5 dark:bg-white/5 text-zinc-900 dark:text-white hover:bg-white/20'}`}
            >
              <Play className="w-6 h-6 fill-current" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
