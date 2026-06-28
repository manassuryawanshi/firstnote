"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import * as Tone from "tone";
import { Play } from "lucide-react";
import { Chord } from "@tonaljs/tonal";
import { getGrandPianoSampler } from "@/lib/audio";

const CADENCES = [
  { name: "Perfect Cadence", numerals: "V → I", chords: ["G", "C"], type: "The Period", color: "from-blue-500/20 to-cyan-500/20", borderColor: "border-cyan-500" },
  { name: "Plagal Cadence", numerals: "IV → I", chords: ["F", "C"], type: "The Amen", color: "from-emerald-500/20 to-teal-500/20", borderColor: "border-teal-500" },
  { name: "Half Cadence", numerals: "I → V", chords: ["C", "G"], type: "The Comma", color: "from-yellow-500/20 to-cyan-500/20", borderColor: "border-cyan-500" },
  { name: "Deceptive Cadence", numerals: "V → vi", chords: ["G", "Am"], type: "The Plot Twist", color: "from-blue-500/20 to-pink-500/20", borderColor: "border-blue-500" },
];

export default function HarmonyPlayer() {
  const [synth, setSynth] = useState<Tone.Sampler | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeCadence, setActiveCadence] = useState<number | null>(null);
  const [activeChordIndex, setActiveChordIndex] = useState<number | null>(null);

  useEffect(() => {
    const sampler = getGrandPianoSampler(() => {
      setIsLoaded(true);
    });
    setSynth(sampler);

    return () => {
      sampler.dispose();
    };
  }, []);

  const playCadence = async (index: number) => {
    if (!synth) return;
    await Tone.start();
    
    setActiveCadence(index);
    const cadence = CADENCES[index];
    const now = Tone.now();

    cadence.chords.forEach((chordName, i) => {
      // Get notes for the chord. To make it sound like a cadence, we need to voice them nicely.
      // For simplicity, we just add the octave.
      const chordNotes = Chord.get(chordName).notes.map(n => n + (i === 1 && chordName === "C" ? "5" : "4")); 
      // A slightly better voicing:
      // If it's C, play C4 E4 G4 C5
      // If it's F, play F3 A3 C4 F4
      // If it's G, play G3 B3 D4 G4
      // If it's Am, play A3 C4 E4 A4
      
      let voicedNotes: string[] = [];
      if (chordName === "C") voicedNotes = ["C4", "E4", "G4", "C5"];
      if (chordName === "F") voicedNotes = ["F3", "A3", "C4", "F4"];
      if (chordName === "G") voicedNotes = ["G3", "B3", "D4", "G4"];
      if (chordName === "Am") voicedNotes = ["A3", "C4", "E4", "A4"];

      synth.triggerAttackRelease(voicedNotes, "2n", now + i * 1.5);
      
      // Visual feedback
      setTimeout(() => {
         setActiveChordIndex(i);
      }, i * 1500);
    });

    // Reset visual feedback after the cadence finishes
    setTimeout(() => {
      setActiveChordIndex(null);
      setActiveCadence(null);
    }, cadence.chords.length * 1500 + 500);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {CADENCES.map((cadence, index) => {
          const isPlaying = activeCadence === index;
          
          return (
            <div 
              key={cadence.name}
              className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br ${cadence.color} ${isPlaying ? cadence.borderColor : 'border-black/10 dark:border-white/10'} p-6 transition-all duration-300`}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{cadence.name}</h3>
                  <span className="text-sm font-mono text-zinc-600 dark:text-zinc-400">{cadence.type}</span>
                </div>
                <button
                  onClick={() => playCadence(index)}
                  disabled={!isLoaded || activeCadence !== null}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform ${isPlaying ? 'bg-white text-black scale-110 shadow-[0_0_20px_rgba(255,255,255,0.5)]' : 'bg-black/5 dark:bg-white/5 text-zinc-900 dark:text-white hover:bg-white/20'}`}
                >
                  <Play className="w-5 h-5 fill-current" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-4">
                {cadence.chords.map((chord, i) => {
                  const isChordActive = isPlaying && activeChordIndex === i;
                  return (
                    <div key={i} className="flex flex-col items-center flex-1">
                      <div className={`w-full h-24 rounded-2xl border flex items-center justify-center transition-all duration-300 ${isChordActive ? 'bg-white/20 border-white shadow-inner scale-105' : 'bg-white dark:bg-black/20 border-black/10 dark:border-white/10'}`}>
                         <div className="text-center">
                            <div className={`text-3xl font-black mb-1 ${isChordActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}>{chord}</div>
                         </div>
                      </div>
                      <div className="mt-3 text-sm font-bold text-zinc-600 dark:text-zinc-400 tracking-widest">{cadence.numerals.split('→')[i].trim()}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
