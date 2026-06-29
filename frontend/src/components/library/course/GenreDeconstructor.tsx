"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Tone from "tone";
import { Play, Square } from "lucide-react";
import { getGrandPianoSampler } from "@/lib/audio";
import { Chord } from "@tonaljs/tonal";

const GENRES = [
  {
    id: "lofi",
    name: "Lo-Fi Hip Hop",
    description: "Built heavily on Major 7th and Minor 7th chords with a slow, deeply swung beat. Chords are usually played slightly behind the beat to create a 'lazy' feel.",
    bpm: 75,
    chords: [
      { name: "Cmaj7", beat: 0, duration: "2n" },
      { name: "Am7", beat: 2, duration: "2n" },
      { name: "Dm7", beat: 4, duration: "2n" },
      { name: "G7", beat: 6, duration: "2n" }
    ],
    kickPattern: [0, 2.5, 4, 5.5],
    snarePattern: [1, 3, 5, 7],
    hihatPattern: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5]
  },
  {
    id: "synthwave",
    name: "Synthwave",
    description: "Relies heavily on Natural Minor scales and the Minor IV chord. The drums are a relentless 'Four on the Floor' driving beat with heavily gated snares.",
    bpm: 110,
    chords: [
      { name: "Am", beat: 0, duration: "2n" },
      { name: "F", beat: 2, duration: "2n" },
      { name: "G", beat: 4, duration: "2n" },
      { name: "Em", beat: 6, duration: "2n" }
    ],
    kickPattern: [0, 1, 2, 3, 4, 5, 6, 7],
    snarePattern: [1, 3, 5, 7],
    hihatPattern: [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5]
  },
  {
    id: "poppunk",
    name: "Pop Punk",
    description: "Fast, energetic, and built almost entirely on the I-V-vi-IV progression using 'Power Chords' (just the root and 5th, no 3rd).",
    bpm: 160,
    chords: [
      { name: "C5", beat: 0, duration: "2n" },
      { name: "G5", beat: 2, duration: "2n" },
      { name: "A5", beat: 4, duration: "2n" },
      { name: "F5", beat: 6, duration: "2n" }
    ],
    kickPattern: [0, 1.5, 3, 4, 5.5, 7],
    snarePattern: [1, 3, 5, 7],
    hihatPattern: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5]
  },
  {
    id: "neosoul",
    name: "Neo-Soul",
    description: "Complex, jazz-infused harmony using extended chords (9ths, 11ths, 13ths) paired with a Dilla-style organic, laid-back drum groove.",
    bpm: 85,
    chords: [
      { name: "Cmaj9", beat: 0, duration: "2n" },
      { name: "E7#9", beat: 2, duration: "2n" },
      { name: "Am11", beat: 4, duration: "2n" },
      { name: "Fmaj7", beat: 6, duration: "2n" }
    ],
    kickPattern: [0, 1.5, 2.5, 4, 5.5],
    snarePattern: [1, 3, 5, 7],
    hihatPattern: [0, 1, 2, 3, 4, 5, 6, 7]
  },
  {
    id: "edm",
    name: "Modern EDM",
    description: "Built for the club. Four-on-the-floor kick drum, off-beat hi-hats, and massive minor chord stabs that syncopate with the rhythm.",
    bpm: 128,
    chords: [
      { name: "Am", beat: 0.5, duration: "4n" },
      { name: "F", beat: 2.5, duration: "4n" },
      { name: "C", beat: 4.5, duration: "4n" },
      { name: "G", beat: 6.5, duration: "4n" }
    ],
    kickPattern: [0, 1, 2, 3, 4, 5, 6, 7],
    snarePattern: [1, 3, 5, 7],
    hihatPattern: [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5]
  },
  {
    id: "reggae",
    name: "Reggae",
    description: "Characterized by the 'One Drop' drum rhythm (kick on the 3rd beat) and 'Skank' guitar/keys chords played strictly on the off-beats.",
    bpm: 75,
    chords: [
      { name: "C", beat: 0.5, duration: "8n" },
      { name: "G", beat: 2.5, duration: "8n" },
      { name: "Am", beat: 4.5, duration: "8n" },
      { name: "F", beat: 6.5, duration: "8n" }
    ],
    kickPattern: [1, 5], // Beat 2 and 4 in half-time feel
    snarePattern: [1, 5],
    hihatPattern: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5]
  },
  {
    id: "trap",
    name: "Dark Trap",
    description: "Ominous minor chords, incredibly fast hi-hat rolls, and heavily syncopated, booming 808 kick patterns.",
    bpm: 140,
    chords: [
      { name: "Am", beat: 0, duration: "2n" },
      { name: "F", beat: 2, duration: "2n" },
      { name: "E", beat: 4, duration: "2n" },
      { name: "Am", beat: 6, duration: "2n" }
    ],
    kickPattern: [0, 1.5, 4, 5.5, 6.5],
    snarePattern: [2, 6], // Snare on beat 3
    hihatPattern: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4, 4.25, 4.5, 4.75, 5, 5.25, 5.5, 5.75, 6, 6.25, 6.5, 6.75, 7, 7.25, 7.5, 7.75]
  },
  {
    id: "jazz",
    name: "Jazz (ii-V-I)",
    description: "The most famous progression in Jazz: The 'ii-V-I'. Driven by a swung ride cymbal pattern and resolving tension using a dominant chord with altered extensions.",
    bpm: 120,
    chords: [
      { name: "Dm7", beat: 0, duration: "2n" },
      { name: "G7", beat: 2, duration: "2n" },
      { name: "Cmaj7", beat: 4, duration: "2n" },
      { name: "A7b9", beat: 6, duration: "2n" }
    ],
    kickPattern: [0, 4],
    snarePattern: [1.5, 5.5], // comping
    hihatPattern: [0, 0.66, 1, 2, 2.66, 3, 4, 4.66, 5, 6, 6.66, 7] // swing pattern approximation
  }
];

