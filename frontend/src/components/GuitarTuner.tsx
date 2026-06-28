"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import { motion } from "framer-motion";
const { AMDF } = require("pitchfinder");

const NOTE_STRINGS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const GUITAR_STRINGS = [
  { label: "Auto", midi: null },
  { label: "E", midi: 40 }, // Low E
  { label: "A", midi: 45 },
  { label: "D", midi: 50 },
  { label: "G", midi: 55 },
  { label: "B", midi: 59 },
  { label: "e", midi: 64 }, // High E
];

export default function GuitarTuner() {
  const [isActive, setIsActive] = useState(false);
  const [pitch, setPitch] = useState<number | null>(null);
  const [noteName, setNoteName] = useState<string>("--");
  const [centsOff, setCentsOff] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0);
  const [tuningMode, setTuningMode] = useState<number | null>(null);

  const tuningModeRef = useRef<number | null>(null);
  useEffect(() => {
    tuningModeRef.current = tuningMode;
  }, [tuningMode]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const startTuner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const detectPitch = AMDF({ sampleRate: audioCtx.sampleRate });
      const buffer = new Float32Array(analyser.fftSize);

      const tick = () => {
        analyser.getFloatTimeDomainData(buffer);
        
        let sumSquares = 0;
        for (let i = 0; i < buffer.length; i++) {
          sumSquares += buffer[i] * buffer[i];
        }
        const rms = Math.sqrt(sumSquares / buffer.length);
        setVolume(rms);

        if (rms > 0.01) {
          const freq = detectPitch(buffer);
          if (freq && freq > 40 && freq < 1000) { 
            setPitch(freq);
            
            let midiNum = Math.round(12 * Math.log2(freq / 440)) + 69;
            
            if (tuningModeRef.current !== null) {
              midiNum = tuningModeRef.current;
            }

            const targetFreq = 440 * Math.pow(2, (midiNum - 69) / 12);
            const cents = 1200 * Math.log2(freq / targetFreq);
            
            const noteIndex = midiNum % 12;
            const octave = Math.floor(midiNum / 12) - 1;
            
            setNoteName(`${NOTE_STRINGS[noteIndex]}${octave}`);
            setCentsOff(cents);
          }
        }
        
        rafRef.current = requestAnimationFrame(tick);
      };

      tick();
      setIsActive(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access the microphone. Please grant permission.");
    }
  };

  const stopTuner = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (audioCtxRef.current) audioCtxRef.current.close();
    
    setIsActive(false);
    setPitch(null);
    setNoteName("--");
    setCentsOff(0);
    setVolume(0);
  };

  useEffect(() => {
    return () => stopTuner();
  }, []);

  const isInTune = Math.abs(centsOff) < 5 && pitch !== null;
  const dialRotation = Math.max(-45, Math.min(45, (centsOff / 50) * 45));

  let guidance: React.ReactNode = null;
  if (isActive) {
    if (!pitch) {
      guidance = <span className="text-zinc-900 dark:text-white">Pluck string to tune...</span>;
    } else if (isInTune) {
      guidance = (
        <motion.span 
          initial={{ scale: 0.95 }}
          animate={{ scale: 1.05 }}
          transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.5 }}
          className="text-zinc-900 dark:text-white"
        >
          <span className="text-green-400 font-bold">Perfectly</span> in tune
        </motion.span>
      );
    } else if (centsOff < -5) {
      guidance = <span className="text-zinc-900 dark:text-white"><span className="text-fuchsia-400 font-bold">Tighten</span> the string</span>;
    } else if (centsOff > 5) {
      guidance = <span className="text-zinc-900 dark:text-white"><span className="text-pink-400 font-bold">Loosen</span> the string</span>;
    }
  } else {
    guidance = (
      <span className="text-zinc-600 dark:text-zinc-400">
        Tap <span className="font-bold text-transparent bg-clip-text bg-[linear-gradient(to_right,#d946ef,#f472b6,#ffffff,#f472b6,#d946ef)] bg-[length:200%_auto] drop-shadow-[0_0_10px_rgba(217,70,239,0.6)]" style={{ animation: 'flow 2s linear infinite' }}>Start</span> to tune
      </span>
    );
  }

  return (
    <div className="relative rounded-[3rem] shadow-2xl w-full max-w-4xl mx-auto bg-white dark:bg-black/40 backdrop-blur-3xl shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] border border-black/10 dark:border-white/10">
      
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

      <div className="relative z-10 p-8 md:p-12 w-full flex flex-col items-center justify-center">
      
      {/* Background Glow */}
      <div className={`absolute inset-0 transition-all duration-300 pointer-events-none ${isInTune ? 'opacity-40 scale-110' : 'opacity-0 scale-100'}`}>
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-500/50 via-green-500/10 to-transparent mix-blend-screen blur-xl"></div>
      </div>

      {/* Guidance Top Text */}
      <div className="h-12 flex items-center justify-center mb-8 w-full pointer-events-none z-10">
         {guidance && (
            <motion.div 
               key={isInTune ? 'in-tune' : 'tuning'}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-2xl md:text-3xl tracking-wide font-light italic"
            >
               {guidance}
            </motion.div>
         )}
      </div>

      {/* Vertical Stack Layout: 100% robust, no absolute overlapping, no scale jitter */}
      <div className="flex flex-col items-center w-full max-w-lg mx-auto gap-10 z-10">
        
        {/* Center Dial */}
        <div className={`relative w-64 h-64 md:w-72 md:h-72 rounded-full border-[10px] bg-white dark:bg-black/80 flex flex-col items-center justify-center pointer-events-none flex-shrink-0 transition-all duration-300 ${isInTune ? 'border-green-500/50 shadow-[0_0_50px_rgba(34,197,94,0.3),inset_0_0_30px_rgba(34,197,94,0.2)]' : 'border-zinc-900 shadow-[inset_0_0_50px_rgba(0,0,0,1)]'}`}>
           <div className={`absolute inset-4 rounded-full border transition-colors duration-300 ${isInTune ? 'border-green-500/50' : 'border-zinc-800/50'}`}></div>
           
           {isActive && (
             <motion.div 
               className="absolute w-2 origin-bottom bottom-1/2 rounded-full z-20"
               style={{ backgroundColor: isInTune ? '#22c55e' : '#d946ef', height: '45%' }}
               animate={{ rotate: pitch ? dialRotation : 0 }}
               transition={{ type: "spring", stiffness: 300, damping: 20 }}
             >
               <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full ${isInTune ? 'bg-green-400' : 'bg-fuchsia-400'}`}></div>
             </motion.div>
           )}

           <div className="w-12 h-12 rounded-full border-black/10 dark:border-white/10 z-30 absolute border-4 border-zinc-900 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white dark:bg-black"></div>
           </div>

           {isActive ? (
             <>
               <div className="absolute top-10 md:top-12 flex flex-col items-center z-10">
                 <span className={`text-5xl md:text-6xl font-black tracking-tighter transition-colors ${isInTune ? 'text-green-400' : 'text-zinc-900 dark:text-white'}`}>
                   {noteName}
                 </span>
               </div>

               <div className="absolute bottom-14 md:bottom-16 flex gap-3 items-center z-10">
                  <div className="w-3 h-3 rounded-full border-black/10 dark:border-white/10"></div>
                  <div className={`w-4 h-4 rounded-full ${isInTune ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'border-black/10 dark:border-white/10'} transition-all`}></div>
                  <div className="w-3 h-3 rounded-full border-black/10 dark:border-white/10"></div>
               </div>
               
               <div className="absolute bottom-6 md:bottom-8 text-xs font-bold text-zinc-600 dark:text-zinc-400 tracking-widest uppercase">
                 {pitch ? `${Math.abs(centsOff).toFixed(1)} cents` : "Listening..."}
               </div>
             </>
           ) : (
             <motion.div 
                className="absolute inset-0 flex flex-col items-center justify-center z-10"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
             >
                <div className="absolute w-32 h-32 rounded-full border-2 border-dashed border-fuchsia-500/40 animate-[spin_8s_linear_infinite]"></div>
                <div className="absolute w-28 h-28 rounded-full border border-fuchsia-500/20 animate-[spin_12s_linear_infinite_reverse]"></div>
                
                <div className="w-3 h-3 rounded-full border-black/10 dark:border-white/10/50"></div>
             </motion.div>
           )}
        </div>

        {/* Universal String Pegs Row */}
        <div className="flex flex-nowrap items-center justify-center gap-2 md:gap-4 w-full relative z-50 pointer-events-auto">
           {GUITAR_STRINGS.slice(1).map((str, i) => {
             const isSelected = tuningMode === str.midi;
             return (
               <button
                 key={`peg-${i}`}
                 type="button"
                 onClick={() => setTuningMode(str.midi)}
                 className={`w-12 h-12 md:w-14 md:h-14 flex-shrink-0 flex items-center justify-center rounded-full font-black text-lg transition-colors duration-200 border-4 cursor-pointer focus:outline-none relative z-50 ${
                   isSelected 
                     ? 'bg-fuchsia-500 text-black border-fuchsia-400' 
                     : 'bg-white dark:bg-black text-zinc-600 dark:text-zinc-400 border-zinc-800 hover:border-fuchsia-500 hover:text-zinc-900 dark:text-white hover:bg-zinc-100 dark:bg-zinc-900 active:border-black/10 dark:border-white/10'
                 }`}
               >
                 {str.label}
               </button>
             );
           })}
        </div>

        {/* Bottom Controls */}
        <div className="flex w-full gap-4">
           <button
              type="button"
              onClick={() => setTuningMode(null)}
              className={`flex-1 flex justify-center py-4 rounded-xl font-black text-sm tracking-widest uppercase transition-colors duration-200 border-2 cursor-pointer focus:outline-none ${
                tuningMode === null 
                  ? 'bg-white text-black border-white' 
                  : 'bg-white dark:bg-black/50 text-zinc-600 dark:text-zinc-400 border-zinc-800 hover:bg-black/5 dark:bg-white/5 hover:border-zinc-400 hover:text-zinc-900 dark:text-white active:bg-white/20'
              }`}
           >
              Auto Detect
           </button>
           
           <button
             type="button"
             onClick={isActive ? stopTuner : startTuner}
             className={`flex-1 flex justify-center py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-colors duration-200 items-center gap-3 border-2 cursor-pointer focus:outline-none relative overflow-hidden ${
               isActive 
                 ? 'border-black/10 dark:border-white/10 text-zinc-900 dark:text-white hover:bg-text-muted border-zinc-600 active:bg-zinc-600' 
                 : 'bg-fuchsia-500 text-black border-fuchsia-400 hover:bg-fuchsia-400 active:bg-fuchsia-600'
             }`}
           >
             {!isActive && (
               <div className="absolute inset-0 bg-fuchsia-400/50 animate-pulse mix-blend-overlay"></div>
             )}
             <span className="relative z-10 flex items-center gap-3">
               {isActive ? <><MicOff className="w-5 h-5" /> Stop</> : <><Mic className="w-5 h-5" /> Start</>}
             </span>
           </button>
        </div>

      </div>

      {!isActive && (
        <p className="text-zinc-600 dark:text-zinc-400 text-xs mt-6 text-center font-light z-10 relative">
          Requires microphone permission. Processed locally.
        </p>
      )}

      </div>
    </div>
  );
}
