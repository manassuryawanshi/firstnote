"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Play, Square, Download, Wand2, Plus, Minus, Maximize, Trash2, Undo, ChevronDown } from "lucide-react";
import * as Tone from "tone";
import { Chord, Key, Note, Interval, Progression } from "@tonaljs/tonal";
// @ts-ignore
import MidiWriter from "midi-writer-js";
import { motion } from "framer-motion";
import { 
  ReactFlow, 
  Background, 
  Controls, 
  applyNodeChanges, 
  applyEdgeChanges,
  Node,
  Edge,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ChordNode from "./ChordNode";

const nodeTypes = { chord: ChordNode };

const MOODS: Record<string, { scale: "major" | "minor", chords: string[][] }> = {
  happy: { scale: "major", chords: [["I", "IV", "V", "I"], ["I", "VIm", "IV", "V"], ["I", "V", "VIm", "IV"]] },
  sad: { scale: "minor", chords: [["Im", "bVI", "bIII", "bVII"], ["Im", "IVm", "Vm", "Im"], ["Im", "bVII", "bVI", "V"]] },
  epic: { scale: "minor", chords: [["Im", "bVI", "bIII", "bVII"], ["Im", "bVII", "bVI", "bVII"], ["Im", "Vm", "bVI", "bVII"]] },
  romantic: { scale: "major", chords: [["I", "VIm", "IIm", "V"], ["I", "IV", "I", "V"], ["I", "IIIm", "IV", "V"]] },
  dark: { scale: "minor", chords: [["Im", "bII", "Im", "V"], ["Im", "IVm", "Im", "V"], ["Im", "bVI", "IVm", "V"]] },
  dreamy: { scale: "major", chords: [["I", "IV", "IIm", "V"], ["I", "IIIm", "VIm", "IV"], ["I", "bIII", "bVI", "bII"]] }
};

const ROOTS = [
  "C", "Cm", "C#", "C#m", "D", "Dm", "Eb", "Ebm", "E", "Em", "F", "Fm", 
  "F#", "F#m", "G", "Gm", "G#", "G#m", "A", "Am", "Bb", "Bbm", "B", "Bm"
];

// Global sampler instance outside of React's render cycle
let globalSampler: Tone.Sampler | null = null;
const getSampler = () => {
  if (!globalSampler) {
    const SALAMANDER_BASE = "https://tonejs.github.io/audio/salamander/";
    globalSampler = new Tone.Sampler({
      urls: {
        A0: SALAMANDER_BASE + "A0.mp3",
        C1: SALAMANDER_BASE + "C1.mp3",
        "D#1": SALAMANDER_BASE + "Ds1.mp3",
        "F#1": SALAMANDER_BASE + "Fs1.mp3",
        A1: SALAMANDER_BASE + "A1.mp3",
        C2: SALAMANDER_BASE + "C2.mp3",
        "D#2": SALAMANDER_BASE + "Ds2.mp3",
        "F#2": SALAMANDER_BASE + "Fs2.mp3",
        A2: SALAMANDER_BASE + "A2.mp3",
        C3: SALAMANDER_BASE + "C3.mp3",
        "D#3": SALAMANDER_BASE + "Ds3.mp3",
        "F#3": SALAMANDER_BASE + "Fs3.mp3",
        A3: SALAMANDER_BASE + "A3.mp3",
        C4: SALAMANDER_BASE + "C4.mp3",
        "D#4": SALAMANDER_BASE + "Ds4.mp3",
        "F#4": SALAMANDER_BASE + "Fs4.mp3",
        A4: SALAMANDER_BASE + "A4.mp3",
        C5: SALAMANDER_BASE + "C5.mp3",
        "D#5": SALAMANDER_BASE + "Ds5.mp3",
        "F#5": SALAMANDER_BASE + "Fs5.mp3",
        A5: SALAMANDER_BASE + "A5.mp3",
        C6: SALAMANDER_BASE + "C6.mp3",
        "D#6": SALAMANDER_BASE + "Ds6.mp3",
        "F#6": SALAMANDER_BASE + "Fs6.mp3",
        A6: SALAMANDER_BASE + "A6.mp3",
        C7: SALAMANDER_BASE + "C7.mp3",
        "D#7": SALAMANDER_BASE + "Ds7.mp3",
        "F#7": SALAMANDER_BASE + "Fs7.mp3",
        A7: SALAMANDER_BASE + "A7.mp3",
        C8: SALAMANDER_BASE + "C8.mp3"
      },
      release: 1
    }).toDestination();
  }
  return globalSampler;
};

interface PianoProgressionBuilderProps {
  injectedProgression?: string[] | null;
  onClearInjection?: () => void;
}

export default function PianoProgressionBuilder({ injectedProgression, onClearInjection }: PianoProgressionBuilderProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [history, setHistory] = useState<{nodes: Node[], edges: Edge[]}[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [rfInstance, setRfInstance] = useState<any>(null);

  // Eagerly initialize the sampler on mount
  useEffect(() => {
     getSampler();
  }, []);

  const handleZoomIn = () => rfInstance?.zoomIn({ duration: 300 });
  const handleZoomOut = () => rfInstance?.zoomOut({ duration: 300 });
  const handleFitView = () => rfInstance?.fitView({ duration: 300, padding: 0.2 });

  // Quick Gen State
  const [qRoot, setQRoot] = useState("C");
  const [qMood, setQMood] = useState("happy");
  const [qLength, setQLength] = useState(4);
  const [transposeAmount, setTransposeAmount] = useState(0);

  const onNodesChange = useCallback((changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  const spawnGhosts = (parentId: string, parentRoot: string, position: {x: number, y: number}, isMinor: boolean = false) => {
    const pitchRoot = parentRoot.replace('m', '');
    
    // Clear existing ghosts
    setNodes(nds => nds.filter(n => !n.data.isGhost));
    setEdges(eds => eds.filter(e => !e.target.startsWith('ghost-')));

    // Generate 12 roots around the circle of fifths starting from the parent
    const roots = [];
    let current = pitchRoot;
    for (let i = 0; i < 12; i++) {
       roots.push(Note.simplify(current));
       current = Note.transpose(current, "P5");
    }

    const createdGhosts: Node[] = [];
    const angleStep = (2 * Math.PI) / 12;

    roots.forEach((rootNote, i) => {
      // Offset angle so the root is at the top (12 o'clock => -PI/2)
      let angle = (i * angleStep) - (Math.PI / 2);
      
      // Inner Ring: Major Chords
      createdGhosts.push({
        id: `ghost-${parentId}-M-${i}`,
        type: 'chord',
        parentId: parentId,
        position: { x: Math.cos(angle) * 180, y: Math.sin(angle) * 180 },
        data: { root: rootNote, quality: 'maj', colorType: 'major', isGhost: true, parentId },
        draggable: false
      });

      // Outer Ring: Parallel Minor Chords
      createdGhosts.push({
        id: `ghost-${parentId}-m-${i}`,
        type: 'chord',
        parentId: parentId,
        position: { x: Math.cos(angle) * 280, y: Math.sin(angle) * 280 },
        data: { root: rootNote, quality: 'minor', colorType: 'minor', isGhost: true, parentId },
        draggable: false
      });
    });

    setNodes(nds => [...nds, ...createdGhosts]);
  };

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    // Save history for undo
    setHistory([...history, { nodes, edges }]);

    if (node.data.isGhost) {
      // 1. Make this ghost solid
      const newId = `solid-${Date.now()}`;
      
      // Calculate absolute position since it was a child relative to parent
      const parentNode = nodes.find(n => n.id === node.data.parentId);
      const absolutePosition = {
         x: (parentNode?.position.x || 0) + node.position.x,
         y: (parentNode?.position.y || 0) + node.position.y
      };

      const solidNode = {
        ...node,
        id: newId,
        parentId: undefined, // Detach from parent
        position: absolutePosition,
        data: { ...node.data, isGhost: false, onDelete: (id: string) => handleDeleteNode(id) },
        draggable: true
      };

      // 2. Remove ALL ghost nodes (since activeNode is changing)
      const remainingNodes = nodes.filter(n => !n.data.isGhost);
      const remainingEdges = edges.filter(e => !e.target.startsWith('ghost-'));

      // 3. Create solid edge from parent
      const solidEdge = {
        id: `e-${node.data.parentId}-${newId}`,
        source: node.data.parentId as string,
        target: newId,
        style: { stroke: '#4ade80', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#4ade80' }
      };

      setNodes([...remainingNodes, solidNode]);
      setEdges([...remainingEdges, solidEdge]);
      setActiveNodeId(newId);

      // 4. Spawn new ghosts from this new solid node
      spawnGhosts(newId, (solidNode.data as any).root as string, solidNode.position, (solidNode.data as any).quality === 'minor');
    } else {
      // Clicking a solid node: toggle its ghost ring
      if (activeNodeId === node.id) {
         // It was active. Unselect it and collapse ghosts.
         setActiveNodeId(null);
         setNodes(nds => nds.filter(n => !n.data.isGhost));
      } else {
         // Select it and spawn its ghosts
         setActiveNodeId(node.id);
         spawnGhosts(node.id, (node.data as any).root as string, node.position, (node.data as any).quality === 'minor');
      }
    }
  };

  const onPaneClick = () => {
    // Clicking empty space collapses ghosts
    if (activeNodeId) {
       setActiveNodeId(null);
       setNodes(nds => nds.filter(n => !n.data.isGhost));
    }
  };

  const handleDeleteNode = (id: string) => {
    setNodes(nds => {
       const remaining = nds.filter(n => n.id !== id);
       // Also remove any ghost nodes that were attached to this
       return remaining.filter(n => n.data.parentId !== id);
    });
    setEdges(eds => eds.filter(e => e.source !== id && e.target !== id));
    setActiveNodeId(prev => prev === id ? null : prev);
  };

  const handleStartNode = (root: string) => {
    const isMinor = root.includes('m');
    const pitchRoot = root.replace('m', '');
    
    const startNode = {
      id: 'root-1',
      type: 'chord',
      position: { x: 0, y: 0 },
      data: { root: pitchRoot, quality: isMinor ? 'minor' : 'maj', colorType: isMinor ? 'minor' : 'major', isGhost: false, onDelete: (id: string) => handleDeleteNode(id) },
      draggable: true
    };
    setNodes([startNode]);
    setActiveNodeId('root-1');
    spawnGhosts('root-1', pitchRoot, { x: 0, y: 0 }, isMinor);
  };

  const clearAll = () => {
    setHistory([...history, { nodes, edges }]);
    setNodes([]);
    setEdges([]);
    setActiveNodeId(null);
    setTransposeAmount(0);
  };

  const handleTranspose = (semitones: number) => {
    setTransposeAmount(prev => prev + semitones);
    setNodes(nds => nds.map(n => {
      if (n.data.root) {
        const newRoot = Note.simplify(Note.transpose(n.data.root as string, Interval.fromSemitones(semitones)));
        return { ...n, data: { ...n.data, root: newRoot } };
      }
      return n;
    }));
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setNodes(previous.nodes);
    setEdges(previous.edges);
  };

  // Traces the active path by finding the deepest node and walking backwards
  const getActiveSequence = () => {
    if (nodes.length === 0) return [];
    
    let endNodeId = activeNodeId;
    if (!endNodeId) {
       // Find a solid node that has no outgoing solid edges (the deepest leaf)
       const solidNodes = nodes.filter(n => !n.data.isGhost);
       const nodesWithOutgoingEdges = edges.map(e => e.source);
       const leafNodes = solidNodes.filter(n => !nodesWithOutgoingEdges.includes(n.id));
       if (leafNodes.length > 0) {
          endNodeId = leafNodes[leafNodes.length - 1].id;
       } else if (solidNodes.length > 0) {
          endNodeId = solidNodes[solidNodes.length - 1].id;
       } else {
          return [];
       }
    }

    let current = nodes.find(n => n.id === endNodeId);
    if (!current || current.data.isGhost) return [];
    
    const path: {id: string, root: string, quality: string}[] = [];
    while (current) {
      const d = current.data as any;
      path.unshift({ id: current.id, root: d.root, quality: d.quality });
      const incomingEdge = edges.find(e => e.target === current?.id);
      current = incomingEdge ? nodes.find(n => n.id === incomingEdge.source) : undefined;
    }
    
    return path;
  };

  // Listen for Dictionary injection
  useEffect(() => {
    if (injectedProgression && injectedProgression.length > 0) {
      setHistory([...history, { nodes, edges }]);
      
      let newNodes: Node[] = [];
      let newEdges: Edge[] = [];
      
      injectedProgression.forEach((chordString, i) => {
         const parsed = Chord.get(chordString);
         const parsedTonic = parsed.tonic || "C";
         const quality = parsed.type === "major" ? "maj" : parsed.type === "minor" ? "minor" : parsed.type;
         let colorType = 'major';
         if (parsed.type === 'minor') colorType = 'minor';
         if (parsed.type === 'diminished') colorType = 'diminished';

         const id = `inject-${Date.now()}-${i}`;
         newNodes.push({
           id,
           type: 'chord',
           position: { x: i * 250, y: 0 },
           data: { root: parsedTonic || "C", quality, colorType, isGhost: false, onDelete: (id: string) => handleDeleteNode(id) } as any,
           draggable: true
         });

         if (i > 0) {
           newEdges.push({
             id: `e-inject-${i-1}-${i}`,
             source: newNodes[i-1].id,
             target: id,
             style: { stroke: '#4ade80', strokeWidth: 2 },
             markerEnd: { type: MarkerType.ArrowClosed, color: '#4ade80' }
           });
         }
      });
      
      setNodes(newNodes);
      setEdges(newEdges);
      setActiveNodeId(null);
      
      if (onClearInjection) onClearInjection();
    }
  }, [injectedProgression]);



  const playProgression = async () => {
    const sequence = getActiveSequence();
    if (isPlaying || sequence.length === 0) return;
    
    await Tone.start();
    const sampler = getSampler();
    setIsPlaying(true);
    
    Tone.loaded().then(() => {
       let now = Tone.now();
       sequence.forEach((chordObj) => {
          const parsedType = chordObj.quality === 'maj' ? 'M' : chordObj.quality === 'minor' ? 'm' : chordObj.quality;
          const parsed = Chord.getChord(parsedType, chordObj.root + "4");
          
          if (!parsed.empty) {
            sampler.triggerAttackRelease(parsed.notes, "2n", now);
            Tone.Draw.schedule(() => {
               setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, isPlaying: n.id === chordObj.id } })));
            }, now);
          }
          now += 1;
       });

       Tone.Draw.schedule(() => {
          setIsPlaying(false);
          setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, isPlaying: false } })));
       }, now);
    });
  };

  const exportMidi = () => {
    const sequence = getActiveSequence();
    if (sequence.length === 0) return;
    
    const track = new MidiWriter.Track();
    track.addEvent(new MidiWriter.ProgramChangeEvent({instrument: 1}));

    sequence.forEach((chordObj) => {
       const parsedType = chordObj.quality === 'maj' ? 'M' : chordObj.quality === 'minor' ? 'm' : chordObj.quality;
       const parsed = Chord.getChord(parsedType, chordObj.root + "4");
       if (!parsed.empty) {
          track.addEvent(new MidiWriter.NoteEvent({ pitch: parsed.notes, duration: '2' }));
       }
    });

    const write = new MidiWriter.Writer(track);
    const link = document.createElement('a');
    link.href = write.dataUri();
    link.download = 'sandbox-progression.mid';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateQuick = () => {
    const moodObj = MOODS[qMood] || MOODS["happy"];
    const list = moodObj.chords;
    const selectedRoman = list[Math.floor(Math.random() * list.length)];
    
    // Determine exact pitch for tonal js processing
    const pitchRoot = qRoot.replace('m', '');
    const isMinor = qRoot.includes('m');
    const scaleString = isMinor ? `${pitchRoot} minor` : `${pitchRoot} major`;
    
    // Tonal.js Progression evaluates roman numerals against a scale!
    let chords = Progression.fromRomanNumerals(pitchRoot, selectedRoman);
    
    let newNodes: Node[] = [];
    let newEdges: Edge[] = [];
    
    for (let i = 0; i < qLength; i++) {
      const chordSymbol = chords[i % chords.length];
      const parsed = Chord.get(chordSymbol);
      let quality = parsed.type === "M" ? "maj" : parsed.type === "m" ? "minor" : parsed.type;
      
      let colorType = 'major';
      if (parsed.type === 'm' || parsed.type === 'minor') colorType = 'minor';
      if (parsed.type === 'dim' || parsed.type === 'diminished') colorType = 'diminished';

      const id = `quick-${Date.now()}-${i}`;
      newNodes.push({
        id,
        type: 'chord',
        position: { x: i * 250, y: 0 },
        data: { root: parsed.tonic || "C", quality, colorType, isGhost: false, onDelete: (id: string) => handleDeleteNode(id) } as any,
        draggable: true
      });

      if (i > 0) {
        newEdges.push({
          id: `e-quick-${i-1}-${i}`,
          source: newNodes[i-1].id,
          target: id,
          style: { stroke: '#4ade80', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#4ade80' }
        });
      }
    }
    
    setNodes(newNodes);
    setEdges(newEdges);
    setActiveNodeId(null);
  };

  return (
    <div className="space-y-8">
      {/* 1. Quick Generator */}
      <div className="relative rounded-[3rem] p-[2px] overflow-hidden group shadow-2xl [transform:translateZ(0)]">
         <div className="absolute w-[4000px] h-[4000px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_0deg,rgba(34,197,94,0.3)_0%,rgba(255,255,255,0.9)_50%,rgba(34,197,94,0.3)_100%)] opacity-30 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
         <div className="relative bg-[#0a0a0a]/95 backdrop-blur-md rounded-[calc(3rem-2px)] p-8 h-full w-full overflow-hidden">
            <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-green-500/10 blur-[100px] rounded-full pointer-events-none"></div>
            
            <div className="flex items-center gap-2 mb-8 relative z-10">
               <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center shadow-inner">
                  <Wand2 className="w-5 h-5 text-green-400" />
               </div>
               <h3 className="text-2xl font-black text-zinc-900 dark:text-white">AI Quick Generator</h3>
            </div>
            
            <div className="flex flex-wrap items-end gap-6 relative z-10">
            <div className="space-y-2 flex-1 min-w-[150px] group">
               <label className="text-xs text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-widest group-hover:text-green-500 transition-colors">Root</label>
               <div className="relative">
                 <select 
                   value={qRoot} onChange={e => setQRoot(e.target.value)}
                   className="w-full bg-white dark:bg-black/60 border border-black/10 dark:border-white/10 rounded-xl py-4 px-6 text-zinc-900 dark:text-white font-bold focus:outline-none focus:border-green-500 transition-colors hover:border-white/20 cursor-pointer shadow-inner appearance-none"
                 >
                   {ROOTS.map(r => <option key={r} value={r}>{r}</option>)}
                 </select>
                 <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <ChevronDown className="w-5 h-5 text-zinc-600 dark:text-zinc-400 group-hover:text-green-400 transition-colors" />
                 </div>
               </div>
            </div>
            
            <div className="space-y-2 flex-1 min-w-[150px] group">
               <label className="text-xs text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-widest group-hover:text-green-500 transition-colors">Mood / Style</label>
               <div className="relative">
                 <select value={qMood} onChange={(e) => setQMood(e.target.value)} className="w-full bg-white dark:bg-black/60 border border-black/10 dark:border-white/10 rounded-xl py-4 px-6 text-zinc-900 dark:text-white font-bold focus:outline-none focus:border-green-500 transition-colors hover:border-white/20 cursor-pointer shadow-inner appearance-none">
                   <option value="happy">Happy</option>
                   <option value="sad">Sad</option>
                   <option value="epic">Epic</option>
                   <option value="romantic">Romantic</option>
                   <option value="dark">Dark</option>
                   <option value="dreamy">Dreamy</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                   <ChevronDown className="w-5 h-5 text-zinc-600 dark:text-zinc-400 group-hover:text-green-400 transition-colors" />
                </div>
               </div>
            </div>
            
            <div className="space-y-2 flex-1 min-w-[150px] group">
               <label className="text-xs text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-widest group-hover:text-green-500 transition-colors">Length</label>
               <div className="relative">
                 <select 
                   value={qLength} onChange={e => setQLength(parseInt(e.target.value))}
                   className="w-full bg-white dark:bg-black/60 border border-black/10 dark:border-white/10 rounded-xl py-4 px-6 text-zinc-900 dark:text-white font-bold focus:outline-none focus:border-green-500 transition-colors hover:border-white/20 cursor-pointer shadow-inner appearance-none"
                 >
                   {[2, 4, 8, 16].map(l => <option key={l} value={l}>{l} Chords</option>)}
                 </select>
                 <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <ChevronDown className="w-5 h-5 text-zinc-600 dark:text-zinc-400 group-hover:text-green-400 transition-colors" />
                 </div>
               </div>
            </div>

            <button 
              onClick={generateQuick}
              className="px-8 py-4 bg-green-500 text-black hover:bg-green-400 rounded-xl font-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2"
            >
              <Wand2 className="w-5 h-5 fill-current" /> Generate to Sandbox
            </button>
         </div>
      </div>
      </div>

      {/* 2. Sandbox Canvas */}
      <div className="relative rounded-[3rem] p-[2px] overflow-hidden group shadow-2xl [transform:translateZ(0)]">
         <div className="absolute w-[4000px] h-[4000px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_0deg,rgba(34,197,94,0.3)_0%,rgba(255,255,255,0.9)_50%,rgba(34,197,94,0.3)_100%)] opacity-30 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
         <div className="h-[800px] w-full rounded-[calc(3rem-2px)] overflow-hidden bg-[#0a0a0a]/95 backdrop-blur-md relative flex flex-col z-10">
        {/* Top Toolbar */}
        <div className="bg-white dark:bg-black/40 border-b border-black/10 dark:border-white/10 p-4 flex items-center justify-between shrink-0 shadow-sm z-10">
           <div className="flex items-center gap-4">
              <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-green-400" /> Progression Sandbox
              </h3>
              <div className="h-6 w-[1px] bg-black/5 dark:bg-white/5"></div>
           </div>

           <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl p-1 shadow-inner mr-4 group">
                 <button 
                   onClick={() => handleTranspose(-1)}
                   className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 font-bold text-sm transition-colors hover:text-zinc-900 dark:text-white"
                 >-</button>
                 <div className="w-8 text-center text-xs font-bold text-green-400">
                    {transposeAmount > 0 ? `+${transposeAmount}` : transposeAmount}
                 </div>
                 <button 
                   onClick={() => handleTranspose(1)}
                   className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 font-bold text-sm transition-colors hover:text-zinc-900 dark:text-white"
                 >+</button>
              </div>

              <button onClick={handleUndo} disabled={history.length === 0} className="p-2.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white hover:bg-black/5 dark:bg-white/5 rounded-xl disabled:opacity-30 transition-all active:scale-95"><Undo className="w-5 h-5" /></button>
              <button onClick={clearAll} className="p-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all active:scale-95"><Trash2 className="w-5 h-5" /></button>
              <button 
                 onClick={exportMidi} 
                 disabled={nodes.length === 0}
                 className="px-6 py-2.5 bg-green-500 hover:bg-green-400 text-black font-black rounded-xl text-sm flex items-center gap-2 ml-2 transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed disabled:shadow-none"
              >
                 <Download className="w-4 h-4" /> Export MIDI
              </button>
           </div>
        </div>

        {/* Legend */}
        <div className="absolute top-24 left-8 z-10 pointer-events-none flex flex-col gap-2 bg-white dark:bg-black/40 p-4 rounded-2xl border border-black/10 dark:border-white/10 backdrop-blur-md">
           <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400"><div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div> Major</div>
           <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400"><div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div> Minor</div>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1 w-full h-full relative overflow-hidden">
           {nodes.length === 0 ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-auto bg-white dark:bg-black/20 backdrop-blur-md">
                <div className="bg-white dark:bg-black/60 border border-black/10 dark:border-white/10 rounded-[2rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md flex flex-col items-center text-center max-w-md transform transition-all hover:scale-[1.02]">
                   <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                      <Plus className="w-8 h-8 text-green-400" />
                   </div>
                   <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight">Start your progression</h3>
                   <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-8 font-light leading-relaxed">Select a starting root note to initialize the infinite Sandbox canvas.</p>
                   
                   <div className="relative group w-full">
                      <select 
                         className="w-full bg-white dark:bg-black/80 border border-black/10 dark:border-white/10 rounded-xl px-6 py-4 text-zinc-900 dark:text-white font-bold focus:outline-none focus:border-green-500 transition-all hover:border-white/30 cursor-pointer appearance-none text-center shadow-inner"
                         onChange={(e) => handleStartNode(e.target.value)}
                         defaultValue=""
                      >
                         <option value="" disabled>Select Root Note</option>
                         {ROOTS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
                         <ChevronDown className="w-5 h-5 text-zinc-600 dark:text-zinc-400 group-hover:text-green-400 transition-colors" />
                      </div>
                   </div>
                </div>
             </div>
           ) : (
             <ReactFlow 
               nodes={nodes}
               edges={edges}
               onNodesChange={onNodesChange}
               onEdgesChange={onEdgesChange}
               onNodeClick={handleNodeClick}
               onPaneClick={onPaneClick}
               onInit={setRfInstance}
               nodeTypes={nodeTypes}
               proOptions={{ hideAttribution: true }}
               fitView
               minZoom={0.2}
               maxZoom={2}
               className="bg-[#0a0a0a]"
             >
               <Background color="#22c55e" gap={20} size={1} className="opacity-10" />
             </ReactFlow>
           )}
        </div>

        {/* Bottom Overlay UI */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-10 flex justify-between items-center pointer-events-none bg-gradient-to-t from-black/80 to-transparent">
          {/* Custom Controls */}
          {nodes.length > 0 ? (
             <div className="flex gap-2 pointer-events-auto">
                <button onClick={handleZoomIn} className="w-12 h-12 bg-white dark:bg-black border border-black/10 dark:border-white/10 hover:border-green-500 hover:text-green-400 text-zinc-900 dark:text-white rounded-xl flex items-center justify-center transition-all backdrop-blur-md shadow-lg shadow-black/50 group">
                  <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                <button onClick={handleZoomOut} className="w-12 h-12 bg-white dark:bg-black border border-black/10 dark:border-white/10 hover:border-green-500 hover:text-green-400 text-zinc-900 dark:text-white rounded-xl flex items-center justify-center transition-all backdrop-blur-md shadow-lg shadow-black/50 group">
                  <Minus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                <button onClick={handleFitView} className="w-12 h-12 bg-white dark:bg-black border border-black/10 dark:border-white/10 hover:border-green-500 hover:text-green-400 text-zinc-900 dark:text-white rounded-xl flex items-center justify-center transition-all backdrop-blur-md shadow-lg shadow-black/50 group">
                  <Maximize className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
             </div>
          ) : <div></div>}

          <div className="flex gap-4 pointer-events-auto">
             <button 
                onClick={playProgression}
                disabled={isPlaying || nodes.length === 0}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${isPlaying ? 'bg-text-muted text-zinc-600 dark:text-zinc-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-400 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]'}`}
              >
                {isPlaying ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                {isPlaying ? 'Playing...' : 'Play'}
             </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