export default function GenreDeconstructor() {
  const [synth, setSynth] = useState<Tone.Sampler | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeGenre, setActiveGenre] = useState(GENRES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);

  const loopRef = useRef<Tone.Sequence | null>(null);
  const kickRef = useRef<Tone.MembraneSynth | null>(null);
  const snareRef = useRef<Tone.NoiseSynth | null>(null);
  const hihatRef = useRef<Tone.MetalSynth | null>(null);

  useEffect(() => {
    const sampler = getGrandPianoSampler(() => setIsLoaded(true));
    setSynth(sampler);

    kickRef.current = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.1 }
    }).toDestination();
    kickRef.current.volume.value = 5;

    snareRef.current = new Tone.NoiseSynth({
      noise: { type: "white" },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0 }
    }).toDestination();
    snareRef.current.volume.value = -5;

    hihatRef.current = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5
    }).toDestination();
    hihatRef.current.volume.value = -15;

    return () => {
      sampler.dispose();
      kickRef.current?.dispose();
      snareRef.current?.dispose();
      hihatRef.current?.dispose();
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

  const startPlayback = async (genre: typeof GENRES[0]) => {
    await Tone.start();
    stopPlayback();
    
    setActiveGenre(genre);
    Tone.Transport.bpm.value = genre.bpm;
    
    // Increase subdivision to 32nd notes for trap
    const steps = Array.from({ length: 32 }, (_, i) => i / 4); // [0, 0.25, 0.5, ... 7.75]

    const seq = new Tone.Sequence((time, step) => {
      Tone.Draw.schedule(() => setCurrentBeat(step as number), time);

      // Play Kick
      if (genre.kickPattern.includes(step as number) && kickRef.current) {
        kickRef.current.triggerAttackRelease("C1", "8n", time);
      }

      // Play Snare
      if (genre.snarePattern.includes(step as number) && snareRef.current) {
        snareRef.current.triggerAttackRelease("16n", time);
      }

      // Play HiHat
      if (genre.hihatPattern.includes(step as number) && hihatRef.current) {
        hihatRef.current.triggerAttackRelease("32n", time);
      }

      // Play Chords (only trigger when step matches exactly)
      const chordData = genre.chords.find(c => Math.abs(c.beat - (step as number)) < 0.01);
      if (chordData && synth) {
        let chord;
        // Handle Power Chords
        if (chordData.name.endsWith('5')) {
           const rootStr = chordData.name.replace('5', '');
           chord = { notes: [rootStr, Tone.Frequency(rootStr + "4").transpose(7).toNote().replace(/\d+/, '')] };
        } else {
           chord = Chord.get(chordData.name);
        }
        
        const rootNote = `${chord.notes[0]}2`; 
        const upperNotes = chord.notes.map((n, idx) => {
           const oct = n.charCodeAt(0) < chord.notes[0].charCodeAt(0) && idx > 0 ? 4 : 3;
           return `${n}${oct}`;
        });
        synth.triggerAttackRelease([rootNote, ...upperNotes], chordData.duration, time);
      }

    }, steps, "16n").start(0);

    loopRef.current = seq;
    Tone.Transport.start();
    setIsPlaying(true);
  };

  return (
    <div className="mt-12 w-full p-8 rounded-3xl bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 flex flex-col items-center">
      
      <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-4xl">
         {GENRES.map((g) => {
            const isActive = activeGenre.id === g.id;
            return (
               <button
                  key={g.id}
                  onClick={() => {
                     if (isPlaying) {
                        startPlayback(g);
                     } else {
                        setActiveGenre(g);
                     }
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${isActive ? 'bg-fuchsia-500 text-zinc-900 dark:text-white shadow-[0_0_15px_rgba(217,70,239,0.5)]' : 'bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:bg-white/5'}`}
               >
                  {g.name}
               </button>
            );
         })}
      </div>

      <div className="text-center max-w-2xl mb-10 min-h-[80px]">
         <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">{activeGenre.description}</p>
      </div>

      <div className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-8 flex flex-col items-center">
         
         <div className="flex flex-nowrap w-full justify-start md:justify-center mb-10 py-6 px-4 gap-2 md:gap-4 overflow-x-auto">
            {activeGenre.chords.map((chord, i) => {
               // The chord is active if currentBeat is between this chord's beat and the next chord's beat
               // Since our chords are equally spaced (every 2 beats roughly), check within [beat, beat+1.9]
               const isActive = currentBeat >= chord.beat && currentBeat < chord.beat + 1.9;
               
               return (
                  <div 
                     key={i}
                     className={`flex-none w-16 h-16 md:w-20 md:h-20 rounded-2xl flex flex-col items-center justify-center transition-all duration-150 border-2 z-10
                        ${isActive ? 'bg-fuchsia-500 border-fuchsia-400 text-zinc-900 dark:text-white shadow-[0_0_30px_rgba(217,70,239,0.5)] scale-110 z-20 relative' : 'bg-white dark:bg-black/80 border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400'}`}
                  >
                     <span className="text-lg md:text-xl font-black truncate px-1 max-w-full">{chord.name}</span>
                  </div>
               );
            })}
         </div>

         <button
            onClick={() => isPlaying ? stopPlayback() : startPlayback(activeGenre)}
            disabled={!isLoaded}
            className={`flex items-center gap-3 w-full md:w-auto justify-center px-6 md:px-10 py-3 md:py-4 rounded-full font-bold transition-all text-base md:text-lg ${isPlaying ? 'bg-blue-500 text-zinc-900 dark:text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:bg-blue-400' : 'bg-white text-black hover:scale-105'}`}
         >
            {isPlaying ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            {isPlaying ? `Stop ${activeGenre.name}` : `Play ${activeGenre.name}`}
         </button>
         
         <div className="mt-6 flex items-center gap-2 opacity-50">
            <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white">{activeGenre.bpm} BPM</span>
         </div>

      </div>
    </div>
  );
}
