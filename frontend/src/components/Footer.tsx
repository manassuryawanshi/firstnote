"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BookOpen, Mail, Piano, Layers, Music, Guitar, Sparkles } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Footer() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div className="w-full mt-auto">
      {/* MEET THE BUILDER */}
      {isHome && (
        <>
        {/* Section Differentiator */}
        <div className="w-full flex justify-center py-12 relative z-20 bg-black">
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-3/4 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"></div>
           </div>
           <div className="w-2 h-2 rounded-full bg-black border border-orange-500/30 z-10 shadow-[0_0_10px_rgba(249,115,22,0.2)]"></div>
        </div>
        
        <section className="relative w-full bg-black pb-32 pt-12 overflow-x-clip">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-amber-500/10 via-fuchsia-500/5 to-transparent blur-[150px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          
          {/* Apple-style massive headline with Bold/Thin combo & Moving Gradient */}
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl tracking-tight">
              <span className="font-bold text-white">Designed for </span>
              <span className="font-light italic text-transparent bg-clip-text bg-[linear-gradient(to_right,#ef4444,#f97316,#ffffff,#f97316,#ef4444)] bg-[length:200%_auto] drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]" style={{ animation: 'flow 2s linear infinite' }}>artists.</span>
            </h2>
            <h2 className="text-5xl md:text-7xl tracking-tight mt-2">
              <span className="font-bold text-zinc-500">Engineered by </span>
              <span className="font-light italic text-white">one.</span>
            </h2>
          </div>

          {/* Ultra-clean Frosted Glass Container */}
          <div className="w-full bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-[40px] p-8 md:p-16 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden relative">
            
            {/* Very subtle colorful background glow inside the card for depth */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/5 to-fuchsia-500/5 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center gap-12 md:gap-20">
              
              {/* Left: Crisp, clean Avatar with floating halo */}
              <motion.div 
                animate={{ y: [-8, 8, -8] }} 
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="flex-shrink-0 relative group/avatar cursor-pointer"
              >
                {/* Soft Orange Halo */}
                <div className="absolute -inset-6 rounded-full bg-orange-500/20 blur-3xl group-hover/avatar:bg-orange-500/40 transition-colors duration-700"></div>
                
                <div className="w-56 h-56 md:w-72 md:h-72 rounded-full bg-zinc-800 overflow-hidden shadow-[0_0_50px_rgba(249,115,22,0.3)] group-hover/avatar:shadow-[0_0_80px_rgba(249,115,22,0.5)] ring-2 ring-orange-500/20 relative z-10 transition-transform duration-700 group-hover/avatar:scale-105">
                  <img src="/manas.png" alt="Manas Suryawanshi" className="w-full h-full object-cover" />
                </div>
              </motion.div>
              
              {/* Right: Structured, highly legible typography */}
              <div className="flex-grow text-center md:text-left space-y-8">
                
                <div className="space-y-1">
                  <h4 className="text-amber-500 font-bold tracking-[0.3em] text-[10px] uppercase">A Note from the Creator</h4>
                  <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Manas Suryawanshi</h3>
                </div>
                
                <div className="text-zinc-400 text-lg md:text-xl leading-relaxed font-normal space-y-6 max-w-2xl">
                  <p>
                    Hey. I'm Manas. By day, I'm a software and AI engineer, but at my core, I'm simply a musician. I play guitar, sing, compose, and perform with my band, <span className="text-white font-medium">Gati</span>.
                  </p>
                  <p>
                    FirstNote was born out of my own frustrations. I wanted a platform that visualized the beautiful, mathematical geometry of the fretboard and keyboard in a way that actually made sense to an artist. 
                  </p>
                  <p>
                    This project bridges the gap between complex engineering and raw musical creativity. I hope it helps you unlock your musical potential, just as building it has unlocked mine. 
                  </p>
                </div>

                {/* Vibrant Themed Apple-style buttons */}
                <div className="flex justify-center md:justify-start flex-wrap gap-4 pt-4">
                  <a href="https://github.com/manassuryawanshi" target="_blank" className="flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-800/80 text-white font-medium border border-white/10 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 hover:border-orange-400 hover:text-black hover:-translate-y-1 active:scale-95 transition-all duration-300 backdrop-blur-md hover:shadow-[0_10px_20px_rgba(249,115,22,0.4)]">
                    <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"></path></svg> GitHub
                  </a>
                  <a href="https://www.linkedin.com/in/manas-suryawanshi-623473242/" target="_blank" className="flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-800/80 text-white font-medium border border-white/10 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 hover:border-orange-400 hover:text-black hover:-translate-y-1 active:scale-95 transition-all duration-300 backdrop-blur-md hover:shadow-[0_10px_20px_rgba(249,115,22,0.4)]">
                    <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg> LinkedIn
                  </a>
                  <a href="mailto:manassuryawanshi29@gmail.com" className="flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-800/80 text-white font-medium border border-white/10 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 hover:border-orange-400 hover:text-black hover:-translate-y-1 active:scale-95 transition-all duration-300 backdrop-blur-md hover:shadow-[0_10px_20px_rgba(249,115,22,0.4)]">
                    <Mail className="w-4 h-4" /> Email
                  </a>
                </div>

              </div>
            </div>
          </div>
          
        </div>
      </section>
      </>
      )}

      {/* GLOBAL FOOTER */}
      <footer className="w-full bg-black border-t border-white/5 py-16 relative pb-28 md:pb-0">
        <div className="max-w-7xl mx-auto px-6 md:px-16 grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h3 className="text-2xl font-black text-white tracking-tighter flex items-center gap-2">
              <Activity className="w-6 h-6 text-emerald-500" /> FirstNote.
            </h3>
            <p className="text-zinc-500 text-sm max-w-sm">
              The premium, interactive suite for modern musicians, producers, and theory enthusiasts.
            </p>
          </div>
          
          {/* Suites */}
          <div className="space-y-4">
            <h4 className="text-white font-bold tracking-widest text-xs uppercase">The Suites</h4>
            <ul className="space-y-3">
              <li><Link href="/piano" className="text-zinc-500 hover:text-emerald-400 transition-colors text-sm">Piano Sandbox</Link></li>
              <li><Link href="/guitar" className="text-zinc-500 hover:text-fuchsia-400 transition-colors text-sm">Guitar Toolkit</Link></li>
              <li><Link href="/library" className="text-zinc-500 hover:text-cyan-400 transition-colors text-sm">Theory Library</Link></li>
            </ul>
          </div>
          
          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-white font-bold tracking-widest text-xs uppercase">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-zinc-500 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-zinc-500 hover:text-white transition-colors text-sm">Terms of Service</Link></li>
              <li><Link href="/cookies" className="text-zinc-500 hover:text-white transition-colors text-sm">Cookie Policy</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h4 className="text-white font-bold tracking-widest text-xs uppercase">Connect</h4>
            <div className="flex gap-4">
              <a href="mailto:manassuryawanshi29@gmail.com" className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-colors">
                <Mail className="w-4 h-4" />
              </a>
              <a href="https://github.com/manassuryawanshi" target="_blank" className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-colors">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"></path></svg>
              </a>
              <a href="https://www.linkedin.com/in/manas-suryawanshi-623473242/" target="_blank" className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-colors">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-16 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-xs">© {new Date().getFullYear()} FirstNote Architecture. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors">Privacy</Link>
            <Link href="/terms" className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors">Terms</Link>
            <div className="flex items-center gap-2 text-zinc-600 text-xs border-l border-zinc-800 pl-6">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> System Operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
