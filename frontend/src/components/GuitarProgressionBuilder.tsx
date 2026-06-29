"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Square, Download, Plus, Minus, Trash2, Wand2, Cable, GripVertical, ArrowLeft, ArrowRight, Sparkles, ArrowLeftRight, ChevronDown, Undo, Redo } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as Tone from "tone";
import { Chord, Note, Progression } from "@tonaljs/tonal";
// @ts-ignore
import MidiWriter from "midi-writer-js";

const ROOTS = [
  "C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"
];
const KEY_ROOTS = [
  "C", "Cm", "C#", "C#m", "D", "Dm", "Eb", "Ebm", "E", "Em", "F", "Fm", 
  "F#", "F#m", "G", "Gm", "G#", "G#m", "A", "Am", "Bb", "Bbm", "B", "Bm"
];
const QUALITIES = [
  { label: "Major", value: "maj" },
  { label: "Minor", value: "minor" },
  { label: "Diminished", value: "dim" },
  { label: "Augmented", value: "aug" },
  { label: "Major 7th", value: "maj7" },
  { label: "Minor 7th", value: "m7" },
  { label: "Dominant 7th", value: "7" },
  { label: "Suspended 2", value: "sus2" },
  { label: "Suspended 4", value: "sus4" },
  { label: "Minor 9th", value: "m9" },
  { label: "Major 9th", value: "maj9" },
  { label: "Dominant 9th", value: "9" },
];

const MOODS: Record<string, { scale: "major" | "minor", chords: string[][] }> = {
  happy: { scale: "major", chords: [["I", "IV", "V", "I"], ["I", "VIm", "IV", "V"], ["I", "V", "VIm", "IV"]] },
  sad: { scale: "minor", chords: [["Im", "bVI", "bIII", "bVII"], ["Im", "IVm", "Vm", "Im"], ["Im", "bVII", "bVI", "V"]] },
  epic: { scale: "minor", chords: [["Im", "bVI", "bIII", "bVII"], ["Im", "bVII", "bVI", "bVII"], ["Im", "Vm", "bVI", "bVII"]] },
  romantic: { scale: "major", chords: [["I", "VIm", "IIm", "V"], ["I", "IV", "I", "V"], ["I", "IIIm", "IV", "V"]] },
  dark: { scale: "minor", chords: [["Im", "bII", "Im", "V"], ["Im", "IVm", "Im", "V"], ["Im", "bVI", "IVm", "V"]] },
  dreamy: { scale: "major", chords: [["I", "IV", "IIm", "V"], ["I", "IIIm", "VIm", "IV"], ["I", "bIII", "bVI", "bII"]] }
};

interface Pedal {
  id: string;
  root: string;
  quality: string;
}

// Global sampler
let globalSampler: Tone.Sampler | null = null;
const getSampler = () => {
  if (!globalSampler) {
    const GUITAR_BASE = "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_steel-mp3/";
    globalSampler = new Tone.Sampler({
      urls: {
        "A2": GUITAR_BASE + "A2.mp3",
        "C3": GUITAR_BASE + "C3.mp3",
        "E3": GUITAR_BASE + "E3.mp3",
        "G3": GUITAR_BASE + "G3.mp3",
        "A3": GUITAR_BASE + "A3.mp3",
        "C4": GUITAR_BASE + "C4.mp3",
        "E4": GUITAR_BASE + "E4.mp3",
        "G4": GUITAR_BASE + "G4.mp3",
        "A4": GUITAR_BASE + "A4.mp3",
        "C5": GUITAR_BASE + "C5.mp3",
        "E5": GUITAR_BASE + "E5.mp3",
      },
      release: 2,
    }).toDestination();
    globalSampler.volume.value = 5;
  }
  return globalSampler;
};

