"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import * as Tone from 'tone';
import { Midi } from '@tonejs/midi';
import { UploadCloud, Play, Square, Download, Sparkles, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Idle");
  const [progress, setProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus("Uploading...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/v1/session/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setTaskId(data.task_id);
      setStatus("Queued");
    } catch (error) {
      console.error(error);
      setStatus("Error uploading file");
    }
  };

  const handlePlay = async () => {
    if (isPlaying) {
      Tone.Transport.stop();
      Tone.Transport.cancel();
      synthRef.current?.releaseAll();
      setIsPlaying(false);
      return;
    }

    try {
      setIsPlaying(true);
      await Tone.start(); 
      
      if (!synthRef.current) {
        synthRef.current = new Tone.PolySynth(Tone.Synth, {
          envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 }
        }).toDestination();
      }
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/v1/session/download/${taskId}`);
      if (!response.ok) throw new Error("Failed to fetch audio");
      
      const arrayBuffer = await response.arrayBuffer();
      const midi = new Midi(arrayBuffer);
      const now = Tone.now() + 0.5;
      
      midi.tracks.forEach(track => {
        track.notes.forEach(note => {
          synthRef.current?.triggerAttackRelease(
            note.name, note.duration, note.time + now, note.velocity
          );
        });
      });
      
      setTimeout(() => {
        setIsPlaying(false);
      }, midi.duration * 1000 + 1000);
      
    } catch(e) {
      console.error("Playback error", e);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (taskId && status !== "Complete" && status !== "Error") {
      interval = setInterval(async () => {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const response = await fetch(`${API_URL}/api/v1/session/status/${taskId}`);
          const data = await response.json();
          
          setStatus(data.status);
          setProgress(data.progress || 0);

          if (data.status === "Complete" || data.status === "Error") {
            clearInterval(interval);
          }
        } catch (error) {
          console.error("Polling error", error);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [taskId, status]);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 items-stretch group/dashboard hover:scale-[1.01] transition-transform duration-500">
      
      {/* Instructions Pane */}
      <div className="flex-[1] bg-white/[0.02] backdrop-blur-md border border-black/10 dark:border-white/10 p-8 md:p-12 rounded-[2rem] flex flex-col justify-center shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-[80px] pointer-events-none"></div>
        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-10 flex items-center gap-3">
           <div className="w-1.5 h-8 bg-gradient-to-b from-amber-400 to-red-600 rounded-full"></div>
           Orchestration Workflow
        </h3>
        
        <div className="space-y-10 relative z-10">
           <div className="flex gap-5">
              <div className="w-10 h-10 rounded-full bg-red-950/80 border border-red-500/30 flex items-center justify-center text-red-400 font-bold shrink-0 shadow-[0_0_15px_rgba(220,38,38,0.2)]">1</div>
              <div>
                 <h4 className="text-zinc-900 dark:text-white font-semibold mb-2 text-lg">Provide Source MIDI</h4>
                 <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">Upload a raw, un-orchestrated melody line (.mid) to serve as the baseline.</p>
              </div>
           </div>
           
           <div className="flex gap-5">
              <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold shrink-0 transition-all duration-500 ${taskId && status !== 'Complete' ? 'bg-amber-950/80 border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-zinc-100 dark:bg-zinc-900/50 border-zinc-800 text-zinc-600'}`}>2</div>
              <div>
                 <h4 className={`font-semibold mb-2 text-lg transition-colors duration-500 ${taskId && status !== 'Complete' ? 'text-amber-400' : 'text-zinc-600 dark:text-zinc-400'}`}>Swarm Intelligence</h4>
                 <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">Agents extract tempo and key. PyTorch models predict mathematical harmonies.</p>
              </div>
           </div>

           <div className="flex gap-5">
              <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold shrink-0 transition-all duration-500 ${status === 'Complete' ? 'bg-green-950/80 border-green-500/50 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-zinc-100 dark:bg-zinc-900/50 border-zinc-800 text-zinc-600'}`}>3</div>
              <div>
                 <h4 className={`font-semibold mb-2 text-lg transition-colors duration-500 ${status === 'Complete' ? 'text-green-400' : 'text-zinc-600 dark:text-zinc-400'}`}>Review & Export</h4>
                 <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">Preview stems in-browser via Tone.js, or export directly to your DAW.</p>
              </div>
           </div>
        </div>
      </div>

      {/* Upload/Action Pane */}
      <div className="flex-[1.5] relative group/pane min-h-[450px]">
         {/* Transparent Glass Background */}
         <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-md rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.5)] pointer-events-none border border-black/10 dark:border-white/10"></div>
         
         {/* Static Dotted Gradient Border */}
         <svg className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500 group-hover/pane:opacity-0 z-10">
            <rect x="2" y="2" width="calc(100% - 4px)" height="calc(100% - 4px)" rx="32" fill="none" stroke="url(#dotted-gradient)" strokeWidth="2" strokeDasharray="8,8" strokeLinecap="round" />
            <defs>
               <linearGradient id="dotted-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="25%" stopColor="#f97316" />
                  <stop offset="50%" stopColor="#ffffff" />
                  <stop offset="75%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ef4444" />
               </linearGradient>
            </defs>
         </svg>

         {/* Hover Spinning Clockwise Full Border */}
         <div className="absolute inset-0 rounded-[2rem] p-[2px] pointer-events-none z-10 opacity-0 group-hover/pane:opacity-100 transition-opacity duration-500 overflow-hidden" style={{ WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }}>
             <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,#ef4444,#f97316,#ffffff,#f97316,#ef4444)] animate-[spin_3s_linear_infinite]"></div>
         </div>
         
         <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 md:p-12">
            
            <div className="absolute inset-0 cursor-pointer magnetic-zone rounded-[2rem] overflow-hidden" onClick={() => fileInputRef.current?.click()}>
               <div className="absolute inset-0 bg-gradient-to-br from-red-600/0 to-amber-500/0 pointer-events-none group-hover/pane:from-red-600/10 group-hover/pane:to-amber-500/5 transition-colors duration-700"></div>
               
               {/* Pulsing Radar Rings (Symmetrical around icon) */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-500/0 rounded-full blur-2xl group-hover/pane:bg-amber-500/10 transition-all duration-700 pointer-events-none"></div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-red-500/0 rounded-full group-hover/pane:border-red-500/30 group-hover/pane:scale-[3] group-hover/pane:opacity-0 transition-all duration-1000 ease-out pointer-events-none"></div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-amber-500/0 rounded-full group-hover/pane:border-amber-500/30 group-hover/pane:scale-[4] group-hover/pane:opacity-0 transition-all duration-1000 delay-100 ease-out pointer-events-none"></div>
               
               {/* Particles */}
               {[...Array(8)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    className="absolute w-1 h-1 bg-white rounded-full opacity-0 group-hover/pane:opacity-60 pointer-events-none shadow-[0_0_5px_white]" 
                    initial={{ top: `${20 + ((i * 3.7) % 1) * 60}%`, left: `${20 + ((i * 5.3) % 1) * 60}%`, y: 0 }}
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 2 + ((i * 1.7) % 1) * 2, repeat: Infinity, ease: "easeInOut" }}
                  />
               ))}

               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleFileChange} 
                 className="hidden" 
                 accept=".mid,.midi" 
               />
               
               {!file && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <UploadCloud className="w-20 h-20 text-zinc-600 mb-6 group-hover/pane:text-amber-400 group-hover/pane:scale-110 group-hover/pane:drop-shadow-[0_0_20px_rgba(249,115,22,1)] transition-all duration-500 relative z-10" />
                     <div className="text-center relative z-10">
                       <h4 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-600 group-hover/pane:from-white group-hover/pane:to-amber-200 transition-all duration-500 mb-2">Drop your MIDI here</h4>
                       <p className="text-zinc-600 group-hover/pane:text-amber-400/80 transition-colors duration-500">or click to browse files</p>
                     </div>
                  </div>
               )}
            </div>

            {/* Interactive State Area */}
            <div className="relative z-20 w-full max-w-lg flex flex-col items-center gap-6 pointer-events-auto">
               {file && status === "Idle" && (
                  <div className="text-center mb-4 pointer-events-none">
                    <p className="text-zinc-900 dark:text-white font-medium text-2xl mb-2">{file.name}</p>
                    <p className="text-amber-500 text-md">Ready to orchestrate</p>
                  </div>
               )}
               
               {file && !taskId && (
            <motion.button 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleUpload}
              className="px-8 py-4 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-zinc-900 dark:text-white font-bold rounded-full transition-all shadow-[0_0_20px_-5px_rgba(220,38,38,0.5)] flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Start Orchestration
            </motion.button>
          )}

          {taskId && status !== "Complete" && status !== "Error" && (
            <div className="w-full max-w-lg flex flex-col gap-4">
              <div className="flex justify-between items-center text-sm font-medium uppercase tracking-widest">
                <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  {status}
                </span>
                <span className="text-zinc-600 dark:text-zinc-400">{progress}%</span>
              </div>
              <div className="w-full bg-black/5 dark:bg-white/5 rounded-full h-1 overflow-hidden">
                <motion.div 
                  className="bg-amber-500 h-full rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                ></motion.div>
              </div>
            </div>
          )}

          {status === "Complete" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-lg flex flex-col gap-6 items-center bg-white dark:bg-black/50 border border-green-500/20 p-8 rounded-2xl shadow-[0_0_40px_-10px_rgba(74,222,128,0.1)]"
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-2 border border-green-500/20">
                  <Sparkles className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-green-400 text-xl font-bold tracking-tight">Generation Complete</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  The AI swarm has successfully analyzed and orchestrated your file.
                </p>
              </div>

              <div className="flex gap-3 w-full">
                <button 
                  onClick={handlePlay}
                  className="flex-1 bg-white hover:bg-zinc-200 text-black py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {isPlaying ? <><Square className="w-4 h-4" /> Stop</> : <><Play className="w-4 h-4" /> Play Audio</>}
                </button>
                <button 
                  onClick={() => {
                    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                    window.open(`${API_URL}/api/v1/session/download/${taskId}`, '_blank');
                  }}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-900 hover:border-black/10 dark:border-white/10 text-zinc-900 dark:text-white border border-zinc-700 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
              </div>

              <button 
                onClick={() => {
                  setTaskId(null);
                  setStatus("Idle");
                  setProgress(0);
                  setFile(null);
                }}
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white text-sm font-medium transition-colors"
              >
                Start over with a new file
              </button>
            </motion.div>
          )}
          
          {status === "Error" && (
             <div className="text-red-400 flex items-center gap-2 bg-red-950/50 px-4 py-3 rounded-lg border border-red-500/30">
               <AlertCircle className="w-5 h-5" />
               Something went wrong processing your file.
             </div>
          )}

            </div>
         </div>
      </div>
    </div>
  );
}
