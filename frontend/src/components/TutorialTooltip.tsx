"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTutorial } from "@/context/TutorialContext";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import React from "react";

interface TutorialTooltipProps {
  step: number;
  title: string;
  description: React.ReactNode;
  icon?: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
  totalSteps?: number;
}

export default function TutorialTooltip({ 
  step, 
  title, 
  description, 
  icon, 
  position = "top",
  className = "",
  totalSteps = 6
}: TutorialTooltipProps) {
  const { tutorialStep, nextStep, prevStep, completeTutorial } = useTutorial();

  if (tutorialStep !== step) return null;

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-4",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-4",
    left: "right-full top-1/2 -translate-y-1/2 mr-4",
    right: "left-full top-1/2 -translate-y-1/2 ml-4",
  };

  const arrowClasses = {
    top: "absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-black/80 border-b border-r border-amber-500/50 rotate-45",
    bottom: "absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-black/80 border-t border-l border-amber-500/50 rotate-45",
    left: "absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-black/80 border-t border-r border-amber-500/50 rotate-45",
    right: "absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-black/80 border-b border-l border-amber-500/50 rotate-45",
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`absolute ${positionClasses[position]} normal-case tracking-normal bg-black/80 backdrop-blur-xl border border-amber-500/50 rounded-2xl p-5 shadow-[0_0_30px_rgba(245,158,11,0.3)] flex flex-col gap-4 w-[320px] z-[70] ${className}`}
      >
        <div className="flex items-start justify-between gap-3">
           <div className="flex items-center gap-3">
              {icon && (
                 <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                    {icon}
                 </div>
              )}
              <div className="text-sm font-bold text-white text-left">
                 {title}
              </div>
           </div>
           <button 
              onClick={completeTutorial}
              className="text-zinc-400 hover:text-white transition-colors"
           >
              <X className="w-4 h-4" />
           </button>
        </div>

        <div className="text-sm text-zinc-300 font-normal text-left">
           {description}
        </div>

        <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/10">
           <div className="text-xs text-zinc-500 font-medium">
              Step {step} of {totalSteps}
           </div>
           <div className="flex items-center gap-2">
              <button 
                 onClick={prevStep}
                 disabled={step === 1}
                 className="p-1.5 rounded-full hover:bg-white/10 text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                 <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                 onClick={step === totalSteps ? completeTutorial : nextStep}
                 className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-full transition-colors"
              >
                 {step === totalSteps ? 'Finish' : 'Next'}
              </button>
           </div>
        </div>

        <div className={arrowClasses[position]}></div>
      </motion.div>
    </AnimatePresence>
  );
}
