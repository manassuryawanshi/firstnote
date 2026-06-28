"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Guitar, Sparkles, Layers, Activity, Music, Flame, Cable } from "lucide-react";
import GuitarTuner from "@/components/GuitarTuner";
import GuitarFretboard from "@/components/GuitarFretboard";
import GuitarProgressionBuilder from "@/components/GuitarProgressionBuilder";
import { useTutorial } from "@/context/TutorialContext";
import TutorialOverlay from "@/components/TutorialOverlay";
import TutorialTooltip from "@/components/TutorialTooltip";
const ROTATING_WORDS = [
  "Guitarists",
  "Bassists",
  "Shredders",
  "Rhythm Players",
  "Songwriters",
];

// Autonomous Background String Component
const BackgroundString = ({ index, thickness }: { index: number, thickness: number }) => {
  const [isPlucked, setIsPlucked] = useState(false);
  const intensity = 30 + (index % 3) * 10; 

  useEffect(() => {
    // Randomize plucking so it feels like someone is actively playing rapidly
    const playRandomly = () => {
      // 20% chance to pluck this string on this "tick" (moderate frequency)
      if (Math.random() > 0.80) {
        setIsPlucked(true);
        setTimeout(() => setIsPlucked(false), 500);
      }
      
      // Schedule next tick (between 400ms and 1200ms)
      const nextTick = 400 + Math.random() * 800;
      setTimeout(playRandomly, nextTick);
    };
    
    // Initial staggered start
    const startDelay = index * 200 + Math.random() * 500;
    const timeout = setTimeout(playRandomly, startDelay);
    
    return () => clearTimeout(timeout);
  }, [index]);

  const stringPath = "M 50 0 Q 50 500 50 1000";
  const pluckedPath = [
    stringPath,
    `M 50 0 Q ${50 - intensity} 500 50 1000`,
    `M 50 0 Q ${50 + intensity * 0.8} 500 50 1000`,
    `M 50 0 Q ${50 - intensity * 0.5} 500 50 1000`,
    `M 50 0 Q ${50 + intensity * 0.2} 500 50 1000`,
    stringPath
  ];

  return (
    <div className="relative h-full w-[100px] flex justify-center opacity-40 pointer-events-none">
      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 1000" preserveAspectRatio="none">
        
        {/* The metallic base string (Subtle dark silver) */}
        <motion.path 
          d={stringPath}
          animate={{ d: isPlucked ? pluckedPath : stringPath }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          stroke="#52525b" /* zinc-600 */
          strokeWidth={thickness}
          fill="none"
          strokeLinecap="round"
          className="drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]"
        />
        
        {/* The neon fuchsia pop effect (Flashes only when played) */}
        <motion.path 
          d={stringPath}
          animate={{ 
             d: isPlucked ? pluckedPath : stringPath,
             opacity: isPlucked ? [0, 1, 0.5, 0.2, 0, 0] : 0,
             strokeWidth: isPlucked ? [thickness, thickness + 4, thickness + 2, thickness, thickness, thickness] : thickness
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          stroke="#d946ef"
          fill="none"
          strokeLinecap="round"
          className="drop-shadow-[0_0_20px_rgba(217,70,239,1)] mix-blend-screen"
        />
      </svg>
    </div>
  );
};

export default function GuitarPage() {
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  
  const { tutorialStep, setTutorialStep, completeTutorial } = useTutorial();



  useEffect(() => {
    const typingSpeed = isDeleting ? 50 : 100;
    const currentWord = ROTATING_WORDS[loopNum % ROTATING_WORDS.length] + ".";

    const handleTyping = () => {
      setText(isDeleting 
        ? currentWord.substring(0, text.length - 1) 
        : currentWord.substring(0, text.length + 1)
      );

      if (!isDeleting && text === currentWord) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && text === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timeout = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timeout);
  }, [text, isDeleting, loopNum]);

  return (
    <main className="min-h-screen bg-[#000000] text-zinc-900 dark:text-white pt-32 px-6 pb-32 overflow-hidden relative">
      
      {/* Dynamic Background: Realistic Vibrating Strings on a Fretboard */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex justify-evenly opacity-100">
         
         {/* Fretboard Wood Base */}
         <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#111111] to-[#0a0a0a]"></div>

         {/* Subtle center glow so the strings pop, but keep it very dark */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-fuchsia-900/10 blur-[120px] rounded-full"></div>
         
         {/* Horizontal Frets */}
         <div className="absolute inset-0 flex flex-col justify-between pt-32 pb-10 opacity-30">
           {[...Array(10)].map((_, i) => (
             <div key={`bg-fret-${i}`} className="w-full h-[3px] bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-900 shadow-[0_2px_10px_rgba(0,0,0,1)] border-b border-zinc-800 pointer-events-none"></div>
           ))}
         </div>

         {/* Interactive Strings */}
         {[...Array(6)].map((_, i) => {
            const thicknesses = [8, 6, 4.5, 3, 2, 1.5]; // Thicker for visibility (Low E to High E)
            return <BackgroundString key={`string-${i}`} index={i} thickness={thicknesses[i]} />;
         })}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        <TutorialOverlay activeSteps={[5]} />

        {/* Hero Section */}
        <div className={`flex flex-col items-center justify-center text-center w-full max-w-6xl pointer-events-auto mt-12 mb-24 mx-auto relative ${tutorialStep === 5 ? 'z-[60] bg-black/60 rounded-[3rem] p-12 ring-2 ring-fuchsia-500 shadow-[0_0_50px_rgba(217,70,239,0.2)]' : ''}`}>
           <TutorialTooltip 
              step={5}
              title="Guitar Tour"
              description="This is the Guitar page. It includes a live chromatic tuner and interactive fretboards."
              icon={<Guitar className="w-4 h-4 text-fuchsia-400" />}
              position="bottom"
           />
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] xl:text-[5.5rem] tracking-tighter text-center leading-[1.05] mb-6 px-4 md:px-8 whitespace-nowrap relative z-10">
            <span className="font-extrabold text-zinc-900 dark:text-white block">The ultimate guitar tool</span>
            <span className="font-extrabold text-zinc-900 dark:text-white">for </span>
            <span className="italic font-light text-transparent bg-clip-text bg-[linear-gradient(to_right,#d946ef,#f472b6,#ffffff,#f472b6,#d946ef)] bg-[length:200%_auto] pr-2 drop-shadow-[0_0_15px_rgba(217,70,239,0.8)]" style={{ animation: 'flow 2s linear infinite' }}>
              {text}
            </span>
            <span className="inline-block w-[6px] h-[0.7em] bg-white animate-pulse rounded-full opacity-80 ml-2 align-baseline"></span>
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 font-light max-w-2xl mt-4">
            Tune up with precision, map complex fingerings in any alternate tuning, and explore the entire fretboard instantly.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="flex flex-col gap-32 mt-20">
           {/* Section 1: Tuner */}
           <motion.section 
             id="tuner"
             initial={{ opacity: 0, y: 40 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className={`relative`}
           >
              <div className="flex flex-col items-center justify-center text-center w-full mb-16 relative z-10">
                 <span className="text-xs font-bold tracking-[0.2em] text-zinc-600 dark:text-zinc-400 uppercase mb-3">Calibration</span>
                 <h2 className="text-5xl md:text-6xl font-medium tracking-tight text-zinc-900 dark:text-white mb-4">
                    Live Chromatic Tuner.
                 </h2>
                 <p className="text-zinc-600 dark:text-zinc-400 text-lg md:text-xl font-light max-w-2xl leading-relaxed">Ensure your instrument is pitch-perfect using our high-precision WebAudio algorithm. Just plug in or use your microphone.</p>
              </div>
              <div className="w-full max-w-3xl mx-auto relative z-10">
                 <GuitarTuner />
              </div>
           </motion.section>
           
           {/* Section 2: Fretboard */}
           <motion.section 
             id="fretboard"
             initial={{ opacity: 0, y: 40 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="relative"
           >
              <div className="flex flex-col items-center justify-center text-center w-full mb-16">
                 <span className="text-xs font-bold tracking-[0.2em] text-zinc-600 dark:text-zinc-400 uppercase mb-3">Discovery</span>
                 <h2 className="text-5xl md:text-6xl font-medium tracking-tight text-zinc-900 dark:text-white mb-4">
                    Dynamic Fretboard.
                 </h2>
                 <p className="text-zinc-600 dark:text-zinc-400 text-lg md:text-xl font-light max-w-2xl leading-relaxed">Select any chord and visualize exactly how to play it. Isolate voicings, change tunings, and unlock the neck.</p>
              </div>
              <GuitarFretboard />
           </motion.section>

           {/* Section 3: Sandbox */}
           <motion.section 
             initial={{ opacity: 0, y: 40 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="relative"
           >
              <div className="flex flex-col items-center justify-center text-center w-full mb-16">
                 <span className="text-xs font-bold tracking-[0.2em] text-zinc-600 dark:text-zinc-400 uppercase mb-3">Creation</span>
                 <h2 className="text-5xl md:text-6xl font-medium tracking-tight text-zinc-900 dark:text-white mb-4">
                    Pedalboard Builder.
                 </h2>
                 <p className="text-zinc-600 dark:text-zinc-400 text-lg md:text-xl font-light max-w-2xl leading-relaxed">String together progressions in a custom stompbox chain. Audition sequences with authentic steel-string acoustics and export to MIDI.</p>
              </div>
              <GuitarProgressionBuilder />
           </motion.section>

           {/* Section 4: Possibilities & Uses */}
           <motion.section 
             initial={{ opacity: 0, y: 40 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="relative pt-12 pb-24"
           >
              <div className="flex flex-col items-center justify-center text-center w-full mb-20">
                 <span className="text-xs font-bold tracking-[0.2em] text-zinc-600 dark:text-zinc-400 uppercase mb-3">Inspiration</span>
                 <h2 className="text-5xl md:text-6xl font-medium tracking-tight text-zinc-900 dark:text-white mb-4">
                    Possibilities & Uses.
                 </h2>
                 <p className="text-zinc-600 dark:text-zinc-400 text-lg md:text-xl font-light max-w-2xl leading-relaxed">How modern guitarists leverage the Guitar Suite in their daily workflow.</p>
              </div>

              {/* Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[250px]">
                 
                 {/* Card 1: AI Generator (Cols 1-2) */}
                 <motion.div 
                   whileHover={{ scale: 1.02 }} 
                   className="md:col-span-2 bg-white dark:bg-black/40 backdrop-blur-3xl border border-black/10 dark:border-white/10 rounded-[3rem] p-8 overflow-hidden relative group shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]"
                 >
                    <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative z-10 w-[70%]">
                       <Sparkles className="w-8 h-8 text-fuchsia-400 mb-4" />
                       <h3 className="text-xl md:text-2xl font-black mb-2 text-zinc-900 dark:text-white">AI-Powered Inspiration</h3>
                       <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">Break out of the cowboy-chord rut. Generate musically intelligent, mood-based progressions instantly right onto your pedalboard.</p>
                    </div>

                    {/* Floating Chords Animation */}
                    <div className="absolute top-1/2 -translate-y-1/2 right-8 hidden sm:flex flex-col gap-2">
                       {["Cmaj7", "Am9", "Dm11", "G13"].map((chord, i) => (
                          <motion.div
                            key={i}
                            animate={{ x: [0, -5, 0], opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
                            className="px-3 py-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-fuchsia-400 font-bold text-xs backdrop-blur-md text-center w-16 shadow-[0_0_15px_rgba(217,70,239,0.1)]"
                          >
                            {chord}
                          </motion.div>
                       ))}
                    </div>
                 </motion.div>

                 {/* Card 2: Precision Tuner (Cols 3-4) */}
                 <motion.div 
                   whileHover={{ scale: 1.02 }} 
                   className="md:col-span-2 bg-white dark:bg-black/40 backdrop-blur-3xl border border-black/10 dark:border-white/10 rounded-[3rem] p-8 overflow-hidden relative group shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]"
                 >
                    <div className="absolute inset-0 bg-gradient-to-bl from-fuchsia-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative z-10 w-[60%]">
                       <Activity className="w-8 h-8 text-fuchsia-400 mb-4" />
                       <h3 className="text-xl md:text-2xl font-black mb-2 text-zinc-900 dark:text-white">High-Fidelity Tuner</h3>
                       <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">Pinpoint accuracy using local WebAudio algorithms. No latency, just mathematically perfect pitch right in your browser.</p>
                    </div>

                    {/* Tuner Needle Animation */}
                    <div className="absolute top-1/2 -translate-y-1/2 right-8 hidden sm:block">
                        <div className="relative w-32 h-16">
                           {/* Dial arc */}
                           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 border-t-[3px] border-l-[3px] border-r-[3px] border-black/10 dark:border-white/10 rounded-t-full"></div>
                           {/* Needle */}
                           <motion.div 
                             animate={{ rotate: [-40, 20, -10, 0, 0] }}
                             transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                             className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-16 bg-fuchsia-500 origin-bottom rounded-t-full shadow-[0_0_15px_rgba(217,70,239,0.8)]"
                           />
                           {/* Center Dot */}
                           <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] z-10"></div>
                        </div>
                    </div>
                 </motion.div>

                 {/* Card 3: Pedal Sandbox (Cols 1-3) */}
                 <motion.div 
                   whileHover={{ scale: 1.02 }} 
                   className="md:col-span-3 bg-white dark:bg-black/40 backdrop-blur-3xl border border-black/10 dark:border-white/10 rounded-[3rem] p-8 overflow-hidden relative group shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]"
                 >
                    <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative z-10 w-[55%]">
                       <Cable className="w-8 h-8 text-fuchsia-400 mb-4" />
                       <h3 className="text-xl md:text-2xl font-black mb-2 text-zinc-900 dark:text-white">The Ultimate Sandbox</h3>
                       <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">Build infinite signal chains, audition acoustic samples, transpose on the fly, and export pure MIDI data directly into your DAW.</p>
                    </div>

                    {/* Pedalboard Animation */}
                    <div className="absolute top-1/2 -translate-y-1/2 right-8 hidden sm:flex items-center gap-3">
                       {[1,2,3].map((pedal, i) => (
                          <div key={i} className="flex items-center gap-3">
                            {i > 0 && (
                               <div className="w-8 h-1 bg-black/5 dark:bg-white/5 relative overflow-hidden rounded-full">
                                  <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 1.5, repeat: Infinity, delay: i*0.5, ease: "linear" }} className="absolute inset-0 bg-fuchsia-500" />
                               </div>
                            )}
                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i*0.2 }} className="w-12 h-16 bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg shadow-xl flex flex-col items-center justify-center gap-2">
                               <div className="flex gap-1"><div className="w-1.5 h-1.5 rounded-full bg-text-muted"></div><div className="w-1.5 h-1.5 rounded-full bg-text-muted"></div></div>
                               <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 2, repeat: Infinity, delay: i*0.5 }} className="w-2 h-2 rounded-full bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.8)]"></motion.div>
                            </motion.div>
                          </div>
                       ))}
                    </div>
                 </motion.div>

                 {/* Card 4: Alternate Tunings (Col 4) */}
                 <motion.div 
                   whileHover={{ scale: 1.02 }} 
                   className="md:col-span-1 bg-white dark:bg-black/40 backdrop-blur-3xl border border-black/10 dark:border-white/10 rounded-[3rem] p-8 overflow-hidden relative group shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]"
                 >
                    <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative z-10 w-full h-full flex flex-col">
                       <Layers className="w-8 h-8 text-fuchsia-400 mb-4" />
                       <h3 className="text-xl font-black mb-2 text-zinc-900 dark:text-white">Alternate Tunings</h3>
                       <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">Instantly switch between Drop D, Open G, DADGAD, and custom tunings to visualize scales and chords dynamically across the fretboard.</p>
                    </div>
                 </motion.div>
                 
              </div>
           </motion.section>
        </div>

      </div>
    </main>
  );
}
