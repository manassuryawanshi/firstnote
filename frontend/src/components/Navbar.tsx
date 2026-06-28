"use client";

import { useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { Activity } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTutorial } from "@/context/TutorialContext";
import TutorialTooltip from "@/components/TutorialTooltip";

export default function Navbar() {
  const { scrollY } = useScroll();
  const pathname = usePathname();
  const { tutorialStep, setTutorialStep, completeTutorial } = useTutorial();
  
  const [hidden, setHidden] = useState(false);
  
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    // Don't hide the navbar during the tutorial
    if (tutorialStep > 0 && tutorialStep <= 6) {
      setHidden(false);
      return;
    }
    
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });
  
  // Navigation styles change on scroll
  const navBackground = useTransform(scrollY, [0, 100], ["rgba(0, 0, 0, 0.1)", "rgba(0, 0, 0, 0.4)"]);
  const navBorder = useTransform(scrollY, [0, 100], ["rgba(255, 255, 255, 0.08)", "rgba(255, 255, 255, 0.15)"]);

  const navLinks = [
    { name: "Home", href: "/", activeGradient: "text-transparent bg-clip-text bg-[linear-gradient(to_right,#ef4444,#f97316,#ffffff,#f97316,#ef4444)] bg-[length:200%_auto] drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" },
    { name: "Piano", href: "/piano", activeGradient: "text-transparent bg-clip-text bg-[linear-gradient(to_right,#22c55e,#4ade80,#ffffff,#4ade80,#22c55e)] bg-[length:200%_auto] drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]" },
    { name: "Guitar", href: "/guitar", activeGradient: "text-transparent bg-clip-text bg-[linear-gradient(to_right,#d946ef,#f472b6,#ffffff,#f472b6,#d946ef)] bg-[length:200%_auto] drop-shadow-[0_0_15px_rgba(217,70,239,0.8)]" },
    { name: "Library", href: "/library", activeGradient: "text-transparent bg-clip-text bg-[linear-gradient(to_right,#06b6d4,#3b82f6,#ffffff,#3b82f6,#06b6d4)] bg-[length:200%_auto] drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" },
  ];

  return (
    <motion.div 
      variants={{ visible: { y: 0 }, hidden: { y: "-150%" } }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={`fixed top-6 left-0 right-0 hidden md:flex justify-center px-4 pointer-events-none ${tutorialStep >= 4 ? 'z-[60]' : 'z-50'}`}
    >
      <motion.nav 
        style={{ backgroundColor: navBackground, borderColor: navBorder, backdropFilter: "blur(40px) saturate(200%)" }}
        className="pointer-events-auto flex items-center justify-between px-6 py-3 transition-all duration-300 border rounded-full w-full max-w-5xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
      >
        <Link href="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-orange-600 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)] group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white group-hover:text-zinc-300 transition-colors">FirstNote</span>
        </Link>
        <div className="flex items-center gap-4 md:gap-12 text-[10px] sm:text-xs font-bold tracking-[0.1em] md:tracking-[0.2em] uppercase text-zinc-400">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            
            let tooltip = null;
            if (link.name === "Home") {
               tooltip = <TutorialTooltip step={3} title="Global Navigation" description="This navbar gives you access to all sections. Let's explore the main areas!" position="bottom" />;
            }

            return (
              <div key={link.name} className="relative">
                 {tooltip}
                 <Link 
                   href={link.href} 
                   onClick={() => { if (tutorialStep > 0) completeTutorial(); }}
                   className={`transition-all duration-300 relative px-2 py-1 rounded-md ${isActive ? link.activeGradient : 'text-zinc-400 hover:text-white hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]'} ${tutorialStep >= 3 ? 'z-[70]' : ''}`}
                   style={isActive ? { animation: 'flow 2s linear infinite' } : {}}
                 >
                   {link.name}
                 </Link>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-4">
           <Link href="/#piano-suite-section" className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest bg-white/10 border border-white/20 text-white rounded-full hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 backdrop-blur-md">
             Explore
           </Link>
        </div>
      </motion.nav>
    </motion.div>
  );
}
