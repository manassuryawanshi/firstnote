"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const NOTES = ["♪", "♫", "♬", "♩", "♭", "♮", "♯"];

export default function WaterfallNotes() {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      note: NOTES[Math.floor(Math.random() * NOTES.length)],
      duration: 10 + Math.random() * 20,
      delay: Math.random() * -20, // Negative delay so they start already flowing
      size: 1 + Math.random() * 2,
      blur: Math.random() * 4
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute top-[-10%] text-green-500/40 font-serif drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]"
          style={{ 
            left: `${p.x}%`, 
            fontSize: `${p.size}rem`,
            filter: `blur(${p.blur}px)`
          }}
          animate={{
            y: ["0vh", "120vh"],
            opacity: [0, 1, 0],
            rotate: [0, Math.random() * 360]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        >
          {p.note}
        </motion.div>
      ))}
    </div>
  );
}
