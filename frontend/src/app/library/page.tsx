"use client";

import { useState, useEffect } from "react";
import { COURSE_DATA } from "@/lib/course-data";
import { ChevronRight, PlayCircle, Library, Search, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CourseKeyboard from "@/components/library/course/CourseKeyboard";
import { useTutorial } from "@/context/TutorialContext";
import TutorialOverlay from "@/components/TutorialOverlay";
import TutorialTooltip from "@/components/TutorialTooltip";
import IntervalVisualizer from "@/components/library/course/IntervalVisualizer";
import CourseScaleVisualizer from "@/components/library/course/CourseScaleVisualizer";
import CourseChordBuilder from "@/components/library/course/CourseChordBuilder";
import FunctionalHarmony from "@/components/library/course/FunctionalHarmony";
import CadencePlayer from "@/components/library/course/CadencePlayer";
import ClassicProgressions from "@/components/library/course/ClassicProgressions";
import GenreProgressions from "@/components/library/course/GenreProgressions";
import ModeSwitcher from "@/components/library/course/ModeSwitcher";
import MelodySandbox from "@/components/library/course/MelodySandbox";
import MotifDeveloper from "@/components/library/course/MotifDeveloper";
import TimeSignatures from "@/components/library/course/TimeSignatures";
import SyncopationTrainer from "@/components/library/course/SyncopationTrainer";
import EarTrainer from "@/components/library/course/EarTrainer";
import BorrowedChords from "@/components/library/course/BorrowedChords";
import GenreDeconstructor from "@/components/library/course/GenreDeconstructor";
import CircleOfFifths from "@/components/library/CircleOfFifths";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const ROTATING_WORDS = [
  "Composer",
  "Producer",
  "Songwriter",
  "Beatmaker",
  "Musician",
];

const getPseudoRandom = (seed: number) => {
   const x = Math.sin(seed++) * 10000;
   return x - Math.floor(x);
};

function CoursePageContent() {
  const searchParams = useSearchParams();
  
  const [activeModuleId, setActiveModuleId] = useState(COURSE_DATA[0].id);
  const [activeChapterId, setActiveChapterId] = useState(COURSE_DATA[0].chapters[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);

  const { tutorialStep, completeTutorial } = useTutorial();

  useEffect(() => {
    const modId = searchParams.get('module');
    const chapId = searchParams.get('chapter');
    if (modId) setActiveModuleId(modId);
    if (chapId) setActiveChapterId(chapId);
  }, [searchParams]);

  useEffect(() => {
    const typingSpeed = isDeleting ? 50 : 100;
    const currentWord = ROTATING_WORDS[loopNum % ROTATING_WORDS.length] + ".";

    const handleTyping = () => {
      setText(isDeleting 
        ? currentWord.substring(0, text.length - 1) 
        : currentWord.substring(0, text.length + 1)
      );

      if (!isDeleting && text === currentWord) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && text === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timeout = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timeout);
  }, [text, isDeleting, loopNum]);

  type SearchResult = {
    moduleId: string;
    moduleTitle: string;
    chapterId: string;
    chapterTitle: string;
    snippetHtml: string;
  };
  const flatSearchResults: SearchResult[] = [];
  if (searchQuery.trim().length > 0) {
    const query = searchQuery.toLowerCase();
    COURSE_DATA.forEach(mod => {
      mod.chapters.forEach(chapter => {
         const strippedContent = chapter.content?.replace(/<[^>]*>?/gm, '') || "";
         const titleMatch = chapter.title.toLowerCase().includes(query);
         const topicMatch = chapter.topics.find(t => t.toLowerCase().includes(query));
         const contentMatchIndex = strippedContent.toLowerCase().indexOf(query);
         
         if (titleMatch || topicMatch || contentMatchIndex !== -1) {
            let snippetHtml = "";
            if (contentMatchIndex !== -1) {
               const start = Math.max(0, contentMatchIndex - 40);
               const end = Math.min(strippedContent.length, contentMatchIndex + query.length + 40);
               let snippet = strippedContent.substring(start, end);
               if (start > 0) snippet = "..." + snippet;
               if (end < strippedContent.length) snippet = snippet + "...";
               const regex = new RegExp(`(${query})`, 'gi');
               snippetHtml = snippet.replace(regex, `<span class="bg-cyan-500/40 text-cyan-100 font-bold px-1 rounded-md">$1</span>`);
            } else if (topicMatch) {
               snippetHtml = `Topic: <span class="bg-cyan-500/40 text-cyan-100 font-bold px-1 rounded-md">${topicMatch}</span>`;
            }

            flatSearchResults.push({
               moduleId: mod.id,
               moduleTitle: mod.title,
               chapterId: chapter.id,
               chapterTitle: chapter.title,
               snippetHtml
            });
         }
      });
    });
  }

  const filteredModules = COURSE_DATA.map(mod => {
     const filteredChapters = mod.chapters.filter(chapter => {
        const query = searchQuery.toLowerCase();
        const strippedContent = chapter.content?.replace(/<[^>]*>?/gm, '').toLowerCase() || "";
        return (
           chapter.title.toLowerCase().includes(query) || 
           chapter.topics.some(t => t.toLowerCase().includes(query)) ||
           strippedContent.includes(query)
        );
     });
     return { ...mod, chapters: filteredChapters };
  }).filter(mod => mod.chapters.length > 0 || mod.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const activeModule = COURSE_DATA.find(m => m.id === activeModuleId);
  const activeChapter = activeModule?.chapters.find(c => c.id === activeChapterId);

  return (
    <main className="min-h-screen bg-[#000000] text-zinc-900 dark:text-white pt-32 px-6 pb-32 overflow-hidden relative selection:bg-blue-500/30">
      
      {/* Dynamic Background: Data Streams */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-80 z-0">
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/20 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/3"></div>
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/10 blur-[150px] rounded-full translate-y-1/3 -translate-x-1/3"></div>
         {[...Array(40)].map((_, i) => {
            const rTop = (getPseudoRandom(i * 11) * 100).toFixed(2);
            const rDur = 10 + getPseudoRandom(i * 17) * 15;
            const rDelay = getPseudoRandom(i * 19) * -30;
            const rWidth = (150 + getPseudoRandom(i * 23) * 400).toFixed(2);
            const isCyan = getPseudoRandom(i * 29) > 0.5;
            
            return (
               <motion.div 
                 key={`stream-${i}`}
                 initial={{ x: "-100%" }}
                 animate={{ x: "2000%" }}
                 transition={{ duration: rDur, repeat: Infinity, ease: "linear", delay: rDelay }}
                 className={`absolute h-[3px] rounded-full ${isCyan ? 'shadow-[0_0_30px_rgba(34,211,238,1)]' : 'shadow-[0_0_30px_rgba(59,130,246,1)]'}`}
                 style={{ 
                    top: `${rTop}%`, 
                    width: `${rWidth}px`,
                    background: `linear-gradient(to right, transparent, ${isCyan ? '#22d3ee' : '#3b82f6'})`
                 }}
               />
            );
         })}
      </div>

      <div className={`max-w-7xl mx-auto relative ${tutorialStep === 6 ? 'z-[70]' : 'z-10'}`}>
        
        <TutorialOverlay activeSteps={[6]} />

        {/* Hero Section */}
        <div className={`flex flex-col items-center justify-center text-center w-full max-w-6xl pointer-events-auto mt-12 mb-24 mx-auto relative ${tutorialStep === 6 ? 'z-[60] bg-black/60 rounded-[3rem] p-12 ring-2 ring-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.3)]' : ''}`}>
           <TutorialTooltip 
              step={6}
              title="Theory Library"
              description="This is the Theory Library. A massive knowledge base of music theory. You have successfully completed the Grand Tour."
              icon={<BookOpen className="w-4 h-4 text-cyan-400" />}
              position="bottom"
           />
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] xl:text-[5.5rem] tracking-tighter text-center leading-[1.05] mb-6 px-4 md:px-8 whitespace-nowrap relative z-10">
            <span className="font-extrabold text-zinc-900 dark:text-white block">Master the rules of music.</span>
            <span className="font-extrabold text-zinc-900 dark:text-white">Then break them as a </span>
            <span className="italic font-light text-transparent bg-clip-text bg-[linear-gradient(to_right,#06b6d4,#3b82f6,#ffffff,#3b82f6,#06b6d4)] bg-[length:200%_auto] pr-2 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" style={{ animation: 'flow 2s linear infinite' }}>
              {text}
            </span>
            <span className="inline-block w-[6px] h-[0.7em] bg-white animate-pulse rounded-full opacity-80 ml-2 align-baseline"></span>
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 font-light max-w-2xl mt-4 relative z-10">
            Master the language of music through interactive exploration. Build chords, understand harmony, and decode genres.
          </p>
        </div>

      </div>

      <div className="max-w-[1400px] mx-auto mt-12 mb-8 px-6 relative z-40">
         {/* Sleek Global Search Bar */}
         <div className="relative max-w-3xl mx-auto">
            {/* Animated Gradient Glow */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 opacity-30 blur-lg animate-pulse"></div>
            
            {/* Gradient Border Container */}
            <div className="relative p-[2px] rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-[length:200%_auto]" style={{ animation: 'flow 3s linear infinite' }}>
               <div className="relative bg-white dark:bg-black/80 backdrop-blur-md rounded-full flex items-center shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden">
                  <Search className="absolute left-6 w-6 h-6 text-cyan-400" />
                  <input 
                     type="text" 
                     placeholder="Search modules, chapters, or specific topics..." 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     onFocus={() => setIsSearchFocused(true)}
                     onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                     className="w-full bg-transparent py-5 pl-16 pr-6 text-lg text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none"
                  />
               </div>
            </div>

            {/* Google-style Dropdown Results */}
            <AnimatePresence>
               {isSearchFocused && searchQuery.trim().length > 0 && (
                  <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: 10 }}
                     transition={{ duration: 0.2 }}
                     className="absolute top-full left-0 right-0 mt-4 bg-[#0a0a0a]/95 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden max-h-[400px] overflow-y-auto custom-scrollbar z-50"
                  >
                     {flatSearchResults.length > 0 ? (
                        <div className="p-2">
                           {flatSearchResults.map((result, i) => (
                              <button
                                 key={i}
                                 onClick={() => {
                                    setActiveModuleId(result.moduleId);
                                    setActiveChapterId(result.chapterId);
                                    setSearchQuery("");
                                    setIsSearchFocused(false);
                                 }}
                                 className="w-full text-left p-4 hover:bg-black/5 dark:bg-white/5 rounded-2xl transition-colors border-b border-black/10 dark:border-white/10 last:border-0 group"
                              >
                                 <div className="text-[10px] font-bold text-cyan-500/80 mb-1 tracking-widest uppercase">{result.moduleTitle}</div>
                                 <div className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-cyan-400 transition-colors">{result.chapterTitle}</div>
                                 {result.snippetHtml && (
                                    <div 
                                       className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 font-serif italic"
                                       dangerouslySetInnerHTML={{ __html: result.snippetHtml }}
                                    />
                                 )}
                              </button>
                           ))}
                        </div>
                     ) : (
                        <div className="p-8 text-center text-zinc-600 dark:text-zinc-400">
                           No results found for <span className="text-zinc-900 dark:text-white">"{searchQuery}"</span>
                        </div>
                     )}
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>

      <div className="max-w-[1400px] mx-auto mt-12 relative z-10 flex flex-col lg:flex-row gap-8 h-[800px] lg:h-[calc(100vh-160px)] mb-32">
          
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-96 shrink-0 bg-white/[0.06] backdrop-blur-md border border-black/10 dark:border-white/10 rounded-[2rem] overflow-hidden flex flex-col shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_20px_40px_rgba(0,0,0,0.5)] h-full z-20">
             <div className="p-6 border-b border-black/10 dark:border-white/10">
                <h2 className="text-xl font-bold tracking-tight">Modules</h2>
             </div>
             
             <div className="overflow-y-auto flex-1 p-4 space-y-4 custom-scrollbar">
                {filteredModules.map((mod, index) => (
                   <div key={mod.id} className="space-y-1">
                      <button 
                         onClick={() => {
                            setActiveModuleId(mod.id);
                            setActiveChapterId(mod.chapters[0].id);
                         }}
                         className={`w-full text-left px-4 py-3 rounded-xl transition-all font-bold text-sm tracking-wide ${activeModuleId === mod.id ? 'bg-blue-500/10 text-cyan-400' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white hover:bg-black/5 dark:bg-white/5'}`}
                      >
                         {mod.title}
                      </button>
                      
                      {/* Sub-chapters */}
                      <AnimatePresence>
                         {activeModuleId === mod.id && (
                            <motion.div 
                               initial={{ height: 0, opacity: 0 }}
                               animate={{ height: "auto", opacity: 1 }}
                               exit={{ height: 0, opacity: 0 }}
                               className="overflow-hidden pl-4 pr-2 space-y-1"
                            >
                               {mod.chapters.map(chapter => (
                                  <button
                                     key={chapter.id}
                                     onClick={() => setActiveChapterId(chapter.id)}
                                     className={`w-full text-left px-4 py-2.5 rounded-lg transition-all text-sm flex items-center justify-between ${activeChapterId === chapter.id ? 'bg-black/5 dark:bg-white/5 text-zinc-900 dark:text-white font-semibold' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:bg-white/5'}`}
                                  >
                                     <span className="truncate pr-2">{chapter.title}</span>
                                     {activeChapterId === chapter.id && <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0" />}
                                  </button>
                               ))}
                            </motion.div>
                         )}
                      </AnimatePresence>
                   </div>
                ))}
             </div>
          </div>

          {/* Main Reading Pane */}
          <div className="flex-1 bg-white/[0.06] backdrop-blur-md border border-black/10 dark:border-white/10 rounded-[2rem] overflow-hidden h-full shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_20px_40px_rgba(0,0,0,0.5)] relative">
             <div className="w-full h-full overflow-y-auto p-8 md:p-12 custom-scrollbar">
                <div className="max-w-3xl mx-auto">
                   {activeModule && (
                   <div className="mb-4 text-cyan-400 font-semibold tracking-widest uppercase text-sm">
                      {activeModule.title}
                   </div>
                )}
                
                {activeChapter && (
                   <motion.div 
                      key={activeChapter.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                   >
                      <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-6 mb-12 border border-black/10 dark:border-white/10">
                            <h2 className="text-3xl font-black text-zinc-900 dark:text-white">{activeChapter.title}</h2>
                            <div className="flex flex-wrap gap-2 mt-4">
                               {activeChapter.topics.map((topic, i) => (
                                  <span key={i} className="px-3 py-1 bg-blue-500/20 text-cyan-400 text-xs font-bold rounded-full border border-blue-500/30">
                                     {topic}
                                  </span>
                               ))}
                            </div>
                      </div>

                      {/* Content Placeholder (Will be filled in Phase 2) */}
                      <div className="prose prose-invert prose-lg max-w-none mb-12">
                         {activeChapter.content ? (
                            <div dangerouslySetInnerHTML={{ __html: activeChapter.content }} />
                         ) : (
                            <p className="text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
                               This chapter is currently under construction. Check back soon for deep, interactive explanations of these concepts.
                            </p>
                         )}
                      </div>

                      {/* Interactive Widget Area */}
                      {["clickable-keyboard", "highlight-notes", "play-octaves"].includes(activeChapter.interactiveId || "") && <CourseKeyboard />}
                      {activeChapter.interactiveId && activeChapter.interactiveId.startsWith("interval-trainer") && <IntervalVisualizer />}
                      {activeChapter.interactiveId === "scale-visualizer" && <CourseScaleVisualizer />}
                      {activeChapter.interactiveId === "circle-interactive" && (
                         <div className="bg-white dark:bg-black rounded-3xl overflow-hidden border border-black/10 dark:border-white/10">
                            <CircleOfFifths />
                         </div>
                      )}
                      {activeChapter.interactiveId === "chord-builder" && <CourseChordBuilder />}
                      {activeChapter.interactiveId === "functional-harmony" && <FunctionalHarmony />}
                      {activeChapter.interactiveId === "cadence-player" && <CadencePlayer />}
                      {activeChapter.interactiveId === "classic-progressions" && <ClassicProgressions />}
                      {activeChapter.interactiveId === "genre-progressions" && <GenreProgressions />}
                      {activeChapter.interactiveId === "mode-switcher" && <ModeSwitcher />}
                      {activeChapter.interactiveId === "melody-sandbox" && <MelodySandbox />}
                      {activeChapter.interactiveId === "motif-developer" && <MotifDeveloper />}
                      {activeChapter.interactiveId === "time-signatures" && <TimeSignatures />}
                      {activeChapter.interactiveId === "syncopation-trainer" && <SyncopationTrainer />}
                      {activeChapter.interactiveId === "ear-trainer" && <EarTrainer />}
                      {activeChapter.interactiveId === "borrowed-chords" && <BorrowedChords />}
                      {activeChapter.interactiveId === "genre-deconstructor" && <GenreDeconstructor />}
                      
                      {activeChapter.interactiveId && !["clickable-keyboard", "highlight-notes", "play-octaves", "scale-visualizer", "circle-interactive", "chord-builder", "functional-harmony", "cadence-player", "classic-progressions", "genre-progressions", "mode-switcher", "melody-sandbox", "motif-developer", "time-signatures", "syncopation-trainer", "ear-trainer", "borrowed-chords", "genre-deconstructor"].includes(activeChapter.interactiveId) && !activeChapter.interactiveId.startsWith("interval-trainer") && (
                         <div className="mt-12 p-8 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-black/10 dark:border-white/10 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                            
                            <PlayCircle className="w-16 h-16 text-zinc-900 dark:text-white/20 mb-4" />
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 z-10">Interactive Sandbox</h3>
                            <p className="text-zinc-600 dark:text-zinc-400 text-center max-w-md z-10">
                               An interactive widget for <span className="text-cyan-400 font-semibold">{activeChapter.interactiveId}</span> will appear here in the next phase.
                            </p>
                         </div>
                      )}
                   </motion.div>
                )}
              </div>
           </div>
        </div>
      </div>
    </main>
  );
}

export default function CoursePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#000000] text-zinc-900 dark:text-white pt-32 px-6 flex items-center justify-center">Loading Library...</div>}>
      <CoursePageContent />
    </Suspense>
  );
}