export default function GuitarProgressionBuilder() {
  const [chain, setChain] = useState<Pedal[]>([]);
  const [history, setHistory] = useState<Pedal[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [transposeAmount, setTransposeAmount] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [activePedalIndex, setActivePedalIndex] = useState<number | null>(null);
  
  // Controls
  const [selectedRoot, setSelectedRoot] = useState("C");
  const [selectedQuality, setSelectedQuality] = useState("maj");

  // Quick Gen Controls
  const [qRoot, setQRoot] = useState("C");
  const [qMood, setQMood] = useState("happy");
  const [qLength, setQLength] = useState(4);

  useEffect(() => {
    getSampler();
  }, []);

  const updateChain = (newChain: Pedal[]) => {
    if (isPlaying) stopSequence();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newChain);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setChain(newChain);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      if (isPlaying) stopSequence();
      setHistoryIndex(historyIndex - 1);
      setChain(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      if (isPlaying) stopSequence();
      setHistoryIndex(historyIndex + 1);
      setChain(history[historyIndex + 1]);
    }
  };

  const clearAll = () => {
    if (chain.length === 0) return;
    updateChain([]);
    setTransposeAmount(0);
  };

  const handleTranspose = (semitones: 1 | -1) => {
    if (chain.length === 0) return;
    
    // Strict chromatic mapping to prevent enharmonic spelling drift
    const PREFERRED_ROOTS = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];
    
    const newChain = chain.map(p => {
      const chroma = Note.get(p.root).chroma;
      if (chroma === undefined || chroma === null) return p; // Fallback
      
      let newChroma = (chroma + semitones) % 12;
      if (newChroma < 0) newChroma += 12;
      
      return { ...p, root: PREFERRED_ROOTS[newChroma] };
    });
    
    updateChain(newChain);
    setTransposeAmount(prev => prev + semitones);
  };

  const addPedal = () => {
    const newPedal: Pedal = {
      id: `pedal-${Date.now()}-${Math.random()}`,
      root: selectedRoot,
      quality: selectedQuality
    };
    updateChain([...chain, newPedal]);
  };

  const removePedal = (id: string) => {
    updateChain(chain.filter(p => p.id !== id));
  };

  const movePedal = (index: number, direction: -1 | 1) => {
     if (index + direction < 0 || index + direction >= chain.length) return;
     const newChain = [...chain];
     const temp = newChain[index];
     newChain[index] = newChain[index + direction];
     newChain[index + direction] = temp;
     updateChain(newChain);
  };

  const generateQuick = () => {
    const moodObj = MOODS[qMood] || MOODS["happy"];
    const list = moodObj.chords;
    const selectedRoman = list[Math.floor(Math.random() * list.length)];
    
    const pitchRoot = qRoot.replace('m', '');
    let chords = Progression.fromRomanNumerals(pitchRoot, selectedRoman);
    
    let newChain: Pedal[] = [];
    
    for (let i = 0; i < qLength; i++) {
      const chordSymbol = chords[i % chords.length];
      const parsed = Chord.get(chordSymbol);
      let quality = parsed.type === "M" ? "maj" : parsed.type === "m" ? "minor" : parsed.type;
      
      newChain.push({
         id: `quick-${Date.now()}-${i}`,
         root: parsed.tonic || "C",
         quality
      });
    }
    updateChain(newChain);
    setTransposeAmount(0);
  };

  const playSequence = async () => {
    if (chain.length === 0) return;
    
    await Tone.start();
    const sampler = getSampler();
    
    if (!sampler.loaded) {
       await new Promise(resolve => {
          const interval = setInterval(() => {
             if (sampler.loaded) {
                clearInterval(interval);
                resolve(true);
             }
          }, 100);
       });
    }

    setIsPlaying(true);
    Tone.Transport.stop();
    Tone.Transport.cancel();
    
    Tone.Transport.bpm.value = 90;
    let timeOffset = 0;
    
    chain.forEach((pedal, index) => {
      Tone.Transport.schedule((time) => {
        Tone.Draw.schedule(() => {
          setActivePedalIndex(index);
        }, time);

        const parsed = Chord.get(`${pedal.root}${pedal.quality}`);
        if (!parsed.empty) {
           const rootPitched = `${pedal.root}3`; 
           const chordPitched = Chord.getChord(parsed.type, rootPitched);
           chordPitched.notes.forEach((note, nIdx) => {
              sampler.triggerAttackRelease(note, "1n", time + nIdx * 0.04);
           });
        }
      }, `+${timeOffset}`);
      timeOffset += 0.85; 
    });

    Tone.Transport.schedule((time) => {
      Tone.Draw.schedule(() => {
        setIsPlaying(false);
        setActivePedalIndex(null);
      }, time);
    }, `+${timeOffset}`);

    Tone.Transport.start();
  };

  const stopSequence = () => {
    Tone.Transport.stop();
    setIsPlaying(false);
    setActivePedalIndex(null);
  };

  const exportMidi = () => {
    if (chain.length === 0) return;
    const track = new MidiWriter.Track();
    track.addEvent(new MidiWriter.ProgramChangeEvent({instrument: 25})); 
    
    chain.forEach(pedal => {
      const parsed = Chord.get(`${pedal.root}${pedal.quality}`);
      if (!parsed.empty) {
        const rootPitched = `${pedal.root}3`;
        const chordPitched = Chord.getChord(parsed.type, rootPitched);
        const noteEvent = new MidiWriter.NoteEvent({
          pitch: chordPitched.notes,
          duration: '1', 
          velocity: 80
        });
        track.addEvent(noteEvent);
      }
    });

    const write = new MidiWriter.Writer(track);
    const dataUri = write.dataUri();
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = `guitar-progression.mid`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative rounded-[3rem] shadow-2xl w-full bg-white dark:bg-black/40 backdrop-blur-md shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] border border-black/10 dark:border-white/10 overflow-hidden [-webkit-mask-image:-webkit-radial-gradient(white,black)]">
      
      {/* Masked Animated Border */}
      <div 
         className="absolute inset-0 rounded-[3rem] pointer-events-none overflow-hidden"
         style={{
            padding: '2px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
         }}
      >
         <div className="absolute w-[4000px] h-[4000px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_0deg,rgba(217,70,239,0.5)_0%,rgba(255,255,255,1)_50%,rgba(217,70,239,0.5)_100%)]"></div>
      </div>

      <div className="relative z-10 p-8 md:p-12 w-full flex flex-col gap-8">
      
         {/* AI Quick Generator */}
         <div className="p-6 bg-gradient-to-br from-fuchsia-500/10 to-pink-900/20 rounded-3xl border border-fuchsia-500/30 shadow-[0_0_30px_rgba(217,70,239,0.1)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="flex items-center gap-2 mb-6 relative z-10">
               <div className="w-8 h-8 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center shadow-inner">
                  <Sparkles className="w-4 h-4 text-fuchsia-400" />
               </div>
               <h3 className="text-lg font-black text-zinc-900 dark:text-white">AI Quick Generator</h3>
            </div>

            <div className="flex flex-wrap items-end gap-6 relative z-10">
               <div className="space-y-2 flex-1 min-w-[120px] group">
                  <label className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-widest group-hover:text-fuchsia-400 transition-colors">Root</label>
                  <div className="relative">
                    <select 
                      value={qRoot} onChange={e => setQRoot(e.target.value)}
                      className="w-full bg-white dark:bg-black/60 border border-black/10 dark:border-white/10 rounded-xl py-3 pl-4 pr-10 text-zinc-900 dark:text-white font-bold focus:outline-none focus:border-fuchsia-500 transition-colors hover:border-white/20 cursor-pointer shadow-inner appearance-none text-sm"
                    >
                      {KEY_ROOTS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                       <ChevronDown className="w-4 h-4 text-zinc-600 dark:text-zinc-400 group-hover:text-fuchsia-400 transition-colors" />
                    </div>
                  </div>
               </div>
               
               <div className="space-y-2 flex-1 min-w-[120px] group">
                  <label className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-widest group-hover:text-fuchsia-400 transition-colors">Mood / Style</label>
                  <div className="relative">
                    <select value={qMood} onChange={(e) => setQMood(e.target.value)} className="w-full bg-white dark:bg-black/60 border border-black/10 dark:border-white/10 rounded-xl py-3 pl-4 pr-10 text-zinc-900 dark:text-white font-bold focus:outline-none focus:border-fuchsia-500 transition-colors hover:border-white/20 cursor-pointer shadow-inner appearance-none text-sm">
                      <option value="happy">Happy</option>
                      <option value="sad">Sad</option>
                      <option value="epic">Epic</option>
                      <option value="romantic">Romantic</option>
                      <option value="dark">Dark</option>
                      <option value="dreamy">Dreamy</option>
                   </select>
                   <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-zinc-600 dark:text-zinc-400 group-hover:text-fuchsia-400 transition-colors" />
                   </div>
                  </div>
               </div>
               
               <div className="space-y-2 flex-1 min-w-[120px] group">
                  <label className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-widest group-hover:text-fuchsia-400 transition-colors">Length</label>
                  <div className="relative">
                    <select 
                      value={qLength} onChange={e => setQLength(parseInt(e.target.value))}
                      className="w-full bg-white dark:bg-black/60 border border-black/10 dark:border-white/10 rounded-xl py-3 pl-4 pr-10 text-zinc-900 dark:text-white font-bold focus:outline-none focus:border-fuchsia-500 transition-colors hover:border-white/20 cursor-pointer shadow-inner appearance-none text-sm"
                    >
                      {[2, 4, 8, 16].map(l => <option key={l} value={l}>{l} Chords</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                       <ChevronDown className="w-4 h-4 text-zinc-600 dark:text-zinc-400 group-hover:text-fuchsia-400 transition-colors" />
                    </div>
                  </div>
               </div>

               <button 
                  onClick={generateQuick}
                  className="w-full md:w-auto px-6 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-black font-black rounded-xl text-sm transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(217,70,239,0.3)] flex items-center justify-center gap-2 whitespace-nowrap"
               >
                  Generate to Pedalboard <ArrowLeftRight className="w-4 h-4" />
               </button>
            </div>
         </div>

         {/* Quick Add Form */}
         <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-black/50 p-3 rounded-2xl border border-black/10 dark:border-white/10 shadow-inner w-max">
            <select 
               value={selectedRoot} 
               onChange={(e) => setSelectedRoot(e.target.value)}
               className="bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white font-black text-xl focus:outline-none focus:border-fuchsia-500 appearance-none cursor-pointer"
            >
               {ROOTS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            
            <select 
               value={selectedQuality} 
               onChange={(e) => setSelectedQuality(e.target.value)}
               className="bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white font-bold focus:outline-none focus:border-fuchsia-500 appearance-none cursor-pointer"
            >
               {QUALITIES.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
            </select>

            <button 
               onClick={addPedal}
               className="flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-black font-black px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(217,70,239,0.3)] whitespace-nowrap"
            >
               <Plus className="w-5 h-5" /> Add Pedal
            </button>
         </div>

         {/* Main Signal Chain Area */}
         <div className="w-full bg-[#0a0a0a] rounded-[2rem] border-2 border-[#111] p-8 md:p-12 relative min-h-[350px] flex items-center overflow-x-auto shadow-inner">
         
         {/* Tolex Texture Overlay */}
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/dark-leather.png")' }}></div>

         {chain.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center text-zinc-600 gap-4">
               <Cable className="w-16 h-16 opacity-20" />
               <p className="font-bold tracking-widest uppercase text-sm">Your signal chain is empty</p>
               <p className="text-xs font-light">Add a pedal above or use the AI Generator.</p>
            </div>
         ) : (
            <div className="flex items-center relative z-10 w-max px-4">
               
               {/* Input Jack */}
               <div className="w-4 h-12 border-black/10 dark:border-white/10 border-r-4 border-zinc-900 rounded-l-md mr-4 relative">
                  <div className="absolute top-1/2 left-0 w-12 h-1 bg-fuchsia-500/20 -translate-y-1/2 -z-10"></div>
               </div>

               <AnimatePresence>
                  {chain.map((pedal, index) => {
                     const isActive = index === activePedalIndex;
                     // Alternate pedal colors based on quality
                     const isMinor = pedal.quality.includes("min") || pedal.quality.includes("m");
                     const isDom = pedal.quality.includes("7") || pedal.quality.includes("9");
                     let pedalColor = "from-zinc-700 to-zinc-900"; // Default silver
                     let ledColor = "bg-red-500 shadow-[0_0_10px_red]";
                     if (isMinor) { pedalColor = "from-blue-900 to-black"; ledColor = "bg-blue-500 shadow-[0_0_10px_blue]"; }
                     if (isDom) { pedalColor = "from-amber-700 to-black"; ledColor = "bg-amber-400 shadow-[0_0_10px_orange]"; }
                     if (isActive) {
                        ledColor = "bg-white shadow-[0_0_20px_white]"; // Active indicator
                     }

                     return (
                        <div key={pedal.id} className="flex items-center">
                           
                           {/* Patch Cable (Left) */}
                           {index > 0 && (
                              <div className="w-12 h-3 bg-white dark:bg-black border-y border-zinc-800 relative z-0 flex items-center justify-center">
                                 {/* Glowing signal when active */}
                                 {isActive && <div className="w-full h-1 bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.8)]"></div>}
                              </div>
                           )}

                           {/* Stompbox */}
                           <motion.div 
                              layout
                              initial={{ opacity: 0, scale: 0.8, y: 20 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: -20 }}
                              className={`w-32 h-48 rounded-xl flex flex-col items-center justify-between p-4 relative z-10 border border-black/10 dark:border-white/10 shadow-[5px_10px_15px_rgba(0,0,0,0.8)] bg-gradient-to-b ${pedalColor} ${isActive ? 'scale-105 ring-2 ring-fuchsia-500 shadow-[0_0_30px_rgba(217,70,239,0.3)] transition-all' : ''}`}
                           >
                              {/* Footswitch / Knobs */}
                              <div className="w-full flex justify-between items-center px-1">
                                 <div className="w-4 h-4 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-700 shadow-inner"></div>
                                 <div className="w-4 h-4 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-700 shadow-inner"></div>
                                 <div className="w-4 h-4 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-700 shadow-inner"></div>
                              </div>

                              {/* Label */}
                              <div className="text-center w-full bg-white dark:bg-black/40 py-2 rounded-lg border border-black/10 dark:border-white/10">
                                 <div className="text-3xl font-black text-zinc-900 dark:text-white">{pedal.root}</div>
                                 <div className="text-[10px] uppercase tracking-widest text-zinc-600 dark:text-zinc-400 font-bold">{pedal.quality}</div>
                              </div>

                              {/* LED & Switch */}
                              <div className="flex flex-col items-center gap-2">
                                 <div className={`w-2 h-2 rounded-full ${ledColor}`}></div>
                                 <div className="flex items-center gap-1 border-black/10 dark:border-white/10/80 p-1 rounded-full border border-black/10 dark:border-white/10 shadow-inner">
                                    <button 
                                       onClick={() => movePedal(index, -1)} 
                                       disabled={index === 0} 
                                       className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white hover:bg-black/5 dark:bg-white/5 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                    >
                                       <ArrowLeft className="w-3 h-3"/>
                                    </button>
                                    <button 
                                       onClick={() => removePedal(pedal.id)}
                                       className="w-6 h-6 rounded-full bg-zinc-300 flex items-center justify-center hover:bg-red-400 group transition-colors shadow-md"
                                    >
                                       <Trash2 className="w-3 h-3 text-transparent group-hover:text-red-900" />
                                    </button>
                                    <button 
                                       onClick={() => movePedal(index, 1)} 
                                       disabled={index === chain.length - 1} 
                                       className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white hover:bg-black/5 dark:bg-white/5 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                    >
                                       <ArrowRight className="w-3 h-3"/>
                                    </button>
                                 </div>
                              </div>
                           </motion.div>
                        </div>
                     )
                  })}
               </AnimatePresence>
               
               {/* Output Jack */}
               {chain.length > 0 && (
                  <div className="w-4 h-12 border-black/10 dark:border-white/10 border-l-4 border-zinc-900 rounded-r-md ml-4"></div>
               )}

            </div>
         )}
      </div>

      {/* Footer Controls */}
      <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-6">
         
         <div className="flex flex-wrap items-center gap-2">
            
            {/* Transpose Controls */}
            <div className="flex items-center gap-1 bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl p-1 shadow-inner mr-2">
               <button 
                 onClick={() => handleTranspose(-1)}
                 disabled={chain.length === 0}
                 className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 font-bold text-sm transition-colors hover:text-zinc-900 dark:text-white disabled:opacity-30 disabled:hover:bg-transparent"
               >-</button>
               <div className="w-12 text-center text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest">
                  {transposeAmount > 0 ? `+${transposeAmount}` : transposeAmount}
               </div>
               <button 
                 onClick={() => handleTranspose(1)}
                 disabled={chain.length === 0}
                 className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 font-bold text-sm transition-colors hover:text-zinc-900 dark:text-white disabled:opacity-30 disabled:hover:bg-transparent"
               >+</button>
            </div>

            <button 
               onClick={handleUndo} 
               disabled={historyIndex <= 0} 
               className="p-3 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white hover:bg-black/5 dark:bg-white/5 rounded-xl disabled:opacity-30 transition-all active:scale-95 border border-transparent hover:border-black/10 dark:border-white/10"
               title="Undo"
            >
               <Undo className="w-5 h-5" />
            </button>
            <button 
               onClick={handleRedo} 
               disabled={historyIndex >= history.length - 1} 
               className="p-3 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white hover:bg-black/5 dark:bg-white/5 rounded-xl disabled:opacity-30 transition-all active:scale-95 border border-transparent hover:border-black/10 dark:border-white/10"
               title="Redo"
            >
               <Redo className="w-5 h-5" />
            </button>
            <button 
               onClick={clearAll} 
               disabled={chain.length === 0}
               className="p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl disabled:opacity-30 transition-all active:scale-95 border border-transparent hover:border-red-500/20 ml-2"
               title="Clear All Pedals"
            >
               <Trash2 className="w-5 h-5" />
            </button>
         </div>

         <div className="flex flex-wrap md:flex-nowrap gap-4 w-full md:w-auto">
            <button 
               onClick={exportMidi}
               disabled={chain.length === 0}
               className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-zinc-100 dark:bg-zinc-900 hover:border-black/10 dark:border-white/10 border border-black/10 dark:border-white/10 disabled:opacity-50 text-zinc-900 dark:text-white font-bold rounded-xl transition-all whitespace-nowrap"
            >
               <Download className="w-4 h-4" /> Export MIDI
            </button>
            
            {isPlaying ? (
               <button 
                 onClick={stopSequence}
                 className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-red-500 hover:bg-red-400 text-zinc-900 dark:text-white font-black rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] whitespace-nowrap"
               >
                 <Square className="w-5 h-5 fill-white" /> Stop
               </button>
            ) : (
               <button 
                 onClick={playSequence}
                 disabled={chain.length === 0}
                 className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-fuchsia-500 hover:bg-fuchsia-400 disabled:opacity-50 disabled:border-black/10 dark:border-white/10 text-black font-black rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(217,70,239,0.3)] whitespace-nowrap"
               >
                 <Play className="w-5 h-5 fill-black" /> Play Sequence
               </button>
            )}
         </div>

      </div>

    </div>
    </div>
  );
}
