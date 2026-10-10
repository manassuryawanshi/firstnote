"use client";

import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Search, Sparkles, Piano, Guitar, BookOpen, ArrowRight, Music, Layers, Activity, Cable, Clapperboard, AudioLines, Zap, CircleDashed, Code, Globe, Mail, ChevronDown, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const BackgroundScene = dynamic(() => import("@/components/BackgroundScene"), { ssr: false });
import { useTutorial } from "@/context/TutorialContext";
import TutorialOverlay from "@/components/TutorialOverlay";
import TutorialTooltip from "@/components/TutorialTooltip";
import SongSheetModal from "@/components/chords/SongSheetModal";
import ChordPill from "@/components/chords/ChordPill";

import { searchTheoryAndConcepts, TheorySearchResult } from "@/lib/theory-search";

const ROTATING_WORDS = ["Musicians", "Artists", "Composers", "Creators", "Audiophiles"];
const SEARCH_PROMPTS = [
  "Search 'Hotel California'...",
  "Search 'Creep' chords...",
  "Search 'Cmaj7' or 'Asus2'...",
  "Search 'Circle of Fifths'...",
  "Search 'Guitar Tuner'...",
  "Search 'ii-V-I progression'...",
  "Search 1.5M+ songs...",
];

const getPseudoRandom = (seed: number) => {
   const x = Math.sin(seed++) * 10000;
   return x - Math.floor(x);
};

