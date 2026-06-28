"use client";

import { useState, useEffect } from "react";
import * as Tone from "tone";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Chord, Note } from "@tonaljs/tonal";
import { getGrandPianoSampler } from "@/lib/audio";

export default function CourseChordBuilder() {
  const [synth, setSynth] = useState<Tone.Sampler | null>(null);
  const [root, setRoot] = useState("C");
  const [chordType, setChordType] = useState("M"); // M, m, dim, M7, m7, 7, maj9, etc.
  const [isLoaded, setIsLoaded] = useState(false);
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

  const chordName = `${root}${chordType === "M" ? "" : chordType}`;
  const chordData = Chord.get(chordName);
  
  // Create voicings in octave 4
  const notes = chordData.notes.map(n => `${n}4`);

  const playChord = async () => {
    if (!synth || notes.length === 0) return;
    await Tone.start();
    synth.triggerAttackRelease(notes, "1m");
    
    setActiveNoteIndex(-1); // -1 signifies all notes active
    setTimeout(() => setActiveNoteIndex(null), 1500);
  };

  const playArpeggio = async () => {
    if (!synth || notes.length === 0) return;
    await Tone.start();
    const now = Tone.now();
    notes.forEach((note, i) => {
      synth.triggerAttackRelease(note, "8n", now + i * 0.3);
      setTimeout(() => setActiveNoteIndex(i), i * 300);
    });
    
    synth.triggerAttackRelease(notes, "2n", now + notes.length * 0.3);
    setTimeout(() => setActiveNoteIndex(-1), notes.length * 300);
    setTimeout(() => setActiveNoteIndex(null), notes.length * 300 + 1500);
  };

  return (
    <div className="mt-12 p-8 rounded-3xl bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 flex flex-col relative overflow-hidden">
      <div className="text-center mb-8">
         <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Chord Builder</h3>
         <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Select a root note and stack thirds to hear how the emotion changes.
         </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center justify-center mb-12">
         {/* Root Selector */}
         <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest text-center">Root</span>
            <div className="flex flex-wrap justify-center max-w-[200px] gap-2">
               {["C", "D", "E", "F", "G", "A", "B"].map(n => (
                  <button 
                     key={n}
                     onClick={() => setRoot(n)}
                     className={`w-10 h-10 rounded-full font-bold transition-all ${root === n ? 'bg-cyan-500 text-zinc-900 dark:text-white shadow-[0_0_15px_rgba(249,115,22,0.5)]' : 'bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:bg-white/5'}`}
                  >
                     {n}
                  </button>
               ))}
            </div>
         </div>

         {/* Quality Selector */}
         <div className="flex flex-col gap-2 flex-1">
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest text-center">Quality & Extensions</span>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
               {/* Triads */}
               <button onClick={() => setChordType("M")} className={`px-2 py-2 rounded-xl text-xs font-bold transition-all ${chordType === "M" ? 'bg-white text-black' : 'bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:bg-white/5'}`}>Maj</button>
               <button onClick={() => setChordType("m")} className={`px-2 py-2 rounded-xl text-xs font-bold transition-all ${chordType === "m" ? 'bg-blue-500 text-zinc-900 dark:text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:bg-white/5'}`}>Min</button>
               <button onClick={() => setChordType("dim")} className={`px-2 py-2 rounded-xl text-xs font-bold transition-all ${chordType === "dim" ? 'bg-blue-500 text-zinc-900 dark:text-white shadow-[0_0_15px_rgba(243,63,63,0.5)]' : 'bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:bg-white/5'}`}>Dim</button>
               
               {/* 7ths */}
               <button onClick={() => setChordType("M7")} className={`px-2 py-2 rounded-xl text-xs font-bold transition-all ${chordType === "M7" ? 'bg-purple-500 text-zinc-900 dark:text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:bg-white/5'}`}>Maj7</button>
               <button onClick={() => setChordType("m7")} className={`px-2 py-2 rounded-xl text-xs font-bold transition-all ${chordType === "m7" ? 'bg-cyan-500 text-zinc-900 dark:text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:bg-white/5'}`}>Min7</button>
               <button onClick={() => setChordType("7")} className={`px-2 py-2 rounded-xl text-xs font-bold transition-all ${chordType === "7" ? 'bg-yellow-500 text-zinc-900 dark:text-white shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:bg-white/5'}`}>Dom7</button>
               
               {/* Sus */}
               <button onClick={() => setChordType("sus2")} className={`px-2 py-2 rounded-xl text-xs font-bold transition-all ${chordType === "sus2" ? 'bg-teal-500 text-zinc-900 dark:text-white shadow-[0_0_15px_rgba(20,184,166,0.5)]' : 'bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:bg-white/5'}`}>Sus2</button>
               <button onClick={() => setChordType("sus4")} className={`px-2 py-2 rounded-xl text-xs font-bold transition-all ${chordType === "sus4" ? 'bg-emerald-500 text-zinc-900 dark:text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:bg-white/5'}`}>Sus4</button>

               {/* Extensions */}
               <button onClick={() => setChordType("9")} className={`px-2 py-2 rounded-xl text-xs font-bold transition-all ${chordType === "9" ? 'bg-cyan-500 text-zinc-900 dark:text-white shadow-[0_0_15px_rgba(249,115,22,0.5)]' : 'bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:bg-white/5'}`}>Dom9</button>
               <button onClick={() => setChordType("11")} className={`px-2 py-2 rounded-xl text-xs font-bold transition-all ${chordType === "11" ? 'bg-pink-500 text-zinc-900 dark:text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]' : 'bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:bg-white/5'}`}>Dom11</button>
               <button onClick={() => setChordType("13")} className={`px-2 py-2 rounded-xl text-xs font-bold transition-all ${chordType === "13" ? 'bg-indigo-500 text-zinc-900 dark:text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:bg-white/5'}`}>Dom13</button>
               <button onClick={() => setChordType("maj9")} className={`px-2 py-2 rounded-xl text-xs font-bold transition-all ${chordType === "maj9" ? 'bg-fuchsia-500 text-zinc-900 dark:text-white shadow-[0_0_15px_rgba(217,70,239,0.5)]' : 'bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:bg-white/5'}`}>Maj9</button>
               <button onClick={() => setChordType("m9")} className={`px-2 py-2 rounded-xl text-xs font-bold transition-all ${chordType === "m9" ? 'bg-sky-500 text-zinc-900 dark:text-white shadow-[0_0_15px_rgba(14,165,233,0.5)]' : 'bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:bg-white/5'}`}>Min9</button>
            </div>
         </div>
      </div>

      {/* Visualizer & Play Controls */}
      <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center">
         <h2 className="text-4xl font-black text-zinc-900 dark:text-white mb-6">{chordData.name}</h2>
         
         <div className="flex flex-wrap justify-center gap-4 mb-8">
            {chordData.notes.map((note, i) => {
               const isActive = activeNoteIndex === i || activeNoteIndex === -1;
               return (
                  <motion.div 
                     key={i}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="flex flex-col items-center"
                  >
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-2 border transition-all duration-300 ${isActive ? 'bg-blue-500 text-zinc-900 dark:text-white border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.6)] scale-110' : 'bg-black/5 dark:bg-white/5 text-zinc-900 dark:text-white border-white/20'}`}>
                        {note}
                     </div>
                     <span className={`text-xs font-mono transition-colors duration-300 ${isActive ? 'text-blue-400 font-bold' : 'text-zinc-600 dark:text-zinc-400'}`}>{chordData.intervals[i]}</span>
                  </motion.div>
               );
            })}
         </div>

         <div className="flex gap-4">
            <button 
               onClick={playChord}
               disabled={!isLoaded}
               className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-transform ${isLoaded ? 'bg-white text-black hover:scale-105' : 'bg-white/20 text-zinc-900 dark:text-white/50 cursor-not-allowed'}`}
            >
               <Play className="w-4 h-4" /> Play Chord
            </button>
            <button 
               onClick={playArpeggio}
               disabled={!isLoaded}
               className={`flex items-center gap-2 px-6 py-3 rounded-full border font-bold transition-colors ${isLoaded ? 'bg-transparent border-white/20 text-zinc-900 dark:text-white hover:bg-black/5 dark:bg-white/5' : 'bg-transparent border-black/10 dark:border-white/10 text-zinc-900 dark:text-white/50 cursor-not-allowed'}`}
            >
               Play Arpeggio
            </button>
         </div>
      </div>
    </div>
  );
}
