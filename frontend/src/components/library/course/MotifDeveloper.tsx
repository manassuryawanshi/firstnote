"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import * as Tone from "tone";
import { Play } from "lucide-react";
import { getGrandPianoSampler } from "@/lib/audio";

const MOTIFS = [
  { name: "Original Motif", description: "The core idea.", notes: ["C4", "E4", "G4", "C5"], durations: ["8n", "8n", "8n", "4n"], delays: [0, 0.25, 0.5, 0.75] },
  { name: "Transposed", description: "Same shape, moved up.", notes: ["F4", "A4", "C5", "F5"], durations: ["8n", "8n", "8n", "4n"], delays: [0, 0.25, 0.5, 0.75] },
  { name: "Rhythmic Variation", description: "Same notes, different groove.", notes: ["C4", "E4", "G4", "C5"], durations: ["16n", "16n", "4n", "2n"], delays: [0, 0.125, 0.25, 0.75] },
];

export default function MotifDeveloper() {
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

  const playMotif = async (index: number) => {
    if (!synth) return;
    await Tone.start();
    
    setActiveIndex(index);
    const motif = MOTIFS[index];
    const now = Tone.now();

    motif.notes.forEach((note, j) => {
       synth.triggerAttackRelease(note, motif.durations[j], now + motif.delays[j]);
    });

    setTimeout(() => {
      setActiveIndex(null);
    }, 2000);
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 justify-center">
      {MOTIFS.map((motif, index) => {
        const isPlaying = activeIndex === index;
        
        return (
          <div 
            key={motif.name}
            className={`flex-1 relative overflow-hidden rounded-3xl border bg-white dark:bg-black/20 ${isPlaying ? 'border-purple-500 scale-105 shadow-[0_0_30px_rgba(168,85,247,0.2)]' : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:bg-white/5'} p-6 transition-all duration-300 flex flex-col items-center text-center`}
          >
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{motif.name}</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-8 flex-1">{motif.description}</p>

            <button
              onClick={() => playMotif(index)}
              disabled={!isLoaded || activeIndex !== null}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform ${isPlaying ? 'bg-purple-500 text-zinc-900 dark:text-white scale-110' : 'bg-black/5 dark:bg-white/5 text-zinc-900 dark:text-white hover:bg-white/20'}`}
            >
              <Play className="w-6 h-6 fill-current" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
