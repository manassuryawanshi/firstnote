"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Tone from "tone";
import { Play, Volume2, CheckCircle2, XCircle } from "lucide-react";
import { getGrandPianoSampler } from "@/lib/audio";
import { Interval, Chord, Scale, Note } from "@tonaljs/tonal";

const CATEGORIES = {
  intervals: [
    { name: "Minor 2nd", steps: 1 },
    { name: "Major 2nd", steps: 2 },
    { name: "Minor 3rd", steps: 3 },
    { name: "Major 3rd", steps: 4 },
    { name: "Perfect 4th", steps: 5 },
    { name: "Tritone", steps: 6 },
    { name: "Perfect 5th", steps: 7 },
    { name: "Major 6th", steps: 9 },
    { name: "Major 7th", steps: 11 },
    { name: "Octave", steps: 12 },
  ],
  triads: [
    { name: "Major", symbol: "M" },
    { name: "Minor", symbol: "m" },
    { name: "Diminished", symbol: "dim" },
    { name: "Augmented", symbol: "aug" },
  ],
  sevenths: [
    { name: "Major 7", symbol: "maj7" },
    { name: "Minor 7", symbol: "m7" },
    { name: "Dominant 7", symbol: "7" },
    { name: "Half-Dim", symbol: "m7b5" },
  ],
  scales: [
    { name: "Major", type: "major" },
    { name: "Natural Minor", type: "minor" },
    { name: "Harmonic Minor", type: "harmonic minor" },
    { name: "Dorian", type: "dorian" },
    { name: "Mixolydian", type: "mixolydian" },
  ]
};

type CategoryKey = keyof typeof CATEGORIES;

