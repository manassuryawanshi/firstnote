"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Piano } from "lucide-react";
import PianoChordLibrary from "@/components/piano/PianoChordLibrary";
import PianoProgressionBuilder from "@/components/piano/PianoProgressionBuilder";
import { BookOpen, Sparkles, LayoutDashboard, Clapperboard, AudioLines, Layers } from "lucide-react";
import { useTutorial } from "@/context/TutorialContext";
import TutorialOverlay from "@/components/TutorialOverlay";
import TutorialTooltip from "@/components/TutorialTooltip";
const ROTATING_WORDS = [
  "Composers",
  "Producers",
  "Songwriters",
  "Beatmakers",
  "Educators",
];

const getPseudoRandom = (seed: number) => {
   const x = Math.sin(seed++) * 10000;
   return x - Math.floor(x);
};

export default function PianoPage() {
  const [injectedProgression, setInjectedProgression] = useState<string[] | null>(null);
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
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 z-0">
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-green-500/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/3"></div>
         {[...Array(60)].map((_, i) => {
            const rLeft = (getPseudoRandom(i * 13) * 100).toFixed(2);
            const rDur = 5 + getPseudoRandom(i * 17) * 15;
            const rDelay = getPseudoRandom(i * 19) * -20;
            const rWidth = (40 + getPseudoRandom(i * 23) * 40).toFixed(2);
            const rOpacity = getPseudoRandom(i * 29) > 0.4 ? 'bg-green-400/50 shadow-[0_0_30px_rgba(74,222,128,0.5)]' : 'bg-transparent';
            
            return (
               <motion.div 
                 key={`bg-key-${i}`}
                 initial={{ y: "-100%" }}
                 animate={{ y: "2000%" }}
                 transition={{ duration: rDur, repeat: Infinity, ease: "linear", delay: rDelay }}
                 className={`absolute h-64 border border-green-400/80 rounded-b-xl ${rOpacity}`}
                 style={{ left: `${rLeft}%`, width: `${rWidth}px` }}
               />
            );
         })}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        <TutorialOverlay activeSteps={[4]} />

        {/* Hero Section */}
        <div className={`flex flex-col items-center justify-center text-center w-full max-w-6xl pointer-events-auto mt-12 mb-24 mx-auto relative ${tutorialStep === 4 ? 'z-[60] bg-black/60 rounded-[3rem] p-12 ring-2 ring-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.2)]' : ''}`}>
           <TutorialTooltip 
              step={4}
              title="Piano Tour"
              description="This is the Piano page. You can visually construct harmonic progressions, view chords, and experiment with voicings!"
              icon={<Piano className="w-4 h-4 text-emerald-400" />}
              position="bottom"
           />
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] xl:text-[5.5rem] tracking-tighter text-center leading-[1.05] mb-6 px-4 md:px-8 whitespace-nowrap relative z-10">
            <span className="font-extrabold text-zinc-900 dark:text-white block">The ultimate piano tool</span>
            <span className="font-extrabold text-zinc-900 dark:text-white">for </span>
            <span className="italic font-light text-transparent bg-clip-text bg-[linear-gradient(to_right,#22c55e,#4ade80,#ffffff,#4ade80,#22c55e)] bg-[length:200%_auto] pr-2 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]" style={{ animation: 'flow 2s linear infinite' }}>
              {text}
            </span>
            <span className="inline-block w-[6px] h-[0.7em] bg-white animate-pulse rounded-full opacity-80 ml-2 align-baseline"></span>
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 font-light max-w-2xl mt-4">
            Build chord progressions, search complex fingerings, and instantly export your musical ideas to MIDI.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="flex flex-col gap-32 mt-20">
           {/* Section 1: Dictionary & Quick Generate */}
           <motion.section 
             id="dictionary"
             initial={{ opacity: 0, y: 40 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="relative"
           >
              <div className="flex flex-col items-center justify-center text-center w-full mb-16">
                 <span className="text-xs font-bold tracking-[0.2em] text-zinc-600 dark:text-zinc-400 uppercase mb-3">Discovery</span>
                 <h2 className="text-5xl md:text-6xl font-medium tracking-tight text-zinc-900 dark:text-white mb-4">
                    Chord Dictionary.
                 </h2>
                 <p className="text-zinc-600 dark:text-zinc-400 text-lg md:text-xl font-light max-w-2xl leading-relaxed">Search for complex chords, understand their theory, and map fingerings with precision.</p>
              </div>
              <PianoChordLibrary onInjectProgression={setInjectedProgression} />
           </motion.section>
           
           {/* Section 2: Sandbox */}
           <motion.section 
             id="sandbox"
             initial={{ opacity: 0, y: 40 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className={`relative`}
           >
              <div className="flex flex-col items-center justify-center text-center w-full mb-16 relative z-10">
                 <span className="text-xs font-bold tracking-[0.2em] text-zinc-600 dark:text-zinc-400 uppercase mb-3">Creation</span>
                 <h2 className="text-5xl md:text-6xl font-medium tracking-tight text-zinc-900 dark:text-white mb-4">
                    Progression Sandbox.
                 </h2>
                 <p className="text-zinc-600 dark:text-zinc-400 text-lg md:text-xl font-light max-w-2xl leading-relaxed">Generate progressions, branch paths, transpose, and seamlessly export your ideas to MIDI.</p>
              </div>
              <div className="relative z-10">
                <PianoProgressionBuilder injectedProgression={injectedProgression} onClearInjection={() => setInjectedProgression(null)} />
              </div>
           </motion.section>

           {/* Section 3: Possibilities & Uses */}
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
                 <p className="text-zinc-600 dark:text-zinc-400 text-lg md:text-xl font-light max-w-2xl leading-relaxed">How modern musicians and producers leverage the Piano Suite in their daily workflow.</p>
              </div>

              {/* Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
                 
                 {/* Feature 1: Large Box */}
                 <motion.div 
                   whileHover={{ scale: 1.02 }}
                   className="md:col-span-2 bg-white dark:bg-black/30 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-[3rem] p-10 overflow-hidden relative group flex flex-col justify-center shadow-2xl"
                 >
                   <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                   <div className="relative z-10 max-w-lg">
                      <Clapperboard className="w-12 h-12 text-green-400 mb-6" />
                      <h3 className="text-3xl font-black mb-4">Film Scoring</h3>
                      <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">Map out deep emotional arcs. Instantly find the perfect augmented or diminished transition chord to build tension before a cinematic climax.</p>
                   </div>
                   {/* Abstract decoration */}
                   <div className="absolute -right-20 -bottom-20 w-64 h-64 border-[40px] border-green-500/10 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
                 </motion.div>

                 {/* Feature 2: Tall Box */}
                 <motion.div 
                   whileHover={{ scale: 1.02 }}
                   className="md:col-span-1 bg-white dark:bg-black/30 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-[3rem] p-10 overflow-hidden relative group flex flex-col shadow-2xl"
                 >
                   <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                   <div className="relative z-10 flex flex-col h-full">
                      <Layers className="w-10 h-10 text-green-400 mb-auto" />
                      <div>
                         <h3 className="text-2xl font-black mb-3">Jazz Harmony</h3>
                         <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">Demystify complex theory. Visualize 9ths, 11ths, and 13ths to find voicings that actually fit your fingers.</p>
                      </div>
                   </div>
                 </motion.div>

                 {/* Feature 3: Wide Box */}
                 <motion.div 
                   whileHover={{ scale: 1.02 }}
                   className="md:col-span-3 bg-white dark:bg-black/30 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-[3rem] p-10 overflow-hidden relative group flex flex-col md:flex-row items-center gap-12 shadow-2xl"
                 >
                   <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                   <div className="relative z-10 max-w-2xl">
                      <AudioLines className="w-12 h-12 text-green-400 mb-6" />
                      <h3 className="text-3xl font-black mb-4">DAW Workflow Integration</h3>
                      <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">Don't waste time clicking in notes. Build your perfect 16-bar progression using the AI Generator and Sandbox, then simply drag the MIDI file straight into Logic Pro or Ableton Live.</p>
                   </div>
                   <div className="relative flex-1 w-full h-full min-h-[150px] bg-white dark:bg-black/40 rounded-3xl border border-black/10 dark:border-white/10 flex items-center justify-center group-hover:border-green-500/30 transition-colors">
                      <div className="flex gap-2">
                         {[40, 60, 30, 80, 50, 90, 40].map((h, i) => (
                           <motion.div 
                             key={i}
                             animate={{ height: [h, h*1.5, h] }}
                             transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                             className="w-4 bg-green-500/50 rounded-full"
                             style={{ height: `${h}px` }}
                           />
                         ))}
                      </div>
                   </div>
                 </motion.div>
                 
              </div>
           </motion.section>
        </div>

      </div>
    </main>
  );
}
