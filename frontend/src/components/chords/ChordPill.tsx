"use client";

import React, { useState, useRef, useEffect } from "react";
import ChordDiagramTooltip, { getPiano, getGuitar } from "./ChordDiagramTooltip";
import { AnimatePresence, motion } from "framer-motion";

interface ChordPillProps {
  chord: string;
}

export default function ChordPill({ chord }: ChordPillProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState<"top" | "bottom">("top");
  const [horizontalAlign, setHorizontalAlign] = useState<"center" | "left" | "right">("center");
  const containerRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const scrollParent =
        containerRef.current.closest(".custom-scrollbar") ||
        containerRef.current.closest("div[class*='overflow-y-auto']");
      const parentRect = scrollParent
        ? scrollParent.getBoundingClientRect()
        : { top: 0, bottom: window.innerHeight };

      const spaceAbove = rect.top - parentRect.top;
      const spaceBelow = parentRect.bottom - rect.bottom;

      // Tooltip height is ~340px
      if (spaceAbove < 340 && spaceBelow >= 260) {
        setPlacement("bottom");
      } else if (spaceBelow < 340 && spaceAbove >= 340) {
        setPlacement("top");
      } else if (spaceBelow >= spaceAbove) {
        setPlacement("bottom");
      } else {
        setPlacement("top");
      }

      // Check horizontal collision with screen edges (tooltip is 240px wide)
      const screenWidth = window.innerWidth;
      const pillCenter = rect.left + rect.width / 2;
      const tooltipHalfWidth = 125;

      if (pillCenter - tooltipHalfWidth < 12) {
        setHorizontalAlign("left");
      } else if (pillCenter + tooltipHalfWidth > screenWidth - 12) {
        setHorizontalAlign("right");
      } else {
        setHorizontalAlign("center");
      }
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    calculatePosition();
    setIsOpen(true);
    if (typeof window !== "undefined") {
      getGuitar();
      getPiano();
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 250);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    calculatePosition();
    setIsOpen(!isOpen);
    if (typeof window !== "undefined") {
      getGuitar();
      getPiano();
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside, { passive: true });
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const positionClasses = [
    placement === "bottom" ? "top-full mt-2" : "bottom-full mb-2",
    horizontalAlign === "left"
      ? "left-0"
      : horizontalAlign === "right"
      ? "right-0"
      : "left-1/2 -translate-x-1/2",
  ].join(" ");

  return (
    <span
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`relative inline-block my-0.5 mx-0.5 ${isOpen ? "z-[200]" : "z-0"}`}
    >
      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold font-mono tracking-wide text-orange-300 bg-orange-950/60 hover:bg-orange-500/25 border border-orange-500/40 hover:border-orange-300 hover:text-orange-200 transition-all cursor-pointer shadow-[0_0_14px_rgba(249,115,22,0.2)] group select-none">
        {chord}
      </span>

      {/* Hover & Tap Diagram Tooltip with auto-flip */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: placement === "bottom" ? -8 : 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: placement === "bottom" ? -6 : 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${positionClasses} z-[250]`}
          >
            <ChordDiagramTooltip chord={chord} />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