export default function EarTrainer() {
  const [synth, setSynth] = useState<Tone.Sampler | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("intervals");
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [currentNotes, setCurrentNotes] = useState<string[]>([]);
  const [selectedGuess, setSelectedGuess] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const sampler = getGrandPianoSampler(() => setIsLoaded(true));
    setSynth(sampler);
    return () => {
      sampler.dispose();
      Tone.Transport.stop();
    };
  }, []);

  const generateQuestion = () => {
    const options = CATEGORIES[activeCategory];
    const randomOption = options[Math.floor(Math.random() * options.length)];
    
    // Pick a random root note between C3 and G4
    const roots = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const randomRootStr = roots[Math.floor(Math.random() * roots.length)];
    const randomOctave = Math.floor(Math.random() * 2) + 3; // 3 or 4
    const rootNote = `${randomRootStr}${randomOctave}`;

    let notes: string[] = [];

    if (activeCategory === "intervals") {
      const targetNote = Note.transpose(rootNote, Interval.fromSemitones((randomOption as any).steps));
      notes = [rootNote, targetNote];
    } else if (activeCategory === "triads" || activeCategory === "sevenths") {
      const chord = Chord.get(`${randomRootStr}${(randomOption as any).symbol}`);
      notes = chord.notes.map((n, i) => {
        const oct = n.charCodeAt(0) < randomRootStr.charCodeAt(0) && i > 0 ? randomOctave + 1 : randomOctave;
        return `${n}${oct}`;
      });
    } else if (activeCategory === "scales") {
      const scale = Scale.get(`${randomRootStr} ${(randomOption as any).type}`);
      notes = scale.notes.map((n, i) => {
        const oct = n.charCodeAt(0) < randomRootStr.charCodeAt(0) && i > 0 ? randomOctave + 1 : randomOctave;
        return `${n}${oct}`;
      });
      notes.push(`${scale.notes[0]}${randomOctave + 1}`); // Add octave
    }

    setCurrentAnswer(randomOption);
    setCurrentNotes(notes);
    setSelectedGuess(null);
    playNotes(notes, activeCategory);
  };

  const playNotes = async (notesToPlay: string[], category: CategoryKey) => {
    if (!synth || notesToPlay.length === 0) return;
    await Tone.start();
    const now = Tone.now();

    if (category === "intervals" || category === "scales") {
      // Play melodically (one by one)
      notesToPlay.forEach((note, i) => {
        synth.triggerAttackRelease(note, "4n", now + i * 0.5);
      });
    } else {
      // Play harmonically (all at once)
      synth.triggerAttackRelease(notesToPlay, "2n", now);
    }
  };

  const handleGuess = (guessName: string) => {
    if (selectedGuess) return; // already guessed this round
    
    setSelectedGuess(guessName);
    if (guessName === currentAnswer?.name) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
  };

  return (
    <div className="mt-12 w-full p-8 rounded-3xl bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 flex flex-col items-center">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center w-full mb-8">
         <div className="flex gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-full">
            {(Object.keys(CATEGORIES) as CategoryKey[]).map((cat) => (
               <button
                  key={cat}
                  onClick={() => {
                     setActiveCategory(cat);
                     setCurrentAnswer(null);
                     setSelectedGuess(null);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-all ${activeCategory === cat ? 'bg-indigo-500 text-zinc-900 dark:text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white hover:bg-black/5 dark:bg-white/5'}`}
               >
                  {cat}
               </button>
            ))}
         </div>

         <div className="flex items-center gap-6 mt-6 md:mt-0">
            <div className="text-center">
               <span className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">Score</span>
               <span className="text-2xl font-black text-zinc-900 dark:text-white">{score}</span>
            </div>
            <div className="text-center">
               <span className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">Streak</span>
               <span className={`text-2xl font-black ${streak > 2 ? 'text-cyan-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.8)]' : 'text-zinc-900 dark:text-white'}`}>{streak}</span>
            </div>
         </div>
      </div>

      {/* Main Play Area */}
      <div className="w-full max-w-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-8 flex flex-col items-center min-h-[300px] justify-center relative overflow-hidden">
         {!currentAnswer ? (
            <button
               onClick={generateQuestion}
               disabled={!isLoaded}
               className={`flex items-center gap-3 px-10 py-5 rounded-full text-xl font-black transition-all ${isLoaded ? 'bg-indigo-500 text-zinc-900 dark:text-white hover:scale-105 shadow-[0_0_30px_rgba(99,102,241,0.4)]' : 'bg-black/5 dark:bg-white/5 text-zinc-900 dark:text-white/30 cursor-not-allowed'}`}
            >
               <Play className="w-6 h-6 fill-current" />
               {isLoaded ? `Start ${activeCategory} Quiz` : 'Loading Piano...'}
            </button>
         ) : (
            <div className="w-full flex flex-col items-center">
               
               <button
                  onClick={() => playNotes(currentNotes, activeCategory)}
                  className="w-24 h-24 rounded-full bg-black/5 dark:bg-white/5 border border-white/20 flex items-center justify-center text-zinc-900 dark:text-white hover:bg-white/20 hover:scale-105 transition-all mb-10 group"
               >
                  <Volume2 className="w-10 h-10 group-hover:text-indigo-400 transition-colors" />
               </button>

               <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-3">
                  {CATEGORIES[activeCategory].map((opt) => {
                     const isCorrect = opt.name === currentAnswer.name;
                     const isGuessed = opt.name === selectedGuess;
                     
                     let btnClass = "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:bg-white/5";
                     
                     if (selectedGuess) {
                        if (isCorrect) btnClass = "bg-emerald-500 border-emerald-400 text-zinc-900 dark:text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]";
                        else if (isGuessed) btnClass = "bg-blue-500 border-blue-400 text-zinc-900 dark:text-white opacity-50";
                        else btnClass = "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-zinc-600 opacity-50";
                     }

                     return (
                        <button
                           key={opt.name}
                           onClick={() => handleGuess(opt.name)}
                           disabled={!!selectedGuess}
                           className={`px-4 py-4 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-2 ${btnClass}`}
                        >
                           {selectedGuess && isCorrect && <CheckCircle2 className="w-4 h-4" />}
                           {selectedGuess && isGuessed && !isCorrect && <XCircle className="w-4 h-4" />}
                           {opt.name}
                        </button>
                     );
                  })}
               </div>

               <AnimatePresence>
                  {selectedGuess && (
                     <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-10"
                     >
                        <button
                           onClick={generateQuestion}
                           className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
                        >
                           Next Question
                        </button>
                     </motion.div>
                  )}
               </AnimatePresence>

            </div>
         )}
      </div>
    </div>
  );
}
