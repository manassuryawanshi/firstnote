"use client";

import { useEffect, useState } from "react";
import * as Tone from "tone";
import PianoKeyboard from "@/components/piano/PianoKeyboard";
import { getGrandPianoSampler } from "@/lib/audio";

export default function CourseKeyboard() {
  const [synth, setSynth] = useState<Tone.Sampler | null>(null);

  useEffect(() => {
    const sampler = getGrandPianoSampler();
    setSynth(sampler);

    return () => {
      sampler.dispose();
    };
  }, []);

  const handlePlayNote = async (note: string) => {
    if (!synth) return;
    await Tone.start();
    // Play note with a slight duration
    synth.triggerAttackRelease(note, "8n");
  };

  return (
    <div className="mt-12 p-8 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-black/10 dark:border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
      
      <div className="z-10 text-center mb-8">
         <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Interactive Keyboard</h3>
         <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-md">
            Click the keys to hear the notes. Notice how the black keys sit between the white keys, and how the pattern repeats.
         </p>
      </div>

      <div className="z-10 transform scale-110 md:scale-100">
         <PianoKeyboard 
            startOctave={3} 
            octaves={2} 
            onPlayNote={handlePlayNote} 
            theme="blue"
         />
      </div>
    </div>
  );
}