export default function Home() {
  const [text, setText] = useState("Artists");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  
  const [placeholderText, setPlaceholderText] = useState("");
  const [isDeletingPlaceholder, setIsDeletingPlaceholder] = useState(false);
  const [placeholderLoopNum, setPlaceholderLoopNum] = useState(0);

  const [isMounted, setIsMounted] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { tutorialStep } = useTutorial();
  const [searchQuery, setSearchQuery] = useState("");
  const [theoryResults, setTheoryResults] = useState<TheorySearchResult[]>([]);
  const [songResults, setSongResults] = useState<any[]>([]);
  const [searchFilter, setSearchFilter] = useState<"all" | "theory" | "songs">("all");
  const [isSearchingSongs, setIsSearchingSongs] = useState(false);
  const [selectedSongUrl, setSelectedSongUrl] = useState<string | null>(null);
  const [selectedSongTitle, setSelectedSongTitle] = useState("");
  const [selectedSongArtist, setSelectedSongArtist] = useState("");
  const [isSongModalOpen, setIsSongModalOpen] = useState(false);
  const router = useRouter();

  // Scroll indicators and layout logic
  const { scrollY } = useScroll();
  const indicatorOpacity = useTransform(scrollY, [0, 100], [1, 0]);

  // Command Hub Hover State
  const [isIslandHovered, setIsIslandHovered] = useState(false);
  const [hoveredToolIndex, setHoveredToolIndex] = useState<number | null>(null);

  // Close search and quick tools on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const searchContainer = document.getElementById("search-island-container");
      const quickToolsContainer = document.getElementById("command-hub");
      
      if (searchContainer && !searchContainer.contains(e.target as Node)) {
        setIsSearchFocused(false);
        const active = document.activeElement as HTMLElement | null;
        if (active && searchContainer.contains(active)) {
          active.blur();
        }
      }
      
      if (quickToolsContainer && !quickToolsContainer.contains(e.target as Node)) {
        setIsIslandHovered(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);
  
  const { setTutorialStep, completeTutorial } = useTutorial();

  useEffect(() => {
    if (!searchQuery.trim()) {
      setTheoryResults([]);
      setSongResults([]);
      return;
    }
    
    // 1. Instant 0ms Theory, Tools & Chord Analysis
    const matchedTheory = searchTheoryAndConcepts(searchQuery);
    setTheoryResults(matchedTheory);

    // 2. Fetch Song Chords with Debounce
    setIsSearchingSongs(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const chordRes = await fetch(`/api/chords/search?q=${encodeURIComponent(searchQuery)}`);
        if (chordRes.ok) {
          const chordData = await chordRes.json();
          setSongResults(chordData.results || []);
        }
      } catch (err) {
        console.error("Chord search error", err);
      } finally {
        setIsSearchingSongs(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    setIsMounted(true);
    
    // Auto-expand Dynamic Island on first load
    const expandTimeout = setTimeout(() => {
      setIsIslandHovered(true);
      setTimeout(() => setIsIslandHovered(false), 2000);
    }, 1000);
    
    return () => clearTimeout(expandTimeout);
  }, []);

  // Linear tutorial logic removed auto-advance to prevent skipping
  // Main Hero Typewriter
  useEffect(() => {
    if (!isMounted) return;
    const typingSpeed = isDeleting ? 50 : 100;
    const currentWord = ROTATING_WORDS[loopNum % ROTATING_WORDS.length] + ".";
    const handleTyping = () => {
      setText(isDeleting ? currentWord.substring(0, text.length - 1) : currentWord.substring(0, text.length + 1));
      if (!isDeleting && text === currentWord) setTimeout(() => setIsDeleting(true), 2000);
      else if (isDeleting && text === "") { setIsDeleting(false); setLoopNum(loopNum + 1); }
    };
    const timeout = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timeout);
  }, [text, isDeleting, loopNum, isMounted]);

  // Placeholder Typewriter
  useEffect(() => {
    if (!isMounted) return;
    const typingSpeed = isDeletingPlaceholder ? 40 : 80;
    const currentWord = SEARCH_PROMPTS[placeholderLoopNum % SEARCH_PROMPTS.length];
    const handleTyping = () => {
      setPlaceholderText(isDeletingPlaceholder ? currentWord.substring(0, placeholderText.length - 1) : currentWord.substring(0, placeholderText.length + 1));
      if (!isDeletingPlaceholder && placeholderText === currentWord) setTimeout(() => setIsDeletingPlaceholder(true), 3000);
      else if (isDeletingPlaceholder && placeholderText === "") { setIsDeletingPlaceholder(false); setPlaceholderLoopNum(placeholderLoopNum + 1); }
    };
    const timeout = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timeout);
  }, [placeholderText, isDeletingPlaceholder, placeholderLoopNum, isMounted]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-black text-white relative overflow-x-hidden pt-24">
      
      {/* 3D Background */}
      <div className="absolute top-0 inset-x-0 z-0 opacity-50 h-[100vh] pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 60%, transparent 100%)' }}>
        {isMounted && (
          <BackgroundScene />
        )}
      </div>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 w-full text-center pb-[35vh]">
        <TutorialOverlay activeSteps={[1, 2, 3]} />
        <h1 className="text-[2rem] min-[360px]:text-[2.25rem] min-[390px]:text-4xl sm:text-6xl md:text-7xl lg:text-[6.5rem] tracking-tighter text-center leading-[0.95] sm:leading-[0.9] mb-4 sm:mb-6 px-4 whitespace-normal md:whitespace-nowrap">
          <span className="font-extrabold text-white block mb-1 sm:mb-0 whitespace-nowrap">The ultimate toolkit.</span>
          <div className="flex items-center justify-center whitespace-nowrap">
            <span className="font-extrabold text-white mr-2.5 sm:mr-4">for </span>
            <span className="italic font-light text-transparent bg-clip-text bg-[linear-gradient(to_right,#ef4444,#f97316,#ffffff,#f97316,#ef4444)] bg-[length:200%_auto] pr-1.5 sm:pr-2 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]" style={{ animation: 'flow 2s linear infinite' }}>
              {text}
            </span>
            <span 
              className="inline-block w-[3px] sm:w-[4px] lg:w-[5px] h-[0.82em] bg-white rounded-[1px] align-baseline animate-cursor-blink"
              style={{ animation: 'cursorBlink 0.75s step-end infinite' }}
              aria-hidden="true"
            ></span>
          </div>
        </h1>

        {/* Hero Supporting Subtitle */}
        <p className="text-[15px] sm:text-lg md:text-[19px] text-zinc-200 font-normal max-w-[760px] mx-auto mb-6 sm:mb-7 px-4 leading-[1.5] tracking-normal text-center [text-wrap:balance]">
          Song chords, piano progressions, guitar tools, and music theory—all in one place.
        </p>

        {/* Feature Callout Pill */}
        <div className="flex flex-col items-center mb-8 sm:mb-10 max-w-2xl px-4 text-center">
          {/* Song Chords & Lyrics Engine Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-fuchsia-500/10 via-amber-500/10 to-cyan-500/10 border border-white/10 hover:border-white/20 text-zinc-300 text-[11px] sm:text-xs font-medium backdrop-blur-md shadow-lg shadow-black/40 transition-colors flex-wrap justify-center">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-fuchsia-400 animate-pulse shrink-0"></span>
            <span className="tracking-wide text-zinc-200">
              Song Chords<span className="hidden sm:inline"> &amp; Synced Lyrics</span>
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">100% Ad-Free</span>
            <span className="text-zinc-600">•</span>
            <span className="text-amber-300/90 font-medium">
              <span className="hidden sm:inline">1-Click </span>Transpose
            </span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div id="global-search-bar" className={`relative w-full max-w-2xl group ${tutorialStep === 1 ? 'z-[60]' : 'z-50'}`}>
          
          <TutorialTooltip 
            step={1}
            title="Global AI Search"
            description="Our advanced vector search agent can find concepts, tools, and courses instantly. No need to click around!"
            icon={<Sparkles className="w-4 h-4 text-amber-400" />}
            position="top"
          />

        <div className="relative z-50 pointer-events-auto" id="search-island-container">
          {/* Animated Background Glow */}
          <motion.div 
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className={`absolute inset-0 bg-[linear-gradient(to_right,#4f46e5,#f97316,#d946ef,#4f46e5)] bg-[length:200%_auto] rounded-full blur-xl transition-opacity duration-700 ${tutorialStep === 1 ? 'opacity-80 animate-pulse' : 'opacity-40 group-hover:opacity-70'}`}
          ></motion.div>
          <div className={`relative bg-black/60 backdrop-blur-md border ${(isSearchFocused || tutorialStep === 1) ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)] z-[60]' : 'border-white/10 shadow-2xl'} rounded-full px-5 sm:px-8 py-3.5 sm:py-5 flex items-center gap-2.5 sm:gap-4 transition-all duration-500`}>
            <Sparkles className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 transition-colors duration-500 ${isSearchFocused ? 'text-amber-400 animate-pulse' : 'text-zinc-600'}`} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && songResults.length > 0) {
                  setSelectedSongUrl(songResults[0].tab_url);
                  setSelectedSongTitle(songResults[0].song_name);
                  setSelectedSongArtist(songResults[0].artist_name);
                  setIsSongModalOpen(true);
                  setIsSearchFocused(false);
                }
              }}
              placeholder={placeholderText} 
              className="bg-transparent border-none outline-none flex-1 min-w-0 text-base sm:text-xl text-white placeholder-zinc-400 font-medium tracking-wide caret-white"
              onFocus={() => setIsSearchFocused(true)}
            />
            {searchQuery ? (
              <div className="flex gap-1.5 shrink-0 items-center justify-center">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            ) : (
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-400 shrink-0 cursor-pointer hover:text-white transition-colors" />
            )}
          </div>
          
          {/* Enhanced Search Dropdown with Song Chords & Theory Tools */}
          <AnimatePresence>
            {/* Feature Explorer Showcase when focused with empty search */}
            {isSearchFocused && searchQuery.trim().length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-4 bg-[#0a0a0c]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden p-4 z-50 text-left"
              >
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2.5 px-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Explore Chordyn Features
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">1.5M+ Catalog &amp; Theory</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => setSearchQuery("Hotel California")}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-orange-500/30 text-left transition-all group flex items-start gap-3 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Music className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-orange-300 transition-colors">
                        Song Chords &amp; Synced Lyrics
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Try <span className="text-zinc-300 underline underline-offset-2">Hotel California</span>, <span className="text-zinc-300 underline underline-offset-2">Creep</span>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setSearchQuery("Cmaj7")}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/30 text-left transition-all group flex items-start gap-3 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Piano className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                        Piano &amp; Guitar Voicings
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Try <span className="text-zinc-300 underline underline-offset-2">Cmaj7</span>, <span className="text-zinc-300 underline underline-offset-2">Asus2</span>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setSearchQuery("Circle of Fifths")}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/30 text-left transition-all group flex items-start gap-3 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        Music Theory &amp; Scales
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Try <span className="text-zinc-300 underline underline-offset-2">Circle of Fifths</span>, <span className="text-zinc-300 underline underline-offset-2">Dorian</span>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setSearchQuery("Guitar Tuner")}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-500/30 text-left transition-all group flex items-start gap-3 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Guitar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                        Interactive Studio Tools
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Try <span className="text-zinc-300 underline underline-offset-2">Guitar Tuner</span>, <span className="text-zinc-300 underline underline-offset-2">Sandbox</span>
                      </div>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Results Dropdown when typing */}
            {isSearchFocused && searchQuery.trim().length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-4 bg-[#0a0a0c]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden max-h-[520px] overflow-y-auto custom-scrollbar z-50 text-left"
              >
                {/* Filter Tabs Header */}
                {(theoryResults.length > 0 || songResults.length > 0) && (
                  <div className="flex items-center gap-1.5 p-3 pb-2.5 border-b border-white/10 bg-black/40">
                    <button
                      onClick={() => setSearchFilter("all")}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        searchFilter === "all"
                          ? "bg-white/15 text-white border border-white/20 shadow-sm"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      All ({theoryResults.length + songResults.length})
                    </button>
                    {theoryResults.length > 0 && (
                      <button
                        onClick={() => setSearchFilter("theory")}
                        className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          searchFilter === "theory"
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                            : "text-zinc-400 hover:text-cyan-300"
                        }`}
                      >
                        <Sparkles className="w-3 h-3 text-cyan-400" /> Theory & Concepts ({theoryResults.length})
                      </button>
                    )}
                    {songResults.length > 0 && (
                      <button
                        onClick={() => setSearchFilter("songs")}
                        className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          searchFilter === "songs"
                            ? "bg-orange-500/20 text-orange-300 border border-orange-500/30 shadow-sm"
                            : "text-zinc-400 hover:text-orange-300"
                        }`}
                      >
                        <Music className="w-3 h-3 text-orange-400" /> Songs ({songResults.length})
                      </button>
                    )}
                  </div>
                )}

                {/* 1. Theory Concepts & Tools (Instant 0ms) */}
                {(searchFilter === "all" || searchFilter === "theory") && theoryResults.length > 0 && (
                  <div className="p-3 border-b border-white/10">
                    <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase text-cyan-400 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Theory, Concepts & Tools
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">Instant Result</span>
                    </div>
                    <div className="space-y-1.5 mt-1">
                      {theoryResults.map((result, i) => {
                        const isChord = result.type === "chord";

                        if (isChord) {
                          return (
                            <div
                              key={`theory-${i}`}
                              className="w-full text-left p-4 rounded-2xl transition-all border bg-gradient-to-br from-amber-500/[0.08] via-[#141210] to-black border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.08)] mb-2"
                            >
                              <div className="flex items-start justify-between gap-3 mb-2.5">
                                <div className="flex items-center gap-3">
                                  <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shrink-0">
                                    <Music className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                                      Verified Chord Formula
                                    </div>
                                    <div className="text-lg font-black text-amber-200">
                                      {result.title}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-semibold font-mono">
                                  {result.subtitle.split("•")[0]?.trim()}
                                </span>
                              </div>

                              {result.snippetHtml && (
                                <div
                                  className="text-xs text-zinc-300 font-mono mb-3 bg-black/50 px-3 py-1.5 rounded-xl border border-white/5"
                                  dangerouslySetInnerHTML={{ __html: result.snippetHtml }}
                                />
                              )}

                              {/* Dual Piano & Guitar Buttons with Auto-Selection */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/10">
                                <Link
                                  href={result.pianoHref || "/piano"}
                                  onClick={() => setIsSearchFocused(false)}
                                  className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 transition-all group/piano cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover/piano:scale-110 transition-transform">
                                      <Piano className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                      <div className="text-xs font-bold leading-none">Piano Suite</div>
                                      <div className="text-[10px] text-zinc-400 font-medium mt-0.5">Auto-selects keys & voicings</div>
                                    </div>
                                  </div>
                                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover/piano:translate-x-1 transition-transform" />
                                </Link>

                                <Link
                                  href={result.guitarHref || "/guitar"}
                                  onClick={() => setIsSearchFocused(false)}
                                  className="flex items-center justify-between p-2.5 rounded-xl bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-300 hover:text-fuchsia-200 transition-all group/guitar cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(217,70,239,0.25)]"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div className="p-1 rounded-lg bg-fuchsia-500/20 text-fuchsia-400 group-hover/guitar:scale-110 transition-transform">
                                      <Guitar className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                      <div className="text-xs font-bold leading-none">Guitar Suite</div>
                                      <div className="text-[10px] text-zinc-400 font-medium mt-0.5">Auto-selects fretboard & CAGED</div>
                                    </div>
                                  </div>
                                  <ArrowRight className="w-3.5 h-3.5 text-fuchsia-400 group-hover/guitar:translate-x-1 transition-transform" />
                                </Link>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <Link
                            key={`theory-${i}`}
                            href={result.href}
                            onClick={() => setIsSearchFocused(false)}
                            className="w-full block text-left p-3.5 rounded-2xl transition-all border group hover:bg-white/10 border-transparent hover:border-cyan-500/30"
                          >
                            <div className="flex items-start gap-3.5">
                              <div
                                className={`mt-0.5 p-2.5 rounded-xl ${result.color} border border-white/10 shrink-0`}
                              >
                                {result.icon === "piano" && <Piano className="w-5 h-5 text-emerald-400" />}
                                {result.icon === "guitar" && <Guitar className="w-5 h-5 text-fuchsia-400" />}
                                {result.icon === "book" && <BookOpen className="w-5 h-5 text-cyan-400" />}
                                {result.icon === "music" && <Music className="w-5 h-5 text-amber-400" />}
                                {result.icon === "search" && <Search className="w-5 h-5 text-fuchsia-400" />}
                                {result.icon === "sparkles" && <Sparkles className="w-5 h-5 text-amber-400" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="text-[10px] font-bold text-cyan-400 mb-0.5 tracking-widest uppercase truncate">
                                    {result.subtitle}
                                  </div>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 font-medium">
                                    {result.category}
                                  </span>
                                </div>
                                <div
                                  className="text-base font-bold transition-colors truncate text-white group-hover:text-cyan-400"
                                >
                                  {result.title}
                                </div>
                                {result.snippetHtml && (
                                  <div
                                    className="text-xs text-zinc-400 mt-1 italic line-clamp-2"
                                    dangerouslySetInnerHTML={{ __html: result.snippetHtml }}
                                  />
                                )}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Song Chords Section */}
                {(searchFilter === "all" || searchFilter === "songs") && songResults.length > 0 && (
                  <div className="p-3">
                    <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase text-orange-400 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Music className="w-3.5 h-3.5" /> Verified Songs & Chords
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">1.5M+ Library</span>
                    </div>
                    <div className="space-y-1 mt-1">
                      {songResults.map((song, i) => (
                        <button
                          key={`song-${i}`}
                          onClick={() => {
                            setSelectedSongUrl(song.tab_url);
                            setSelectedSongTitle(song.song_name);
                            setSelectedSongArtist(song.artist_name);
                            setIsSongModalOpen(true);
                            setIsSearchFocused(false);
                          }}
                          className="w-full text-left p-3.5 hover:bg-white/10 rounded-2xl transition-all border border-transparent hover:border-orange-500/30 flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 group-hover:scale-105 group-hover:bg-orange-500/20 transition-all shrink-0">
                              <Music className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-base font-bold text-white group-hover:text-orange-300 transition-colors truncate">
                                {song.song_name}
                              </div>
                              <div className="text-xs text-zinc-400 truncate">
                                {song.artist_name}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            {song.rating > 0 && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-semibold">
                                <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                                {song.rating}
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 text-[11px] font-mono hidden sm:inline">
                              Chords
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Loading state for Songs */}
                {isSearchingSongs && songResults.length === 0 && (
                  <div className="p-4 text-center text-zinc-400 flex items-center justify-center gap-2 border-t border-white/5 text-xs">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                    <span>Searching song chord library...</span>
                  </div>
                )}

                {/* Empty State */}
                {!isSearchingSongs && songResults.length === 0 && theoryResults.length === 0 && (
                  <div className="p-8 text-center text-zinc-400">
                    No chords, theory concepts, or songs found for <span className="text-white font-semibold">"{searchQuery}"</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

        {/* Dynamic Island Quick Tools */}
        <div 
          id="command-hub"
          className={`relative mt-12 min-h-[6rem] flex justify-center items-start transition-all duration-500 opacity-100 translate-y-0 ${tutorialStep === 2 || tutorialStep === 3 ? 'z-[60]' : 'z-40'}`}
          onMouseEnter={() => setIsIslandHovered(true)}
          onMouseLeave={() => setIsIslandHovered(false)}
        >
           <TutorialTooltip 
              step={2}
              title="Command Hub"
              description="This fluid dock gives you one-click access to all your essential instruments and tools from anywhere."
              icon={<Zap className="w-4 h-4 text-amber-400" />}
              position="top"
           />


           <div className="relative group/island">
             <motion.div
                layout
                onClick={() => setIsIslandHovered(true)}
                className={`flex flex-col justify-center items-center overflow-hidden bg-black/60 backdrop-blur-md border ${tutorialStep >= 2 ? 'border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.5)]' : 'border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'} ${(isIslandHovered || tutorialStep === 2 || tutorialStep === 3) ? 'rounded-[2rem] p-3 w-[92vw] max-w-[800px] gap-2' : 'rounded-full p-0 w-48 h-12 justify-center cursor-pointer'}`}
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
             >
                {!(isIslandHovered || tutorialStep === 2 || tutorialStep === 3) ? (
                   <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                   >
                      <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span className="text-sm font-bold tracking-widest text-zinc-300 uppercase">Quick Tools</span>
                   </motion.div>
                ) : (
                   <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-3 md:grid-cols-6 w-full gap-2 relative"
                   >
                    {[
                      { title: "Piano Sandbox", subtitle: "Interactive builder", href: "/piano#sandbox", icon: <Piano className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />, color: "bg-emerald-500/10 hover:bg-emerald-500/20", borderColor: "border-emerald-500/30", glow: "shadow-[0_0_15px_rgba(16,185,129,0.4)]", isStep3: true },
                      { title: "Guitar Tuner", subtitle: "Chromatic tuner", href: "/guitar#tuner", icon: <Guitar className="w-5 h-5 md:w-6 md:h-6 text-fuchsia-400" />, color: "bg-fuchsia-500/10 hover:bg-fuchsia-500/20", borderColor: "border-fuchsia-500/30", glow: "shadow-[0_0_15px_rgba(217,70,239,0.4)]" },
                      { title: "Song Chords", subtitle: "Chords & Lyrics", href: "/#song-chords-engine", icon: <Music className="w-5 h-5 md:w-6 md:h-6 text-orange-400" />, color: "bg-orange-500/10 hover:bg-orange-500/20", borderColor: "border-orange-500/30", glow: "shadow-[0_0_15px_rgba(249,115,22,0.4)]" },
                      { title: "Theory Library", subtitle: "Knowledge base", href: "/library", icon: <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />, color: "bg-cyan-500/10 hover:bg-cyan-500/20", borderColor: "border-cyan-500/30", glow: "shadow-[0_0_15px_rgba(6,182,212,0.4)]" },
                      { title: "Scale Matrix", subtitle: "Visual explorer", href: "/guitar#fretboard", icon: <Activity className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />, color: "bg-blue-500/10 hover:bg-blue-500/20", borderColor: "border-blue-500/30", glow: "shadow-[0_0_15px_rgba(59,130,246,0.4)]" },
                      { title: "Ear Trainer", subtitle: "Pitch practice", href: "/library?module=module-11&chapter=m11-c1", icon: <AudioLines className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" />, color: "bg-indigo-500/10 hover:bg-indigo-500/20", borderColor: "border-indigo-500/30", glow: "shadow-[0_0_15px_rgba(99,102,241,0.4)]" },
                    ].map((tool, i) => (
                      <Link 
                         key={i} 
                         href={tool.href} 
                         onMouseEnter={() => setHoveredToolIndex(i)}
                         onMouseLeave={() => setHoveredToolIndex(null)}
                         onClick={(e) => {
                            e.stopPropagation();
                            if (tutorialStep > 0) {
                               completeTutorial();
                            }
                         }}
                         className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 ${tool.color} border ${(tutorialStep === 3 && tool.isStep3) ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'border-white/5'} group relative overflow-visible`}
                      >
                         <AnimatePresence>
                           {hoveredToolIndex === i && (
                             <motion.div 
                               initial={{ opacity: 0, y: 10, scale: 0.9 }}
                               animate={{ opacity: 1, y: 0, scale: 1 }}
                               exit={{ opacity: 0, y: 5, scale: 0.9 }}
                               className="absolute -top-14 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 whitespace-nowrap z-50 shadow-xl"
                             >
                               <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">{tool.subtitle}</span>
                               <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/90 border-b border-r border-white/10 rotate-45"></div>
                             </motion.div>
                           )}
                         </AnimatePresence>

                         <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                         <div className={`mb-2 p-3 rounded-full bg-black/50 shadow-inner group-hover:scale-110 transition-transform ${tool.borderColor} border ${tool.glow}`}>
                            {tool.icon}
                         </div>
                         <span className="text-xs font-bold text-white tracking-wide">{tool.title}</span>
                      </Link>
                    ))}
                 </motion.div>
              )}
           </motion.div>
         </div>
       </div>

       {/* Animated Scroll Indicator */}
       <motion.div 
         style={{ opacity: indicatorOpacity }}
         className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-500 z-40 pointer-events-none"
       >
         <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Scroll to Explore</span>
         <motion.div 
           animate={{ y: [0, 8, 0] }} 
           transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
         >
           <ChevronDown className="w-5 h-5 text-zinc-400" />
         </motion.div>
       </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: SONG CHORDS & LYRICS ENGINE                        */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <motion.section
        id="song-chords-engine"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full overflow-hidden pt-16 pb-28 -mt-20"
      >
        {/* Animated Sound Waveform Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center opacity-25">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-orange-600/15 via-amber-500/10 to-transparent blur-[160px] rounded-full pointer-events-none"></div>

          <svg className="absolute w-[120%] h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
            {isMounted && [...Array(32)].map((_, i) => {
              const x = 50 + i * 29;
              const baseHeight = 35 + (Math.sin(i * 0.4) * 30 + 30);
              const delay = getPseudoRandom(i * 5) * 2;
              return (
                <motion.rect
                  key={`eq-bar-${i}`}
                  x={x}
                  y={200 - baseHeight / 2}
                  width="4"
                  height={baseHeight}
                  rx="2"
                  fill="#f97316"
                  opacity={0.3}
                  whileInView={{
                    height: [baseHeight * 0.4, baseHeight * 1.5, baseHeight * 0.7, baseHeight * 1.3, baseHeight * 0.4],
                    y: [
                      200 - (baseHeight * 0.4) / 2,
                      200 - (baseHeight * 1.5) / 2,
                      200 - (baseHeight * 0.7) / 2,
                      200 - (baseHeight * 1.3) / 2,
                      200 - (baseHeight * 0.4) / 2,
                    ],
                  }}
                  viewport={{ once: false, amount: 0 }}
                  transition={{
                    duration: 1.8 + getPseudoRandom(i) * 1.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: delay,
                  }}
                  style={{ filter: "drop-shadow(0 0 6px rgba(249,115,22,0.4))" }}
                />
              );
            })}
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-16 pt-20 pb-40 relative z-10">
          {/* One-line title */}
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] tracking-tighter leading-[1.05] mb-6">
              <span className="font-extrabold text-white">Song Chords. </span>
              <span
                className="italic font-light text-transparent bg-clip-text bg-[linear-gradient(to_right,#f97316,#fbbf24,#ffffff,#fbbf24,#f97316)] bg-[length:200%_auto] drop-shadow-[0_0_20px_rgba(249,115,22,0.8)]"
                style={{ animation: "flow 2s linear infinite" }}
              >
                Play in any key.
              </span>
            </h2>
            <p className="text-lg text-zinc-500 font-light max-w-xl mx-auto">
              Instant song chord sheets with synced lyrics, one-click vocal key transposition, and interactive guitar &amp; piano voicings.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-20">
            {/* Interactive Song Widget */}
            <div className="flex-1 w-full relative">
              <div className="relative w-full max-w-xl mx-auto">
                <div className="absolute -inset-10 bg-orange-500/10 blur-[80px] rounded-full"></div>

                <div className="relative rounded-[2.5rem] bg-black/60 border border-orange-500/15 backdrop-blur-md p-6 sm:p-8 shadow-[0_0_80px_rgba(249,115,22,0.1)]">
                  {/* Song Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/10 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                        <Music className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-base sm:text-lg font-black text-white truncate">Hotel California — Eagles</h4>
                        <div className="text-[11px] text-zinc-400 font-mono">Original Key: Bm • Capo: Fret 7</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-300 border border-orange-500/20 font-mono shrink-0">
                      100% Ad-Free
                    </span>
                  </div>

                  {/* Lyrics & Chords interactive block */}
                  <div className="py-6 font-mono text-sm sm:text-base space-y-3">
                    <div className="text-[11px] font-sans text-orange-400/90 italic mb-1 flex items-center justify-between">
                      <span>💡 Hover any chord to audition guitar &amp; piano voicings:</span>
                      <span className="text-[10px] text-zinc-500 font-mono">Original Key: Bm</span>
                    </div>
                    <div className="p-5 rounded-2xl bg-black/40 border border-orange-500/15 space-y-4">
                      {/* Line 1 */}
                      <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
                        <div className="flex flex-col items-start">
                          <ChordPill chord="Bm" />
                          <span className="text-zinc-100 font-mono text-sm sm:text-base mt-1">On a dark desert highway,</span>
                        </div>
                        <div className="flex flex-col items-start">
                          <ChordPill chord="F#7" />
                          <span className="text-zinc-200 font-mono text-sm sm:text-base mt-1">cool wind in my hair</span>
                        </div>
                      </div>

                      {/* Line 2 */}
                      <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
                        <div className="flex flex-col items-start">
                          <ChordPill chord="A" />
                          <span className="text-zinc-100 font-mono text-sm sm:text-base mt-1">Warm smell of colitas,</span>
                        </div>
                        <div className="flex flex-col items-start">
                          <ChordPill chord="E" />
                          <span className="text-zinc-200 font-mono text-sm sm:text-base mt-1">rising up through the air</span>
                        </div>
                      </div>

                      {/* Line 3 */}
                      <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
                        <div className="flex flex-col items-start">
                          <ChordPill chord="G" />
                          <span className="text-zinc-100 font-mono text-sm sm:text-base mt-1">Up ahead in the distance,</span>
                        </div>
                        <div className="flex flex-col items-start">
                          <ChordPill chord="D" />
                          <span className="text-zinc-200 font-mono text-sm sm:text-base mt-1">I saw a shimmering light</span>
                        </div>
                      </div>

                      {/* Line 4 */}
                      <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
                        <div className="flex flex-col items-start">
                          <ChordPill chord="Em" />
                          <span className="text-zinc-100 font-mono text-sm sm:text-base mt-1">My head grew heavy and my sight grew dim,</span>
                        </div>
                        <div className="flex flex-col items-start">
                          <ChordPill chord="F#7" />
                          <span className="text-zinc-200 font-mono text-sm sm:text-base mt-1">I had to stop for the night</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick song pill launchers */}
                  <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">Try:</span>
                    {[
                      { name: "Creep", artist: "Radiohead", url: "https://tabs.ultimate-guitar.com/tab/radiohead/creep-chords-4169" },
                      { name: "Shape of You", artist: "Ed Sheeran", url: "https://tabs.ultimate-guitar.com/tab/ed-sheeran/shape-of-you-chords-1928431" },
                      { name: "Bohemian Rhapsody", artist: "Queen", url: "https://tabs.ultimate-guitar.com/tab/queen/bohemian-rhapsody-chords-40606" },
                      { name: "Let It Be", artist: "The Beatles", url: "https://tabs.ultimate-guitar.com/tab/the-beatles/let-it-be-chords-17427" },
                      { name: "Kesariya", artist: "Arijit Singh", url: "https://tabs.ultimate-guitar.com/tab/4275298" },
                    ].map((song, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => {
                          setSelectedSongUrl(song.url);
                          setSelectedSongTitle(song.name);
                          setSelectedSongArtist(song.artist);
                          setIsSongModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 hover:border-orange-500/40 text-[11px] font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Music className="w-3 h-3 text-orange-400" />
                        <span>{song.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Features & Action Button */}
            <div className="flex-1 space-y-10">
              {[
                { icon: <Zap className="w-5 h-5" />, title: "Zero Ads & Clutter", desc: "No video ads interrupting your rehearsal, no paywall barriers. Just pure, clean chords and synced lyrics for seamless jamming." },
                { icon: <ArrowRight className="w-5 h-5" />, title: "1-Click Vocal Transposition", desc: "Shift keys up or down in real-time to match any vocalist's natural range or capo placement without breaking formatting." },
                { icon: <Piano className="w-5 h-5" />, title: "Dual Guitar & Piano Voicings", desc: "Hover or tap any chord to view both standard 6-string guitar shapes and 88-key piano voicings with true instrument audio." },
                { icon: <AudioLines className="w-5 h-5" />, title: "Hands-Free Auto-Scroll", desc: "Never take your hands off your guitar neck or keyboard to scroll. Toggle smooth automatic scrolling with custom adjustable speed." },
              ].map((feature, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} className="flex gap-5 items-start group">
                  <div className="mt-1 p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 group-hover:bg-orange-500/20 transition-colors shrink-0">{feature.icon}</div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">{feature.title}</h3>
                    <p className="text-zinc-500 font-light leading-relaxed text-[15px]">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}

              <div className="relative inline-flex mt-6 group transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_10px_30px_rgba(249,115,22,0.4)] active:scale-95 rounded-full">
                <div className="absolute -inset-[1.5px] rounded-full overflow-hidden opacity-70 group-hover:opacity-100 transition-opacity">
                  <div className="absolute -inset-[300%]" style={{ backgroundImage: 'conic-gradient(from 0deg, #ea580c 0%, #f97316 12.5%, #ffffff 25%, #f97316 37.5%, #ea580c 50%, #f97316 62.5%, #ffffff 75%, #f97316 87.5%, #ea580c 100%)', animation: 'spin 3s linear infinite' }}></div>
                </div>
                <button
                  onClick={() => {
                    setSelectedSongUrl("https://tabs.ultimate-guitar.com/tab/eagles/hotel-california-chords-46190");
                    setSelectedSongTitle("Hotel California");
                    setSelectedSongArtist("Eagles");
                    setIsSongModalOpen(true);
                  }}
                  className="relative flex items-center gap-3 px-8 py-4 bg-zinc-950 text-white font-black rounded-full transition-colors duration-300 text-lg cursor-pointer"
                >
                  Open Song Sheet <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Section Divider into Piano Suite */}
      <div className="w-full flex justify-center py-12 relative z-20">
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-3/4 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"></div>
         </div>
         <div className="w-2 h-2 rounded-full bg-black border border-orange-500/30 z-10 shadow-[0_0_10px_rgba(249,115,22,0.2)]"></div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* PIANO SUITE SECTION                                           */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <motion.section 
        id="piano-suite-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full overflow-hidden -mt-32"
      >
        {/* Animated Grand Staff Sheet Music Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center opacity-30">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/3"></div>
          
          {/* Subtle rotated container spanning much more height */}
          <div className="w-[150%] h-[75%] flex flex-col absolute top-[12%] -rotate-6">
            
            {/* Treble Clef Staff */}
            <div className="w-full h-[30%] flex flex-col justify-between relative">
              {[...Array(5)].map((_, i) => (
                <div key={`treble-${i}`} className="w-full h-[1px] bg-emerald-500/40 shadow-[0_0_8px_rgba(52,211,153,0.3)]"></div>
              ))}
            </div>

            {/* Gap between staves */}
            <div className="w-full h-[20%]"></div>

            {/* Bass Clef Staff */}
            <div className="w-full h-[30%] flex flex-col justify-between relative">
              {[...Array(5)].map((_, i) => (
                <div key={`bass-${i}`} className="w-full h-[1px] bg-emerald-500/40 shadow-[0_0_8px_rgba(52,211,153,0.3)]"></div>
              ))}
            </div>
            
            {/* Floating abstract notes distributed everywhere */}
            {isMounted && [...Array(24)].map((_, i) => {
              // Random vertical position from -10% to 110% to cover everything
              const topPos = -10 + getPseudoRandom(i * 7) * 120; 
              const delay = getPseudoRandom(i * 3) * 20;
              const duration = 15 + getPseudoRandom(i) * 20;
              
              return (
                <motion.div
                  key={`note-${i}`}
                  className="absolute text-emerald-400/50 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)] mix-blend-screen"
                  style={{ top: `${topPos}%`, marginTop: '-20px' }}
                  whileInView={{ x: ['120vw', '-50vw'] }}
                  viewport={{ once: false, amount: 0 }}
                  transition={{ duration: duration, repeat: Infinity, ease: "linear", delay: -delay }}
                >
                  {/* Mathematically correct music notes */}
                  <svg width="24" height="40" viewBox="0 0 24 40" fill="currentColor">
                     {i % 2 === 0 ? (
                       // Stem Up (Stem on the Right)
                       <>
                         <ellipse cx="9" cy="30" rx="8" ry="5.5" transform="rotate(-20 9 30)" />
                         <rect x="15.5" y="4" width="1.5" height="26" />
                         {/* Optional Eighth note flag */}
                         {i % 3 === 0 && <path d="M 17 4 Q 24 10 18 20 Q 22 12 17 10 Z" fill="currentColor" />}
                       </>
                     ) : (
                       // Stem Down (Stem on the Left)
                       <>
                         <ellipse cx="14" cy="10" rx="8" ry="5.5" transform="rotate(-20 14 10)" />
                         <rect x="6" y="10" width="1.5" height="26" />
                         {/* Optional Eighth note flag */}
                         {i % 3 === 1 && <path d="M 6 36 Q 13 30 7 20 Q 11 28 6 30 Z" fill="currentColor" />}
                       </>
                     )}
                  </svg>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-16 py-40 relative z-10">
          {/* One-line title */}
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] tracking-tighter leading-[1.05] mb-6">
              <span className="font-extrabold text-white">Piano Suite. </span>
              <span className="italic font-light text-transparent bg-clip-text bg-[linear-gradient(to_right,#22c55e,#4ade80,#ffffff,#4ade80,#22c55e)] bg-[length:200%_auto] drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]" style={{ animation: 'flow 2s linear infinite' }}>
                Compose endlessly.
              </span>
            </h2>
            <p className="text-lg text-zinc-500 font-light max-w-xl mx-auto">
              Build chord progressions, search complex fingerings, and instantly export your musical ideas to MIDI.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-20">
            
            {/* Real Piano Keyboard */}
            <div className="flex-1 w-full relative">
              <div className="relative w-full max-w-xl mx-auto">
                <div className="absolute -inset-10 bg-emerald-500/10 blur-[80px] rounded-full"></div>
                
                <div className="relative flex justify-start md:justify-center overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-4 -my-4 px-4 -mx-4" style={{ perspective: "1000px" }}>
                  {/* White keys */}
                  <div className="flex gap-[3px] relative transform-style-3d">
                    {isMounted && ["C", "D", "E", "F", "G", "A", "B", "C", "D", "E"].map((note, i) => (
                      <motion.div 
                        key={`w-${i}`} 
                        style={{ transformOrigin: "top" }}
                        whileInView={{ 
                          rotateX: [0, 8, 0],
                          backgroundColor: ['#ffffff', '#e4e4e7', '#ffffff'] 
                        }}
                        viewport={{ once: false, amount: 0.1 }}
                        transition={{ 
                          duration: 0.6, 
                          repeat: Infinity, 
                          delay: getPseudoRandom(i * 11) * 4, 
                          repeatDelay: 1.5 + getPseudoRandom(i * 7) * 2 
                        }}
                        className="relative w-9 sm:w-14 h-36 sm:h-56 bg-gradient-to-b from-white via-zinc-100 to-zinc-200 rounded-b-lg border border-zinc-300 shadow-[inset_-1px_0_0_rgba(0,0,0,0.1),inset_1px_0_0_rgba(255,255,255,0.8),0_4px_8px_rgba(0,0,0,0.4)]"
                      >
                        <motion.div 
                          whileInView={{ opacity: [0, 0.8, 0] }}
                          viewport={{ once: false, amount: 0.1 }}
                          transition={{ 
                            duration: 0.6, 
                            repeat: Infinity, 
                            delay: getPseudoRandom(i * 11) * 4, 
                            repeatDelay: 1.5 + getPseudoRandom(i * 7) * 2 
                          }}
                          className="absolute bottom-0 inset-x-0 h-full rounded-b-lg bg-gradient-to-t from-emerald-400/80 via-emerald-400/20 to-transparent"
                          style={{ boxShadow: '0 0 30px rgba(52,211,153,0.5)' }}
                        />
                        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-bold text-zinc-400">{note}</span>
                      </motion.div>
                    ))}
                    
                    {/* Black keys overlay */}
                    {isMounted && [
                      { left: '9.5%', label: 'C#' },
                      { left: '19.5%', label: 'D#' },
                      { left: '39.5%', label: 'F#' },
                      { left: '49.5%', label: 'G#' },
                      { left: '59.5%', label: 'A#' },
                      { left: '79.5%', label: 'C#' },
                      { left: '89.5%', label: 'D#' },
                    ].map((key, i) => (
                      <motion.div 
                        key={`b-${i}`} 
                        style={{ left: key.left, transformOrigin: "top" }}
                        whileInView={{ rotateX: [0, 6, 0] }}
                        viewport={{ once: false, amount: 0.1 }}
                        transition={{ 
                          duration: 0.5, 
                          repeat: Infinity, 
                          delay: getPseudoRandom((i + 10) * 13) * 3, 
                          repeatDelay: 1 + getPseudoRandom((i + 10) * 7) * 1.5 
                        }}
                        className="absolute top-0 w-6 sm:w-9 h-24 sm:h-36 bg-gradient-to-b from-zinc-800 via-zinc-900 to-black rounded-b-md z-20 border border-zinc-700 shadow-[0_4px_8px_rgba(0,0,0,0.6),inset_0_-2px_4px_rgba(0,0,0,0.4)]"
                      >
                        <motion.div 
                          whileInView={{ opacity: [0, 0.9, 0] }}
                          viewport={{ once: false, amount: 0.1 }}
                          transition={{ 
                            duration: 0.5, 
                            repeat: Infinity, 
                            delay: getPseudoRandom((i + 10) * 13) * 3, 
                            repeatDelay: 1 + getPseudoRandom((i + 10) * 7) * 1.5 
                          }}
                          className="absolute bottom-0 inset-x-0 h-full rounded-b-md bg-gradient-to-t from-emerald-500/70 to-transparent"
                          style={{ boxShadow: '0 0 20px rgba(52,211,153,0.4)' }}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="flex-1 space-y-10">
              {[
                { icon: <Music className="w-5 h-5" />, title: "Chord Dictionary", desc: "Search any chord by name or voicing. Visualize fingerings with instant audio playback." },
                { icon: <Layers className="w-5 h-5" />, title: "Progression Sandbox", desc: "Drag, reorder, and branch chord progressions on an infinite canvas with AI-powered suggestions." },
                { icon: <AudioLines className="w-5 h-5" />, title: "MIDI Export", desc: "One-click export to a clean MIDI file. Drop it straight into Logic, Ableton, or any DAW." },
                { icon: <Clapperboard className="w-5 h-5" />, title: "Film & Jazz Voicings", desc: "Extended harmony: 9ths, 11ths, 13ths, altered dominants — all mapped and playable." },
              ].map((feature, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} className="flex gap-5 items-start group">
                  <div className="mt-1 p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors shrink-0">{feature.icon}</div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">{feature.title}</h3>
                    <p className="text-zinc-500 font-light leading-relaxed text-[15px]">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}

              <div className="relative inline-flex mt-6 group transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_10px_30px_rgba(52,211,153,0.4)] active:scale-95 rounded-full">
                <div className="absolute -inset-[1.5px] rounded-full overflow-hidden opacity-70 group-hover:opacity-100 transition-opacity">
                   <div className="absolute -inset-[300%]" style={{ backgroundImage: 'conic-gradient(from 0deg, #059669 0%, #10b981 12.5%, #ffffff 25%, #10b981 37.5%, #059669 50%, #10b981 62.5%, #ffffff 75%, #10b981 87.5%, #059669 100%)', animation: 'spin 3s linear infinite' }}></div>
                </div>
                <Link href="/piano" className="relative flex items-center gap-3 px-8 py-4 bg-zinc-950 text-white font-black rounded-full transition-colors duration-300 text-lg">
                  Open the Sandbox <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* GUITAR TOOLKIT SECTION                                        */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="w-full flex justify-center py-12 relative z-20">
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-3/4 h-px bg-gradient-to-r from-transparent via-fuchsia-500/20 to-transparent"></div>
         </div>
         <div className="w-2 h-2 rounded-full bg-black border border-fuchsia-500/30 z-10 shadow-[0_0_10px_rgba(217,70,239,0.2)]"></div>
      </div>

      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full overflow-hidden"
      >
        {/* Realistic Plucked Strings Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center opacity-25">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-fuchsia-600/5 blur-[150px] rounded-full"></div>
          
          <svg className="absolute w-[120%] h-full" viewBox="0 0 1000 500" preserveAspectRatio="none">
            {isMounted && [...Array(6)].map((_, i) => {
              const y = 100 + i * 60;
              const loopDelay = 2 + getPseudoRandom(i*7)*4;
              const delay = getPseudoRandom(i*3)*3;
              // Physics-based decaying standing wave
              const amp = 40 + getPseudoRandom(i)*20; // Amplitude of pluck
              
              return (
                <motion.path
                  key={`string-${i}`}
                  d={`M 0 ${y} Q 500 ${y} 1000 ${y}`}
                  whileInView={{
                    d: [
                      `M 0 ${y} Q 500 ${y} 1000 ${y}`,            // Rest
                      `M 0 ${y} Q 500 ${y - amp} 1000 ${y}`,      // Pluck up
                      `M 0 ${y} Q 500 ${y + amp * 0.8} 1000 ${y}`, // Rebound down
                      `M 0 ${y} Q 500 ${y - amp * 0.5} 1000 ${y}`, // Rebound up
                      `M 0 ${y} Q 500 ${y + amp * 0.2} 1000 ${y}`, // Rebound down
                      `M 0 ${y} Q 500 ${y} 1000 ${y}`             // Rest
                    ]
                  }}
                  viewport={{ once: false, amount: 0 }}
                  transition={{ 
                    duration: 0.5, // Exactly matches the 0.5s duration from guitar/page.tsx
                    repeat: Infinity, 
                    ease: "easeInOut", // Exactly matches easeInOut from guitar/page.tsx
                    repeatDelay: loopDelay,
                    delay: delay
                  }}
                  stroke="#d946ef"
                  strokeWidth={1.5 + (5 - i) * 0.3} // Thicker strings at the top (low E)
                  fill="none"
                  strokeOpacity={0.4}
                  style={{ filter: 'drop-shadow(0 0 5px rgba(217,70,239,0.3))' }}
                />
              )
            })}
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-16 pt-20 pb-40 relative z-10">
          {/* One-line title */}
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] tracking-tighter leading-[1.05] mb-6">
              <span className="font-extrabold text-white">Guitar Toolkit. </span>
              <span className="italic font-light text-transparent bg-clip-text bg-[linear-gradient(to_right,#d946ef,#f472b6,#ffffff,#f472b6,#d946ef)] bg-[length:200%_auto] drop-shadow-[0_0_15px_rgba(217,70,239,0.8)]" style={{ animation: 'flow 2s linear infinite' }}>
                Precision tuned.
              </span>
            </h2>
            <p className="text-lg text-zinc-500 font-light max-w-xl mx-auto">
              Tune up with precision, map complex fingerings in any alternate tuning, and explore the entire fretboard.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row-reverse items-center gap-20">
            
            {/* Tuner Widget - matching actual GuitarTuner */}
            <div className="flex-1 w-full relative">
              <div className="relative w-full max-w-sm mx-auto">
                <div className="absolute -inset-10 bg-fuchsia-500/10 blur-[80px] rounded-full"></div>
                
                <div className="relative flex flex-col items-center">
                  {/* Circular Dial */}
                  <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-full border-[10px] bg-black/80 flex flex-col items-center justify-center border-zinc-900 shadow-[inset_0_0_50px_rgba(0,0,0,1)]">
                    <div className="absolute inset-4 rounded-full border border-zinc-800/50"></div>
                    
                    {/* The Needle */}
                    <motion.div 
                      className="absolute w-2 origin-bottom bottom-1/2 rounded-full z-20 bg-fuchsia-500"
                      style={{ height: '45%' }}
                      animate={{ rotate: [-35, 15, -8, 0, 0, 0, -25] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.8)]"></div>
                    </motion.div>

                    {/* Center pivot */}
                    <div className="w-12 h-12 rounded-full border-4 border-zinc-900 z-30 absolute flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-black"></div>
                    </div>

                    {/* Note display */}
                    <motion.div 
                      animate={{ color: ['#a1a1aa', '#d946ef', '#d946ef', '#a1a1aa'] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-10 md:top-12 text-5xl md:text-6xl font-black tracking-tighter z-10"
                    >
                      A4
                    </motion.div>

                    {/* Indicator dots */}
                    <div className="absolute bottom-14 md:bottom-16 flex gap-3 items-center z-10">
                      <div className="w-3 h-3 rounded-full border border-white/10"></div>
                      <motion.div 
                        animate={{ backgroundColor: ['#27272a', '#d946ef', '#d946ef', '#27272a'], boxShadow: ['0 0 0px #d946ef', '0 0 15px #d946ef', '0 0 15px #d946ef', '0 0 0px #d946ef'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-4 h-4 rounded-full"
                      ></motion.div>
                      <div className="w-3 h-3 rounded-full border border-white/10"></div>
                    </div>

                    <div className="absolute bottom-6 md:bottom-8 text-xs font-bold text-zinc-400 tracking-widest uppercase z-10">
                      440.0 Hz
                    </div>
                  </div>

                  {/* String Pegs */}
                  <div className="flex gap-3 mt-8">
                    {["E", "A", "D", "G", "B", "e"].map((s, i) => (
                      <motion.div 
                        key={s + i}
                        animate={i === 0 ? { borderColor: ['rgba(217,70,239,0.3)', 'rgba(217,70,239,1)', 'rgba(217,70,239,0.3)'] } : {}}
                        transition={{ duration: 4, repeat: Infinity }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-4 ${i === 0 ? 'text-fuchsia-400 border-fuchsia-500/50 bg-fuchsia-500/10' : 'text-zinc-500 border-zinc-800 bg-black'}`}
                      >
                        {s}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="flex-1 space-y-10">
              {[
                { icon: <Activity className="w-5 h-5" />, title: "Live Chromatic Tuner", desc: "High-precision WebAudio with zero latency. Plug in or use your mic — works with any instrument." },
                { icon: <Guitar className="w-5 h-5" />, title: "Dynamic Fretboard", desc: "Visualize any chord or scale across the entire neck. Isolate voicings and map complex fingerings." },
                { icon: <Layers className="w-5 h-5" />, title: "Alternate Tunings", desc: "Instantly switch between Drop D, Open G, DADGAD, and custom tunings with live visualization." },
                { icon: <Cable className="w-5 h-5" />, title: "Pedalboard Builder", desc: "String together progressions in a custom stompbox chain. Audition with steel-string acoustics, export to MIDI." },
              ].map((feature, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} className="flex gap-5 items-start group">
                  <div className="mt-1 p-2.5 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 group-hover:bg-fuchsia-500/20 transition-colors shrink-0">{feature.icon}</div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">{feature.title}</h3>
                    <p className="text-zinc-500 font-light leading-relaxed text-[15px]">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}

              <div className="relative inline-flex mt-6 group transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_10px_30px_rgba(217,70,239,0.4)] active:scale-95 rounded-full">
                <div className="absolute -inset-[1.5px] rounded-full overflow-hidden opacity-70 group-hover:opacity-100 transition-opacity">
                   <div className="absolute -inset-[300%]" style={{ backgroundImage: 'conic-gradient(from 0deg, #a21caf 0%, #d946ef 12.5%, #ffffff 25%, #d946ef 37.5%, #a21caf 50%, #d946ef 62.5%, #ffffff 75%, #d946ef 87.5%, #a21caf 100%)', animation: 'spin 3s linear infinite' }}></div>
                </div>
                <Link href="/guitar" className="relative flex items-center gap-3 px-8 py-4 bg-zinc-950 text-white font-black rounded-full transition-colors duration-300 text-lg">
                  Grab your Toolkit <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* THEORY LIBRARY SECTION                                        */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="w-full flex justify-center py-12 relative z-20">
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-3/4 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
         </div>
         <div className="w-2 h-2 rounded-full bg-black border border-cyan-500/30 z-10 shadow-[0_0_10px_rgba(6,182,212,0.2)]"></div>
      </div>

      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full overflow-hidden pb-32"
      >
        {/* Perfect Mathematical Journey Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-50">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent"></div>
          
          <svg className="absolute w-full h-full" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice">
             {/* The mathematically perfect continuous wave path */}
             {/* Path logic: 
                 Starts at M 0 400
                 Q1: control(125,200), end(250,400) -> midpoint lies at (125, 300)
                 T1: end(500,400) -> midpoint lies at (375, 500)
                 T2: end(750,400) -> midpoint lies at (625, 300)
                 T3: end(1000,400)-> midpoint lies at (875, 500)
             */}
             <path 
               d="M 0 400 Q 125 200 250 400 T 500 400 T 750 400 T 1000 400" 
               stroke="#06b6d4" 
               strokeWidth="1.5" 
               fill="none" 
               strokeOpacity="0.2" 
               strokeDasharray="8 8"
             />
             
             {/* Tracing light along the exact path */}
             <motion.path 
               d="M 0 400 Q 125 200 250 400 T 500 400 T 750 400 T 1000 400" 
               stroke="#22d3ee" 
               strokeWidth="3" 
               fill="none" 
               style={{ filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.6))' }}
               initial={{ pathLength: 0, opacity: 0 }}
               whileInView={{ pathLength: [0, 1], opacity: [0, 1, 0] }}
               viewport={{ once: false, amount: 0 }}
               transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
             />

             {/* Nodes aligned perfectly on the mathematical curve midpoints and endpoints */}
             {[
               { x: 125, y: 300 }, // Q1 midpoint
               { x: 250, y: 400 }, // Q1 endpoint
               { x: 375, y: 500 }, // T1 midpoint
               { x: 500, y: 400 }, // T1 endpoint
               { x: 625, y: 300 }, // T2 midpoint
               { x: 750, y: 400 }, // T2 endpoint
               { x: 875, y: 500 }  // T3 midpoint
             ].map((node, i) => (
               <g key={`journey-node-${i}`}>
                 {/* Node pulse */}
                 <motion.circle 
                   cx={node.x} cy={node.y} r="15" 
                   fill="none" stroke="#22d3ee"
                   whileInView={{ r: [15, 30], opacity: [0.5, 0] }}
                   viewport={{ once: false, amount: 0 }}
                   transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                 />
                 {/* Solid Node */}
                 <circle cx={node.x} cy={node.y} r="6" fill="#06b6d4" />
               </g>
             ))}
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-16 pt-20 pb-40 relative z-10">
          {/* One-line title */}
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] tracking-tighter leading-[1.05] mb-6">
              <span className="font-extrabold text-white">Theory Library. </span>
              <span className="italic font-light text-transparent bg-clip-text bg-[linear-gradient(to_right,#06b6d4,#3b82f6,#ffffff,#3b82f6,#06b6d4)] bg-[length:200%_auto] drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" style={{ animation: 'flow 2s linear infinite' }}>
                Master the craft.
              </span>
            </h2>
            <p className="text-lg text-zinc-500 font-light max-w-xl mx-auto">
              Master the language of music through interactive exploration. Build chords, understand harmony, and decode genres.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-20">
            
            {/* Learning Journey Widget */}
            <div className="flex-1 w-full relative">
              <div className="relative w-full max-w-xl mx-auto">
                <div className="absolute -inset-10 bg-cyan-500/10 blur-[80px] rounded-full"></div>
                
                <div className="relative rounded-[2.5rem] bg-black/60 border border-cyan-500/10 backdrop-blur-md p-8 shadow-[0_0_80px_rgba(6,182,212,0.08)]">
                  <div className="space-y-1">
                    {isMounted && [
                      { label: "The Keyboard", sub: "Notes, Octaves, Semitones", progress: 100 },
                      { label: "Intervals", sub: "Distance between pitches", progress: 100 },
                      { label: "Scales & Modes", sub: "Major, Minor, Dorian, Mixolydian", progress: 75 },
                      { label: "Chord Construction", sub: "Triads, 7ths, Extensions", progress: 40 },
                      { label: "Functional Harmony", sub: "Tonic, Subdominant, Dominant", progress: 0 },
                      { label: "Genre Deconstruction", sub: "Jazz, Neo-Soul, Lo-fi, EDM", progress: 0 },
                    ].map((node, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-4 py-3 px-4 rounded-xl group hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex flex-col items-center shrink-0">
                          <motion.div 
                            animate={node.progress > 0 ? { boxShadow: ['0 0 0px rgba(6,182,212,0)', '0 0 15px rgba(6,182,212,0.6)', '0 0 0px rgba(6,182,212,0)'] } : {}}
                            transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                            className={`w-3.5 h-3.5 rounded-full border-[2.5px] ${node.progress === 100 ? 'bg-cyan-400 border-cyan-400' : node.progress > 0 ? 'bg-cyan-400/40 border-cyan-400' : 'bg-transparent border-zinc-700'}`} 
                          />
                          {i < 5 && <div className={`w-[2px] h-6 mt-1 ${node.progress > 0 ? 'bg-gradient-to-b from-cyan-500/40 to-transparent' : 'bg-zinc-800'}`}></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-bold ${node.progress > 0 ? 'text-white' : 'text-zinc-600'}`}>{node.label}</div>
                          <div className="text-[12px] text-zinc-600 truncate">{node.sub}</div>
                        </div>
                        {node.progress > 0 && (
                          <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden shrink-0">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: `${node.progress}%` }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.5 + i * 0.15, duration: 0.8, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                              style={{ boxShadow: '0 0 8px rgba(6,182,212,0.5)' }}
                            />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="flex-1 space-y-10">
              {[
                { icon: <BookOpen className="w-5 h-5" />, title: "Guided Curriculum", desc: "A structured journey from basics to advanced modal interchange. Each chapter builds on the last." },
                { icon: <Activity className="w-5 h-5" />, title: "Ear Training", desc: "Train your ear to recognize intervals, chord qualities, and cadences with interactive quizzes." },
                { icon: <CircleDashed className="w-5 h-5" />, title: "Circle of Fifths", desc: "An interactive, visual circle of fifths. See how chords and keys connect in real-time." },
                { icon: <Sparkles className="w-5 h-5" />, title: "Genre Deconstructor", desc: "Reverse-engineer the harmonic DNA of Jazz, Neo-Soul, Lo-fi, and EDM." },
              ].map((feature, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} className="flex gap-5 items-start group">
                  <div className="mt-1 p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-colors shrink-0">{feature.icon}</div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">{feature.title}</h3>
                    <p className="text-zinc-500 font-light leading-relaxed text-[15px]">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}

              <div className="relative inline-flex mt-6 group transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_10px_30px_rgba(6,182,212,0.4)] active:scale-95 rounded-full">
                <div className="absolute -inset-[1.5px] rounded-full overflow-hidden opacity-70 group-hover:opacity-100 transition-opacity">
                   <div className="absolute -inset-[300%]" style={{ backgroundImage: 'conic-gradient(from 0deg, #0e7490 0%, #06b6d4 12.5%, #ffffff 25%, #06b6d4 37.5%, #0e7490 50%, #06b6d4 62.5%, #ffffff 75%, #06b6d4 87.5%, #0e7490 100%)', animation: 'spin 3s linear infinite' }}></div>
                </div>
                <Link href="/library" className="relative flex items-center gap-3 px-8 py-4 bg-zinc-950 text-white font-black rounded-full transition-colors duration-300 text-lg">
                  Explore Learn & Theory <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Interactive Song Sheet Modal */}
      <SongSheetModal
        isOpen={isSongModalOpen}
        onClose={() => setIsSongModalOpen(false)}
        tabUrl={selectedSongUrl || ""}
        initialTitle={selectedSongTitle}
        initialArtist={selectedSongArtist}
      />
    </main>
  );
}
