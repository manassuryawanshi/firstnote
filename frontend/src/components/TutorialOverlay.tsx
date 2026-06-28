"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTutorial } from "@/context/TutorialContext";

export default function TutorialOverlay({ activeSteps }: { activeSteps: number[] }) {
  const { tutorialStep, completeTutorial } = useTutorial();
  const isActive = activeSteps.includes(tutorialStep);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-black/80 z-[45] flex items-end justify-center pb-12 pointer-events-auto"
        >
           <button 
              onClick={completeTutorial}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/20 transition-all font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)] pointer-events-auto"
           >
              Skip Tour
           </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
