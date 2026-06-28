"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
interface TutorialContextType {
  tutorialStep: number;
  setTutorialStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  completeTutorial: () => void;
  isTutorialActive: boolean;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);


export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [tutorialStep, setTutorialStepState] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    // Initialize from sessionStorage if exists
    if (typeof window !== "undefined") {
      const isCompleted = localStorage.getItem("grandTourCompleted");
      if (!isCompleted) {
        const savedStep = sessionStorage.getItem("tutorialStep");
        if (savedStep) {
          setTutorialStepState(parseInt(savedStep));
        } else {
          // Start step 1 after brief delay on very first load
          setTimeout(() => setTutorialStepState(1), 2000);
        }
      }
    }
  }, []);

  const setTutorialStep = (step: number) => {
    setTutorialStepState(step);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("tutorialStep", step.toString());
    }
  };

  const nextStep = () => {
    if (tutorialStep === 3) router.push('/piano');
    else if (tutorialStep === 4) router.push('/guitar');
    else if (tutorialStep === 5) router.push('/library');
    
    setTutorialStep(tutorialStep + 1);
  };

  const prevStep = () => {
    if (tutorialStep === 4) router.push('/');
    else if (tutorialStep === 5) router.push('/piano');
    else if (tutorialStep === 6) router.push('/guitar');
    
    setTutorialStep(Math.max(1, tutorialStep - 1));
  };

  const completeTutorial = () => {
    setTutorialStepState(0);
    if (typeof window !== "undefined") {
      localStorage.setItem("grandTourCompleted", "true");
      sessionStorage.removeItem("tutorialStep");
    }
    // Return user to home page on finish
    if (pathname !== "/") {
      router.push("/");
    }
  };

  const isTutorialActive = tutorialStep > 0;

  return (
    <TutorialContext.Provider value={{ tutorialStep, setTutorialStep, nextStep, prevStep, completeTutorial, isTutorialActive }}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
}
